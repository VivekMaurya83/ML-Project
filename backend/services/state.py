import os
import pandas as pd
from config import DATA_DIR, SAVED_MODELS_DIR, PREPROCESSOR_PATH
from ml_pipeline.data_processing import PreprocessingPipeline
from ml_pipeline.models import FoodDemandModels

# In-memory Application State Cache
state = {
    "data_loaded": False,
    "preprocessed": False,
    "is_trained": False,
    "training_status": "idle",  # "idle", "training", "completed", "error"
    "training_logs": [],
    "train_sample_size": 10000,
    "val_split": 0.2,
    "df_merged_shape": (0, 0),
    "df_train_raw": None,
    "df_meal": None,
    "df_center": None,
    "df_merged": None,
    "pipeline": None,
    "models": None,
    "metrics": None,
    "weights": None,
    "feature_importances": [],
    "eda_cache": {},
    "stats": {}
}

def load_initial_data_files():
    """Loads raw CSV files from DATA_DIR and computes high-level stats."""
    try:
        train_csv = os.path.join(DATA_DIR, "train.csv")
        meal_csv = os.path.join(DATA_DIR, "meal_info.csv")
        center_csv = os.path.join(DATA_DIR, "fulfilment_center_info.csv")

        if not (os.path.exists(train_csv) and os.path.exists(meal_csv) and os.path.exists(center_csv)):
            print(f"Warning: Data files missing in {DATA_DIR}")
            return

        state["df_train_raw"] = pd.read_csv(train_csv)
        state["df_meal"] = pd.read_csv(meal_csv)
        state["df_center"] = pd.read_csv(center_csv)
        state["data_loaded"] = True

        state["stats"] = {
            "train_rows": len(state["df_train_raw"]),
            "meal_rows": len(state["df_meal"]),
            "center_rows": len(state["df_center"]),
            "categories_count": int(state["df_meal"]['category'].nunique()),
            "cuisines_count": int(state["df_meal"]['cuisine'].nunique()),
            "center_types_count": int(state["df_center"]['center_type'].nunique()),
            "average_orders": float(state["df_train_raw"]['num_orders'].mean()),
            "min_orders": float(state["df_train_raw"]['num_orders'].min()),
            "max_orders": float(state["df_train_raw"]['num_orders'].max()),
        }
    except Exception as e:
        print(f"Error loading initial CSV data: {str(e)}")

def try_load_saved_artifacts():
    """Loads previously saved ML models and preprocessor from disk on startup."""
    try:
        rf_path = os.path.join(SAVED_MODELS_DIR, "rf_model.joblib")
        if os.path.exists(PREPROCESSOR_PATH) and os.path.exists(rf_path):
            state["pipeline"] = PreprocessingPipeline.load(PREPROCESSOR_PATH)
            state["models"] = FoodDemandModels.load(SAVED_MODELS_DIR)
            state["metrics"] = state["models"].metrics
            state["weights"] = state["models"].weights
            feat_names = getattr(state["pipeline"], "feature_names", None)
            state["feature_importances"] = state["models"].get_feature_importances(feat_names)
            state["is_trained"] = True
            state["training_status"] = "completed"
            print("Successfully loaded saved ML models and preprocessors from disk.")
    except Exception as e:
        print(f"No active pre-trained models loaded on startup: {str(e)}")
