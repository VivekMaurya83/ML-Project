import datetime
from config import SAVED_MODELS_DIR, PREPROCESSOR_PATH
from ml_pipeline.models import FoodDemandModels
from services.state import state

def run_training_in_background(X_train, y_train, X_val, y_val):
    """Executes model training asynchronously in a background thread."""
    def log(msg):
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        state["training_logs"].append(f"[{timestamp}] {msg}")

    try:
        state["training_status"] = "training"
        state["training_logs"] = []
        log("Model training started...")

        models = FoodDemandModels()
        metrics, weights = models.train_models(X_train, y_train, X_val, y_val, log_callback=log)

        log("Calculating validation metrics and ensemble weights...")
        log(f"Random Forest weight: {weights['rf']:.4f}")
        log(f"SVR weight: {weights['svr']:.4f}")
        log(f"KNN weight: {weights['knn']:.4f}")

        # Persist trained models and preprocessor
        log("Persisting trained models and preprocessor to disk...")
        models.save(SAVED_MODELS_DIR)
        state["pipeline"].save(PREPROCESSOR_PATH)

        # Update application state
        state["models"] = models
        state["metrics"] = metrics
        state["weights"] = weights
        state["is_trained"] = True
        state["training_status"] = "completed"
        state["training_logs"].append("Training completed successfully!")
    except Exception as e:
        state["training_status"] = "error"
        state["training_logs"].append(f"Training failed: {str(e)}")
        print(f"Error during training: {str(e)}")
