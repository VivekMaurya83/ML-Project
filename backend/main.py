from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import api_router
from services.state import load_initial_data_files, try_load_saved_artifacts

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes dataset files and pre-trained models on application startup."""
    load_initial_data_files()
    try_load_saved_artifacts()
    yield

app = FastAPI(
    title="Food Demand Forecasting API",
    description="Backend API for food demand planning using RF, SVR, KNN, and Weighted Ensemble.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount modular API routes
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
