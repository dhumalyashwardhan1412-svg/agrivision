from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.market import MarketPrice, MarketTrend, MarketDataType
from app.schemas.market import MarketComparisonResponse, MarketPriceResponse

class MarketService:
    @staticmethod
    def get_market_prices(
        db: Session,
        commodity: Optional[str] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
        data_type: Optional[MarketDataType] = None
    ) -> List[MarketPrice]:
        query = db.query(MarketPrice)
        if commodity:
            query = query.filter(MarketPrice.commodity.ilike(f"%{commodity}%"))
        if state:
            query = query.filter(MarketPrice.state.ilike(f"%{state}%"))
        if district:
            query = query.filter(MarketPrice.district.ilike(f"%{district}%"))
        if data_type:
            query = query.filter(MarketPrice.data_type == data_type)
        return query.order_by(MarketPrice.modal_price_per_quintal.desc()).all()

    @staticmethod
    def get_commodity_trends(db: Session, commodity: str) -> Optional[MarketTrend]:
        return db.query(MarketTrend).filter(MarketTrend.commodity.ilike(f"%{commodity}%")).first()

    @staticmethod
    def compare_markets(db: Session, commodity: str, state: Optional[str] = None) -> MarketComparisonResponse:
        query = db.query(MarketPrice).filter(MarketPrice.commodity.ilike(f"%{commodity}%"))
        if state:
            query = query.filter(MarketPrice.state.ilike(f"%{state}%"))
        
        prices = query.all()
        if not prices:
            # Fallback to all prices for commodity
            prices = db.query(MarketPrice).filter(MarketPrice.commodity.ilike(f"%{commodity}%")).all()

        if not prices:
            # Generate simulated baseline if not seeded
            dummy_price = MarketPrice(
                id=999,
                source="Agmarknet APMC Mandi",
                market_name="National Average Benchmark Mandi",
                state="National",
                district="Central",
                commodity=commodity,
                grade="FAQ",
                min_price_per_quintal=2200.0,
                max_price_per_quintal=2800.0,
                modal_price_per_quintal=2500.0,
                price_per_kg=25.0,
                arrival_quantity_tons=120.0,
                price_change_7d_percent=3.5,
                data_type=MarketDataType.DEMO
            )
            prices = [dummy_price]

        prices_sorted = sorted(prices, key=lambda p: p.modal_price_per_quintal, reverse=True)
        highest = prices_sorted[0]
        lowest = prices_sorted[-1]
        
        avg_kg = sum(p.price_per_kg for p in prices) / len(prices)
        spread = highest.modal_price_per_quintal - lowest.modal_price_per_quintal

        return MarketComparisonResponse(
            commodity=commodity,
            markets_comparison=[MarketPriceResponse.model_validate(p) for p in prices_sorted],
            highest_price_market=f"{highest.market_name} (₹{highest.price_per_kg}/kg)",
            lowest_price_market=f"{lowest.market_name} (₹{lowest.price_per_kg}/kg)",
            average_price_per_kg=round(avg_kg, 2),
            price_spread_per_quintal=round(spread, 2),
            best_selling_mandi=highest.market_name
        )

market_service = MarketService()
