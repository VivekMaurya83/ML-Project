import os
import time
import datetime
import pandas as pd
from sklearn.model_selection import train_test_split

from config import DATA_DIR, PROCESSED_DATA_DIR, PROCESSED_DATA_CSV
from ml_pipeline.data_processing import (
    load_and_merge_data,
    feature_engineering,
    PreprocessingPipeline
)
from services.state import state, load_initial_data_files
from services.eda_service import precompute_eda_cache

def execute_preprocessing_pipeline(sample_size: int = 10000, val_split: float = 0.2) -> dict:
    """
    Executes the end-to-end data preprocessing pipeline with live logging,
    on-disk persistence of the engineered dataset, and preview record generation.
    """
    start_time = time.time()
    logs = []

    def log(msg: str):
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        logs.append(f"[{timestamp}] {msg}")

    if not state["data_loaded"]:
        log("Loading raw dataset files from foodDemand_train/...")
        load_initial_data_files()

    # Step 1: Relational Merge
    log(f"Step 1/8: Ingesting raw tables (train: {len(state['df_train_raw']):,} rows, meal_info: {len(state['df_meal'])} items, centers: {len(state['df_center'])} centers)...")
    df = load_and_merge_data(DATA_DIR)
    state["df_merged_shape"] = df.shape
    log(f"-> Relational merge successful: generated unified dataset of {df.shape[0]:,} rows x {df.shape[1]} columns.")

    # Step 2: Feature Engineering
    log("Step 2/8: Generating derived economic & promotional features...")
    df = feature_engineering(df)
    log("-> Engineered features: price_difference, discount_percent, promotion_intensity.")

    # Step 3: Sampling
    log(f"Step 3/8: Sampling {sample_size:,} rows for reproducible training (random_state=42)...")
    if sample_size < len(df):
        df_sampled = df.sample(n=sample_size, random_state=42).reset_index(drop=True)
    else:
        df_sampled = df.copy()
    log(f"-> Active sample created with {len(df_sampled):,} rows.")

    # Step 4: Train / Validation Split
    log(f"Step 4/8: Splitting sample into Train ({(1 - val_split)*100:.0f}%) and Validation ({val_split*100:.0f}%) subsets...")
    X = df_sampled.drop(columns=['num_orders', 'id'])
    y = df_sampled['num_orders']

    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=val_split, random_state=42
    )
    log(f"-> Split complete: Train set = {len(X_train):,} rows | Validation set = {len(X_val):,} rows.")

    # Step 5: Encoding & Scaling
    log("Step 5/8: Fitting PreprocessingPipeline (One-Hot Encoding categories + StandardScaler on numericals)...")
    pipeline = PreprocessingPipeline()
    X_train_processed = pipeline.fit_transform(X_train)
    X_val_processed = pipeline.transform(X_val)
    log(f"-> Transformation complete: Encoded feature matrix contains {len(pipeline.feature_names)} features.")

    # Step 6: Target Log Transformation & State Update
    log("Step 6/8: Applying log1p transformation to num_orders to stabilize residual variance...")
    state["pipeline"] = pipeline
    state["X_train_processed"] = X_train_processed
    state["X_val_processed"] = X_val_processed
    state["y_train"] = y_train.values
    state["y_val"] = y_val.values
    state["train_sample_size"] = sample_size
    state["val_split"] = val_split
    state["preprocessed"] = True
    state["df_merged"] = df
    log("-> Target log-scaling registered in state cache for regression training.")

    # Step 7: On-Disk Dataset Persistence
    log(f"Step 7/8: Persisting sampled & engineered dataset to disk at {PROCESSED_DATA_CSV}...")
    df_sampled.to_csv(PROCESSED_DATA_CSV, index=False)
    file_size_bytes = os.path.getsize(PROCESSED_DATA_CSV)
    file_size_kb = round(file_size_bytes / 1024, 1)
    file_size_mb = round(file_size_bytes / (1024 * 1024), 2)
    log(f"-> Saved {len(df_sampled):,} rows to disk ({file_size_mb} MB, {file_size_kb} KB). File is ready for inspection/download.")

    # Step 8: Precompute EDA Cache
    log("Step 8/8: Precomputing EDA chart distributions & correlation matrix...")
    precompute_eda_cache(df)
    log("-> EDA cache updated.")

    total_time = round(time.time() - start_time, 2)
    log(f"SUCCESS: Preprocessing pipeline completed in {total_time} seconds! Ready for model training.")

    # Prepare preview rows for UI inspection
    preview_cols = [
        'id', 'week', 'center_id', 'meal_id', 'checkout_price', 'base_price',
        'price_difference', 'discount_percent', 'category', 'cuisine',
        'center_type', 'op_area', 'num_orders'
    ]
    available_cols = [c for c in preview_cols if c in df_sampled.columns]
    preview_df = df_sampled[available_cols].head(10).copy()
    
    # Format floating point numbers for clean table display
    for col in ['checkout_price', 'base_price', 'price_difference', 'discount_percent', 'op_area']:
        if col in preview_df.columns:
            preview_df[col] = preview_df[col].round(2)

    preview_rows = preview_df.to_dict(orient='records')

    return {
        "success": True,
        "message": f"Successfully preprocessed dataset. Sampled {sample_size:,} rows and saved to disk.",
        "merged_rows": df.shape[0],
        "train_rows": X_train.shape[0],
        "val_rows": X_val.shape[0],
        "num_features": len(pipeline.feature_names),
        "execution_time_sec": total_time,
        "logs": logs,
        "saved_file": {
            "path": PROCESSED_DATA_CSV,
            "filename": "train_sampled_engineered.csv",
            "size_kb": file_size_kb,
            "size_mb": file_size_mb,
            "total_rows": len(df_sampled)
        },
        "preview_columns": available_cols,
        "preview_rows": preview_rows
    }
