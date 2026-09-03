import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
import joblib

def load_and_merge_data(base_path):
    """
    Loads train.csv, meal_info.csv, and fulfilment_center_info.csv,
    and merges them on meal_id and center_id.
    """
    train_path = os.path.join(base_path, "train.csv")
    meal_path = os.path.join(base_path, "meal_info.csv")
    center_path = os.path.join(base_path, "fulfilment_center_info.csv")

    if not (os.path.exists(train_path) and os.path.exists(meal_path) and os.path.exists(center_path)):
        raise FileNotFoundError("Missing one or more dataset CSV files in " + base_path)

    df_train = pd.read_csv(train_path)
    df_meal = pd.read_csv(meal_path)
    df_center = pd.read_csv(center_path)

    # Merge train with meal info
    df = pd.merge(df_train, df_meal, on="meal_id", how="left")
    # Merge with center info
    df = pd.merge(df, df_center, on="center_id", how="left")

    return df

def feature_engineering(df):
    """
    Performs feature engineering on the merged dataset.
    """
    df = df.copy()
    
    # 1. Price difference (discount amount)
    df['price_difference'] = df['base_price'] - df['checkout_price']
    
    # 2. Discount percentage (as an actual percentage, e.g. 5.2% or -1.4%)
    df['discount_percent'] = ((df['price_difference'] / (df['base_price'] + 1e-5)) * 100).round(2)
    
    # 3. Promotion intensity (homepage featured + emailer promotion)
    df['promotion_intensity'] = df['emailer_for_promotion'] + df['homepage_featured']
    
    return df

class PreprocessingPipeline:
    def __init__(self):
        self.preprocessor = None
        self.numeric_cols = [
            'week', 'checkout_price', 'base_price', 'op_area',
            'price_difference', 'discount_percent', 'promotion_intensity',
            'city_code', 'region_code', 'center_id', 'meal_id'
        ]
        self.categorical_cols = ['category', 'cuisine', 'center_type']
        self.binary_cols = ['emailer_for_promotion', 'homepage_featured']
        self.feature_names = []

    def fit_transform(self, X):
        """
        Fits encoders and scalers on X and returns processed feature array.
        """
        # Define transformers
        numeric_transformer = StandardScaler()
        categorical_transformer = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
        
        # Combine using ColumnTransformer
        self.preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, self.numeric_cols),
                ('cat', categorical_transformer, self.categorical_cols),
                ('bin', 'passthrough', self.binary_cols)
            ]
        )
        
        X_processed = self.preprocessor.fit_transform(X)
        
        # Store feature names for transparency/explainability
        cat_encoder = self.preprocessor.named_transformers_['cat']
        cat_features = list(cat_encoder.get_feature_names_out(self.categorical_cols))
        self.feature_names = self.numeric_cols + cat_features + self.binary_cols
        
        return X_processed

    def transform(self, X):
        """
        Applies fitted encoders and scalers to new data.
        """
        if self.preprocessor is None:
            raise ValueError("Pipeline has not been fitted yet!")
        return self.preprocessor.transform(X)

    def save(self, filepath):
        """
        Saves the fitted preprocessing pipeline.
        """
        joblib.dump(self, filepath)

    @classmethod
    def load(cls, filepath):
        """
        Loads a saved preprocessing pipeline.
        """
        return joblib.load(filepath)
