from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.market import MarketDataType

class MarketPriceResponse(BaseModel):
    id: int
    source: str
    market_name: str
    state: str
    district: str
    commodity: str
    variety: Optional[str]
    grade: str
    min_price_per_quintal: float
    max_price_per_quintal: float
    modal_price_per_quintal: float
    price_per_kg: float
    unit: str
    arrival_quantity_tons: float
    price_change_7d_percent: float
    data_type: MarketDataType
    recorded_date: datetime
    last_updated: datetime

    class Config:
        from_attributes = True

class MarketTrendResponse(BaseModel):
    id: int
    commodity: str
    market_name: str
    trend_direction: str
    avg_price_30d: float
    historical_30d_points: List[Dict[str, Any]]
    forecast_next_15d_price: float
    selling_recommendation: str
    ai_market_insight: Optional[str]
    data_type: MarketDataType
    updated_at: datetime

    class Config:
        from_attributes = True

class MarketComparisonRequest(BaseModel):
    commodity: str
    state: Optional[str] = None

class MarketComparisonResponse(BaseModel):
    commodity: str
    markets_comparison: List[MarketPriceResponse]
    highest_price_market: str
    lowest_price_market: str
    average_price_per_kg: float
    price_spread_per_quintal: float
    best_selling_mandi: str
