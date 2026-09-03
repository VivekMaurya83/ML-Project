import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

def calculate_metrics(y_true, y_pred):
    """
    Computes MAE, RMSE, and R2 score.
    """
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    return {
        "mae": float(mae),
        "rmse": float(rmse),
        "r2": float(r2)
    }

class FoodDemandModels:
    def __init__(self):
        self.rf_model = None
        self.svr_model = None
        self.knn_model = None
        self.weights = {} # Model weights based on validation performance
        self.metrics = {} # Evaluation metrics for each model and ensemble

    def train_models(self, X_train, y_train, X_val, y_val, log_callback=None):
        """
        Trains RF, SVR, and KNN models, calculates evaluation metrics,
        and computes the ensemble weights.
        
        y_train and y_val should be in the actual scale.
        This function performs log transformation internally for training.
        """
        def log(msg):
            print(msg)
            if log_callback:
                log_callback(msg)

        # 1. Log transform target variable to normalize distribution and reduce variance
        y_train_log = np.log1p(y_train)
        
        # 2. Instantiate and train Random Forest
        log("1/3: Fitting Random Forest Regressor (100 trees, parallel multi-core)...")
        self.rf_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=12,
            random_state=42,
            n_jobs=-1
        )
        self.rf_model.fit(X_train, y_train_log)
        log("-> Random Forest fitting completed!")

        # 3. Instantiate and train KNN
        log("2/3: Indexing and fitting KNN Regressor (k=7, distance-weighted)...")
        self.knn_model = KNeighborsRegressor(
            n_neighbors=7,
            weights='distance',
            n_jobs=-1
        )
        self.knn_model.fit(X_train, y_train_log)
        log("-> KNN Regressor fitting completed!")

        # 4. Instantiate and train SVR
        # SVR with RBF kernel scales with O(N^2). If N > 10,000, we sample 10,000 representative
        # support vector candidates to prevent CPU lockup, which is standard ML practice.
        log(f"3/3: Fitting Support Vector Regressor (SVR, RBF kernel)...")
        if len(X_train) > 10000:
            log(f"-> Subsampling 10,000 representative support vector candidates for SVR (to prevent O(N^2) CPU timeout)...")
            np.random.seed(42)
            svr_idx = np.random.choice(len(X_train), size=10000, replace=False)
            X_svr = X_train[svr_idx]
            y_svr_log = y_train_log[svr_idx]
        else:
            X_svr = X_train
            y_svr_log = y_train_log

        self.svr_model = SVR(kernel='rbf', C=10.0, epsilon=0.1, cache_size=1000, max_iter=5000)
        self.svr_model.fit(X_svr, y_svr_log)
        log("-> SVR fitting completed!")

        # 3. Generate validation predictions (in log scale)
        rf_pred_log = self.rf_model.predict(X_val)
        svr_pred_log = self.svr_model.predict(X_val)
        knn_pred_log = self.knn_model.predict(X_val)

        # 4. Inverse transform to actual scale (expm1)
        rf_pred = np.expm1(rf_pred_log)
        svr_pred = np.expm1(svr_pred_log)
        knn_pred = np.expm1(knn_pred_log)
        
        # Clip negative predictions to 0 just in case
        rf_pred = np.clip(rf_pred, 0, None)
        svr_pred = np.clip(svr_pred, 0, None)
        knn_pred = np.clip(knn_pred, 0, None)

        # 5. Evaluate individual models on validation set
        self.metrics["rf"] = calculate_metrics(y_val, rf_pred)
        self.metrics["svr"] = calculate_metrics(y_val, svr_pred)
        self.metrics["knn"] = calculate_metrics(y_val, knn_pred)

        # 6. Calculate weights dynamically using validation RMSE
        # Lower RMSE -> higher weight. Formula: w_i = (1 / RMSE_i) / sum(1 / RMSE_j)
        rf_rmse = self.metrics["rf"]["rmse"]
        svr_rmse = self.metrics["svr"]["rmse"]
        knn_rmse = self.metrics["knn"]["rmse"]

        # Prevent division by zero
        eps = 1e-8
        rf_inv_rmse = 1.0 / (rf_rmse + eps)
        svr_inv_rmse = 1.0 / (svr_rmse + eps)
        knn_inv_rmse = 1.0 / (knn_rmse + eps)
        
        sum_inv = rf_inv_rmse + svr_inv_rmse + knn_inv_rmse
        
        self.weights = {
            "rf": float(rf_inv_rmse / sum_inv),
            "svr": float(svr_inv_rmse / sum_inv),
            "knn": float(knn_inv_rmse / sum_inv)
        }

        # 7. Weighted Ensemble Prediction
        ensemble_pred = (
            self.weights["rf"] * rf_pred +
            self.weights["svr"] * svr_pred +
            self.weights["knn"] * knn_pred
        )
        self.metrics["ensemble"] = calculate_metrics(y_val, ensemble_pred)

        return self.metrics, self.weights

    def predict(self, X_processed):
        """
        Generates individual and ensemble predictions for given processed inputs.
        Returns actual-scale values.
        """
        if self.rf_model is None or self.svr_model is None or self.knn_model is None:
            raise ValueError("Models are not trained yet!")
            
        rf_pred_log = self.rf_model.predict(X_processed)
        svr_pred_log = self.svr_model.predict(X_processed)
        knn_pred_log = self.knn_model.predict(X_processed)
        
        rf_pred = np.clip(np.expm1(rf_pred_log), 0, None)
        svr_pred = np.clip(np.expm1(svr_pred_log), 0, None)
        knn_pred = np.clip(np.expm1(knn_pred_log), 0, None)
        
        ensemble_pred = (
            self.weights["rf"] * rf_pred +
            self.weights["svr"] * svr_pred +
            self.weights["knn"] * knn_pred
        )
        
        return {
            "rf": float(rf_pred[0] if len(rf_pred.shape) == 1 or rf_pred.shape[0] == 1 else rf_pred),
            "svr": float(svr_pred[0] if len(svr_pred.shape) == 1 or svr_pred.shape[0] == 1 else svr_pred),
            "knn": float(knn_pred[0] if len(knn_pred.shape) == 1 or knn_pred.shape[0] == 1 else knn_pred),
            "ensemble": float(ensemble_pred[0] if len(ensemble_pred.shape) == 1 or ensemble_pred.shape[0] == 1 else ensemble_pred),
            "weights": self.weights
        }

    def save(self, directory):
        """
        Saves all models and weights metadata.
        """
        os.makedirs(directory, exist_ok=True)
        joblib.dump(self.rf_model, os.path.join(directory, "rf_model.joblib"))
        joblib.dump(self.svr_model, os.path.join(directory, "svr_model.joblib"))
        joblib.dump(self.knn_model, os.path.join(directory, "knn_model.joblib"))
        
        # Save weights and metrics
        metadata = {
            "weights": self.weights,
            "metrics": self.metrics
        }
        joblib.dump(metadata, os.path.join(directory, "metadata.joblib"))

    @classmethod
    def load(cls, directory):
        """
        Loads models and metadata.
        """
        instance = cls()
        instance.rf_model = joblib.load(os.path.join(directory, "rf_model.joblib"))
        instance.svr_model = joblib.load(os.path.join(directory, "svr_model.joblib"))
        instance.knn_model = joblib.load(os.path.join(directory, "knn_model.joblib"))
        
        metadata = joblib.load(os.path.join(directory, "metadata.joblib"))
        instance.weights = metadata["weights"]
        instance.metrics = metadata["metrics"]
        
        return instance
