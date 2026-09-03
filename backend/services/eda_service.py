import pandas as pd
import numpy as np
from config import DATA_DIR
from ml_pipeline.data_processing import load_and_merge_data, feature_engineering
from services.state import state

def precompute_eda_cache(df: pd.DataFrame):
    """Generates analytical summaries for EDA charts displayed on the frontend."""
    # 1. Feature correlation matrix (sampled for speed)
    df_corr_sample = df.sample(n=min(50000, len(df)), random_state=42)
    numeric_cols_for_corr = [
        'week', 'checkout_price', 'base_price', 'op_area',
        'price_difference', 'discount_percent', 'promotion_intensity', 'num_orders'
    ]
    corr_matrix = df_corr_sample[numeric_cols_for_corr].corr().round(2).fillna(0).values.tolist()

    # 2. Orders distribution histogram (15 bins)
    orders_sample = df['num_orders'].sample(n=min(50000, len(df)), random_state=42)
    hist, bin_edges = np.histogram(orders_sample, bins=15)
    orders_dist = []
    for i in range(len(hist)):
        label = f"{int(bin_edges[i])}-{int(bin_edges[i+1])}"
        orders_dist.append({"bin": label, "count": int(hist[i])})

    # 3. Orders over weeks
    weekly = df.groupby('week')['num_orders'].mean().reset_index()
    orders_over_weeks = weekly.rename(columns={'num_orders': 'avg_orders'}).to_dict(orient='records')

    # 4. Average orders by meal category
    by_category = df.groupby('category')['num_orders'].mean().reset_index().sort_values('num_orders', ascending=False)
    orders_by_category = by_category.rename(columns={'num_orders': 'avg_orders'}).to_dict(orient='records')

    # 5. Average orders by cuisine
    by_cuisine = df.groupby('cuisine')['num_orders'].mean().reset_index().sort_values('num_orders', ascending=False)
    orders_by_cuisine = by_cuisine.rename(columns={'num_orders': 'avg_orders'}).to_dict(orient='records')

    # 6. Price vs orders (binned checkout prices into 10 quantiles)
    df_temp = df.copy()
    df_temp['price_bin'] = pd.qcut(df_temp['checkout_price'], q=10, labels=False, duplicates='drop')
    price_bins = df_temp.groupby('price_bin').agg({'checkout_price': 'mean', 'num_orders': 'mean'}).reset_index()
    price_vs_orders = [
        {"avg_price": round(row.checkout_price, 2), "avg_orders": round(row.num_orders, 2)}
        for row in price_bins.itertuples()
    ]

    # 7. Promotion vs orders
    promo_email = df.groupby('emailer_for_promotion')['num_orders'].mean().to_dict()
    promo_home = df.groupby('homepage_featured')['num_orders'].mean().to_dict()
    promo_vs_orders = [
        {"type": "No Promo Email", "avg_orders": promo_email.get(0, 0)},
        {"type": "Promo Email", "avg_orders": promo_email.get(1, 0)},
        {"type": "No Homepage Feature", "avg_orders": promo_home.get(0, 0)},
        {"type": "Homepage Featured", "avg_orders": promo_home.get(1, 0)},
    ]

    # 8. Orders by fulfillment center (Top 15)
    by_center = df.groupby('center_id')['num_orders'].mean().reset_index().sort_values('num_orders', ascending=False).head(15)
    orders_by_center = [
        {"center_id": f"Center {int(row.center_id)}", "avg_orders": round(row.num_orders, 2)}
        for row in by_center.itertuples()
    ]

    state["eda_cache"] = {
        "corr_cols": numeric_cols_for_corr,
        "corr_matrix": corr_matrix,
        "orders_dist": orders_dist,
        "orders_over_weeks": orders_over_weeks,
        "orders_by_category": orders_by_category,
        "orders_by_cuisine": orders_by_cuisine,
        "price_vs_orders": price_vs_orders,
        "promo_vs_orders": promo_vs_orders,
        "orders_by_center": orders_by_center
    }

def get_or_compute_eda():
    """Returns cached EDA data or calculates it if not yet loaded."""
    if not state["eda_cache"]:
        if state["data_loaded"]:
            df = load_and_merge_data(DATA_DIR)
            df = feature_engineering(df)
            precompute_eda_cache(df)
        else:
            raise ValueError("Data has not been loaded yet.")
    return state["eda_cache"]
