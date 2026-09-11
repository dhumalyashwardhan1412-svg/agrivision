from fastapi import APIRouter
from app.schemas.profit import (
    ProfitCalculationRequest,
    ProfitCalculationResponse,
    WhatIfRequest,
    WhatIfComparisonResponse,
    MultiScenarioRequest,
    MultiScenarioResponse
)
from app.services.profit_service import profit_service

router = APIRouter(prefix="/profit", tags=["Profit & Financial Intelligence"])

@router.post("/calculate", response_model=ProfitCalculationResponse)
def calculate_profit_and_roi(req: ProfitCalculationRequest):
    """
    Calculates detailed itemized costs (seeds, fertilizer, manure, labour, irrigation,
    equipment, electricity/fuel, crop protection, transport, packaging),
    expected revenue, estimated profit, profit margin, ROI, and break-even points.
    All outputs are explicitly flagged as estimates.
    """
    return profit_service.calculate_profit(req)

@router.post("/what-if", response_model=WhatIfComparisonResponse)
def calculate_what_if_comparison(req: WhatIfRequest):
    """
    Compares baseline farming assumptions against modified What-If variables.
    Computes delta in profit, revenue, cost, and ROI.
    """
    return profit_service.calculate_what_if(req)

@router.post("/scenarios", response_model=MultiScenarioResponse)
def calculate_multiple_scenarios(req: MultiScenarioRequest):
    """
    Generates 3 multi-scenario projections: Conservative, Expected, and Best Case.
    """
    return profit_service.calculate_scenarios(req)
