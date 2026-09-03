import pandas as pd
from ml_pipeline.data_processing import feature_engineering
from services.state import state, load_initial_data_files

def generate_prediction(req):
    """
    Accepts meal & center parameters, looks up demographic and facility attributes,
    transforms features, and computes single-model and ensemble forecasts.
    """
    if not state["is_trained"] or state["pipeline"] is None or state["models"] is None:
        raise ValueError("Models are not trained or loaded. Please train models first.")

    if state["df_meal"] is None or state["df_center"] is None:
        load_initial_data_files()

    # 1. Lookup meal metadata
    meal_lookup = state["df_meal"][state["df_meal"]['meal_id'] == req.meal_id]
    if meal_lookup.empty:
        raise ValueError(f"Invalid meal_id {req.meal_id}. Not found in database.")
    category = meal_lookup.iloc[0]['category']
    cuisine = meal_lookup.iloc[0]['cuisine']

    # 2. Lookup center metadata
    center_lookup = state["df_center"][state["df_center"]['center_id'] == req.center_id]
    if center_lookup.empty:
        raise ValueError(f"Invalid center_id {req.center_id}. Not found in database.")
    city_code = int(center_lookup.iloc[0]['city_code'])
    region_code = int(center_lookup.iloc[0]['region_code'])
    center_type = center_lookup.iloc[0]['center_type']
    op_area = float(center_lookup.iloc[0]['op_area'])

    # 3. Create DataFrame for inference
    input_data = pd.DataFrame([{
        "week": req.week,
        "center_id": req.center_id,
        "meal_id": req.meal_id,
        "checkout_price": req.checkout_price,
        "base_price": req.base_price,
        "emailer_for_promotion": req.emailer_for_promotion,
        "homepage_featured": req.homepage_featured,
        "category": category,
        "cuisine": cuisine,
        "city_code": city_code,
        "region_code": region_code,
        "center_type": center_type,
        "op_area": op_area
    }])

    # 4. Feature engineering & scaling
    input_engineered = feature_engineering(input_data)
    input_processed = state["pipeline"].transform(input_engineered)

    # 5. Model prediction
    predictions = state["models"].predict(input_processed)

    return {
        "success": True,
        "meal_details": {
            "category": category,
            "cuisine": cuisine
        },
        "center_details": {
            "city_code": city_code,
            "region_code": region_code,
            "center_type": center_type,
            "op_area": op_area
        },
        "predictions": {
            "rf": round(predictions["rf"], 2),
            "svr": round(predictions["svr"], 2),
            "knn": round(predictions["knn"], 2),
            "ensemble": round(predictions["ensemble"], 2)
        },
        "weights": predictions["weights"]
    }
