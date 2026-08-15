from fastapi import APIRouter
from app.schemas.profit import ProfitCalculationRequest, ProfitCalculationResponse
from app.services.profit_service import profit_service

router = APIRouter(prefix="/profit", tags=["Profit & Financial Intelligence"])

@router.post("/calculate", response_model=ProfitCalculationResponse)
def calculate_profit_and_roi(req: ProfitCalculationRequest):
    """
    Calculates detailed itemized costs (seeds, fertilizer, labour, irrigation,
    equipment, electricity/fuel, crop protection, transport, packaging),
    expected revenue, estimated profit, profit margin, ROI, and break-even points.
    All outputs are explicitly flagged as estimates.
    """
    return profit_service.calculate_profit(req)
