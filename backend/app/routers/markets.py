from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.market import MarketDataType
from app.schemas.market import (
    MarketPriceResponse,
    MarketTrendResponse,
    MarketComparisonRequest,
    MarketComparisonResponse,
)
from app.services.market_service import market_service


router = APIRouter(
    prefix="/markets",
    tags=["Market Intelligence & Prices"]
)


@router.get("/prices", response_model=List[MarketPriceResponse])
def get_market_prices(
    commodity: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    data_type: Optional[MarketDataType] = None,
    db: Session = Depends(get_db),
):
    """
    Returns verified and simulated APMC mandi records.

    Explicitly indicates data_type:
    LIVE, RECENT, HISTORICAL, ESTIMATED, or DEMO.
    """
    return market_service.get_market_prices(
        db,
        commodity,
        state,
        district,
        data_type,
    )


@router.get("/trends/{commodity}", response_model=MarketTrendResponse)
def get_market_trends(
    commodity: str,
    db: Session = Depends(get_db),
):
    trend = market_service.get_commodity_trends(db, commodity)

    if not trend:
        # Generate simulated trend response if data is not seeded
        return MarketTrendResponse(
            id=1,
            commodity=commodity,
            market_name="Regional APMC Index",
            trend_direction="UPWARD (Bullish)",
            avg_price_30d=2450.0,

            historical_30d_points=[
                {
                    "date": f"Day -{30 - i}",
                    "price": round(
                        2200 + i * 15 + (i % 3) * 20,
                        1
                    ),
                    "arrival": round(
                        50 + (i % 5) * 8,
                        1
                    ),
                }
                for i in range(30)
            ],

            forecast_next_15d_price=2680.0,

            selling_recommendation=(
                "Hold for 5-7 days for peak festive "
                "price realization."
            ),

            ai_market_insight=(
                f"Market supply for {commodity} is tightening "
                "due to late season arrivals. "
                "Wholesale demand is elevated."
            ),

            data_type=MarketDataType.DEMO,

            # Fixed: safely generate current UTC datetime
            updated_at=datetime.now(timezone.utc),
        )

    return trend


@router.post("/compare", response_model=MarketComparisonResponse)
def compare_market_prices(
    req: MarketComparisonRequest,
    db: Session = Depends(get_db),
):
    return market_service.compare_markets(
        db,
        req.commodity,
        req.state,
    )