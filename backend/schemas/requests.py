from pydantic import BaseModel

class PreprocessRequest(BaseModel):
    sample_size: int = 10000
    val_split: float = 0.2

class PredictRequest(BaseModel):
    week: int
    center_id: int
    meal_id: int
    checkout_price: float
    base_price: float
    emailer_for_promotion: int  # 0 or 1
    homepage_featured: int      # 0 or 1
