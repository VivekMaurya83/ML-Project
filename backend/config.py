import os

# Centralized Project Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "foodDemand_train")
SAVED_MODELS_DIR = os.path.join(BASE_DIR, "models_saved")
PREPROCESSOR_PATH = os.path.join(SAVED_MODELS_DIR, "preprocessor.joblib")
PROCESSED_DATA_DIR = os.path.join(BASE_DIR, "processed_data")
PROCESSED_DATA_CSV = os.path.join(PROCESSED_DATA_DIR, "train_sampled_engineered.csv")

# Ensure required directories exist
os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
