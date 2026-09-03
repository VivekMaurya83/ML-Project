# 🍲 Food Demand Forecasting for Efficient Food Planning and Waste Reduction using ML

> **A Full-Stack Machine Learning Web Application for Predictive Food Logistics and Inventory Planning**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4+-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

---

## 📌 Project Overview

In commercial cloud kitchens and meal fulfillment operations, preparing the wrong amount of food causes severe operational problems:
* **Over-preparation** results in perishable food spoilage, financial loss, and landfill waste.
* **Under-preparation** causes stockouts, missed fulfillment SLAs, and lost revenue.

This system predicts the exact weekly food order volume (`num_orders`) for any combination of **Fulfillment Center**, **Meal Item**, and **Week**, using **traditional, explainable Machine Learning regression algorithms** and a dynamic **Weighted Averaging Ensemble**.

---

## 🧠 Machine Learning Methodology

### 1. Traditional Regression Models
* **Random Forest Regressor**: 100 de-correlated decision trees built via bootstrap aggregation (bagging) and random feature sub-spacing to handle non-linear multi-variable interactions.
* **Support Vector Regressor (SVR)**: Solves an $\varepsilon$-insensitive loss tube using the **Radial Basis Function (RBF) Kernel** ($K(x, x') = \exp(-\gamma \|x - x'\|^2)$) to map non-linear demand boundaries into infinite-dimensional space.
* **K-Nearest Neighbors (KNN) Regressor**: Instance-based non-parametric regression using Euclidean distance weighting ($w_i = 1 / d(x, x_i)$) to locate the 7 most similar historical sales scenarios.

### 2. Weighted Averaging Ensemble
Instead of an unweighted arithmetic mean, the ensemble weights each model inversely proportional to its validation Root Mean Squared Error (RMSE):

$$w_i = \frac{\frac{1}{\text{RMSE}_i}}{\sum_{j} \frac{1}{\text{RMSE}_j}}$$

$$\hat{y}_{\text{ensemble}} = w_{\text{rf}} \hat{y}_{\text{rf}} + w_{\text{svr}} \hat{y}_{\text{svr}} + w_{\text{knn}} \hat{y}_{\text{knn}}$$

### 3. Mathematical Transformations
* **Target Variance Normalization**: Historical orders are heavily right-skewed. The pipeline fits models on $\log(1 + y)$ and reverses predictions using $\exp(y) - 1$, preventing bias from extreme demand spikes.
* **StandardScaler**: Standardizes numeric attributes to zero mean and unit variance ($\mu = 0, \sigma = 1$), ensuring scale equality for distance-based models (KNN and SVR).
* **One-Hot Encoding**: Converts categorical features (`cuisine`, `category`, `center_type`) into orthogonal binary indicators.

---

## 📊 Evaluation & Benchmark Results

Trained on a 50,000-row representative dataset with an 80/20 train/validation split:

| Model Architecture | Mean Absolute Error (MAE) | Root Mean Squared Error (RMSE) | $R^2$ Score | Ensemble Weight |
| :--- | :---: | :---: | :---: | :---: |
| **Random Forest Regressor** | 90.61 | 192.00 | 74.20% | 34.4% |
| **Support Vector Regressor (SVR)** | 83.32 | **181.43** | **76.97%** | **36.4%** |
| **K-Nearest Neighbors (KNN)** | 92.94 | 226.49 | 64.11% | 29.2% |
| **🏆 Weighted Averaging Ensemble** | **82.31** | **182.06** | **76.81%** | **Combined** |

> **Key Finding:** The Weighted Averaging Ensemble outperformed all individual models on **MAE (82.31)**, proving that combining diverse regressors successfully minimizes prediction error.

---

## 📁 Repository Structure

```text
├── backend/
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py              # REST API route handlers (/stats, /preprocess, /train, /predict)
│   ├── config.py                  # Project paths and configuration constants
│   ├── foodDemand_train/          # Raw relational datasets
│   │   ├── train.csv              # Historical transaction records (456,548 rows)
│   │   ├── meal_info.csv          # Meal categories & cuisines (51 rows)
│   │   └── fulfilment_center_info.csv # Center locations, types & delivery areas (77 rows)
│   ├── ml_pipeline/
│   │   ├── data_processing.py     # Relational joins, feature engineering, and PreprocessingPipeline
│   │   └── models.py              # RF, SVR, KNN training, evaluation, and persistence
│   ├── models_saved/              # Serialized Joblib models (rf, svr, knn, preprocessor)
│   ├── processed_data/            # On-disk persisted preprocessed & engineered CSV datasets
│   ├── requirements.txt           # Python dependencies (fastapi, scikit-learn, pandas, uvicorn)
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── requests.py            # Pydantic request models
│   ├── services/
│   │   ├── eda_service.py         # Correlation matrix and statistical distribution aggregations
│   │   ├── prediction_service.py  # Demographic feature lookups and inference logic
│   │   ├── preprocessing_service.py # 8-stage pipeline with on-disk CSV saving and preview
│   │   ├── state.py               # In-memory application state and artifact loaders
│   │   └── training_service.py    # Background asynchronous training worker
│   └── main.py                    # FastAPI entrypoint (~37 lines)
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.jsx          # KPI cards, best model highlights, quick start guide
    │   │   ├── DatasetManagement.jsx  # Schema joins & relational dictionary
    │   │   ├── DataPreprocessing.jsx  # 8-stage pipeline tracker, live logs, CSV preview & download
    │   │   ├── EDA.jsx                # Charts: trends, skewness, demand curves, promotions, heatmap
    │   │   ├── ModelTraining.jsx      # Training triggers, CPU execution logs, ensemble weights
    │   │   ├── ModelEvaluation.jsx    # Metric comparison tables (MAE, RMSE, R²) & visual charts
    │   │   ├── Prediction.jsx         # Demand forecasting form, live discount gauge & food waste tool
    │   │   └── ModelInfo.jsx          # Math equations & algorithmic documentation
    │   ├── App.jsx                    # App navigation, sidebar layout & global states
    │   └── index.css                  # Enterprise slate/white light theme design system
    ├── package.json
    └── vite.config.js
```

---

## ⚡ Quick Start Guide

### Prerequisites
* **Python 3.10+**
* **Node.js 18+** & **npm**

---

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create a Python virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.\.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install required packages
pip install -r requirements.txt

# Start the FastAPI backend server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
* **API Documentation (Swagger UI)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Launch the Vite development server
npm run dev
```
* **Web Application UI**: [http://localhost:5173/](http://localhost:5173/)

---

## 🖥️ Application Features

1. **Enterprise Light Theme**: Clean, responsive layout with royal-blue accents, subtle card shadows, and high-contrast typography.
2. **Interactive Discount Gauge**: As you edit *Base Price* and *Checkout Price*, a live gauge calculates whether a discount or price markup is active.
3. **On-Disk Preprocessing Persistence**: Cleanly samples, engineers features, and saves `train_sampled_engineered.csv` to disk with an in-browser data preview and a **Download CSV** button.
4. **Live Training Console**: Real-time progress updates showing individual model execution (Random Forest $\rightarrow$ KNN $\rightarrow$ SVR) with timestamps.
5. **Food Waste & Shortage Decision Support**: Input your kitchen's planned meal preparation to calculate exact **Excess Food Waste** or **Shortage Deficit**.
6. **Mathematical Reference Sheet**: Formatted HTML/CSS equations for fractions, summations, and RBF kernel formulations directly inside the browser.

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
