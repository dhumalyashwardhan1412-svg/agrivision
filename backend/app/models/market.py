from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, JSON
from datetime import datetime, timezone
import enum
from app.database.database import Base

class MarketDataType(str, enum.Enum):
    LIVE = "LIVE"
    RECENT = "RECENT"
    HISTORICAL = "HISTORICAL"
    ESTIMATED = "ESTIMATED"
    DEMO = "DEMO"

class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(100), default="Agmarknet APMC Mandi") # Agmarknet, E-NAM, Local APMC, Demo Simulator
    market_name = Column(String(200), nullable=False, index=True) # Azadpur Mandi, Vashi APMC, Nashik Mandi, etc.
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    commodity = Column(String(100), nullable=False, index=True) # Tomato, Onion, Wheat, Rice, Potato, etc.
    variety = Column(String(100), nullable=True)
    grade = Column(String(50), default="FAQ") # FAQ, Medium, Premium
    min_price_per_quintal = Column(Float, nullable=False)
    max_price_per_quintal = Column(Float, nullable=False)
    modal_price_per_quintal = Column(Float, nullable=False) # standard APMC price per 100 kg
    price_per_kg = Column(Float, nullable=False) # modal_price / 100
    unit = Column(String(50), default="INR/Quintal")
    arrival_quantity_tons = Column(Float, default=50.0)
    price_change_7d_percent = Column(Float, default=0.0)
    data_type = Column(Enum(MarketDataType), default=MarketDataType.DEMO, nullable=False)
    recorded_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class MarketTrend(Base):
    __tablename__ = "market_trends"

    id = Column(Integer, primary_key=True, index=True)
    commodity = Column(String(100), nullable=False, index=True)
    market_name = Column(String(200), nullable=False)
    trend_direction = Column(String(50), default="STABLE") # UPWARD, DOWNWARD, STABLE, VOLATILE
    avg_price_30d = Column(Float, nullable=False)
    historical_30d_points = Column(JSON, nullable=False) # list of {date: str, price: float, arrival: float}
    forecast_next_15d_price = Column(Float, nullable=False)
    selling_recommendation = Column(String(100), default="Hold for better price") # Sell Now, Hold 7 Days, Store, Forward Contract
    ai_market_insight = Column(String(1000), nullable=True)
    data_type = Column(Enum(MarketDataType), default=MarketDataType.DEMO, nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
