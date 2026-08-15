from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class FarmReportSummaryResponse(BaseModel):
    report_id: str
    generated_at: datetime
    farm_name: str
    farmer_name: str
    location: str
    total_area_acres: float
    soil_health_grade: str
    top_recommended_crop: str
    projected_net_profit_inr: float
    projected_roi_percent: float
    pdf_download_url: str
