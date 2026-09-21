import os
from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse

from config import DATA_DIR, PROCESSED_DATA_CSV
from schemas import PreprocessRequest, PredictRequest
from services.state import state, load_initial_data_files
from services.eda_service import get_or_compute_eda
from services.training_service import run_training_in_background
from services.prediction_service import generate_prediction
from services.preprocessing_service import execute_preprocessing_pipeline

router = APIRouter(prefix="/api", tags=["Forecasting"])

@router.get("/stats")
def get_stats():
    """Returns baseline statistics of the raw food demand dataset."""
    if not state["data_loaded"]:
        load_initial_data_files()

    if not state["data_loaded"]:
        raise HTTPException(
            status_code=500,
            detail="Datasets could not be loaded. Please ensure CSV files exist in foodDemand_train/"
        )

    return {
        "success": True,
        "data_loaded": state["data_loaded"],
        "preprocessed": state["preprocessed"],
        "is_trained": state["is_trained"],
        "stats": state["stats"],
        "model_status": {
            "status": state["training_status"],
            "has_saved_model": state["is_trained"]
        }
    }

@router.post("/preprocess")
def preprocess_dataset(req: PreprocessRequest):
    """Executes transparent preprocessing, on-disk CSV saving, and returns live logs and preview."""
    try:
        result = execute_preprocessing_pipeline(
            sample_size=req.sample_size,
            val_split=req.val_split
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preprocessing failed: {str(e)}")

@router.get("/preprocess/download")
def download_preprocessed_csv():
    """Provides direct download of the sampled, feature-engineered CSV dataset from disk."""
    if not os.path.exists(PROCESSED_DATA_CSV):
        raise HTTPException(
            status_code=404,
            detail="Preprocessed dataset has not been generated yet. Please run preprocessing first."
        )
    return FileResponse(
        path=PROCESSED_DATA_CSV,
        media_type="text/csv",
        filename="train_sampled_engineered.csv"
    )

@router.get("/eda")
def get_eda():
    """Returns statistical summaries and correlation matrices for EDA visualizations."""
    try:
        eda_data = get_or_compute_eda()
        return {"success": True, "eda": eda_data}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate EDA: {str(e)}")

@router.post("/train")
def train_models(background_tasks: BackgroundTasks):
    """Dispatches asynchronous training of Random Forest, SVR, and KNN models."""
    if not state["preprocessed"] or "X_train_processed" not in state:
        raise HTTPException(status_code=400, detail="Please preprocess the dataset first!")

    if state["training_status"] == "training":
        return {"success": True, "message": "Training is already in progress.", "status": "training"}

    X_train = state["X_train_processed"]
    X_val = state["X_val_processed"]
    y_train = state["y_train"]
    y_val = state["y_val"]

    background_tasks.add_task(run_training_in_background, X_train, y_train, X_val, y_val)

    return {
        "success": True,
        "message": "Training started in background.",
        "status": "training"
    }

@router.get("/train/status")
def get_training_status():
    """Returns execution status and real-time console logs."""
    return {
        "status": state["training_status"],
        "logs": state["training_logs"],
        "is_trained": state["is_trained"]
    }

@router.get("/evaluation")
def get_evaluation():
    """Returns validation metrics (MAE, RMSE, R²), calculated ensemble weights, and feature importances."""
    if not state["is_trained"] or state["metrics"] is None:
        raise HTTPException(status_code=400, detail="Models have not been trained yet!")

    feat_importances = state.get("feature_importances") or []
    if not feat_importances and state["models"] is not None:
        feat_names = getattr(state["pipeline"], "feature_names", None)
        feat_importances = state["models"].get_feature_importances(feat_names)
        state["feature_importances"] = feat_importances

    return {
        "success": True,
        "metrics": state["metrics"],
        "weights": state["weights"],
        "feature_importances": feat_importances
    }

@router.post("/predict")
def predict_endpoint(req: PredictRequest):
    """Enriches query features with center and meal attributes and calculates model forecasts."""
    try:
        return generate_prediction(req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
