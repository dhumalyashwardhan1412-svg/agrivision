from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.farm import Farm
from app.models.soil import SoilTest
from app.models.crop import CropRecommendation
from app.schemas.report import FarmReportSummaryResponse
from app.services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["Smart Farm Reports & PDFs"])

@router.get("/farm-pdf/{farm_id}")
def download_farm_pdf_report(
    farm_id: int,
    db: Session = Depends(get_db)
):
    """
    Generates an official, certified AgriVision Smart Farm Report PDF
    containing farmer details, soil health assessment, hybrid crop recommendations,
    financial profit/ROI forecast, and advisory disclaimers.
    """
    try:
        pdf_bytes = report_service.generate_farm_pdf(db, farm_id)
        filename = f"AgriVision_Smart_Report_Farm_{farm_id}_{datetime.now().strftime('%Y%m%d')}.pdf"
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF report: {str(e)}")

@router.get("/summary/{farm_id}", response_model=FarmReportSummaryResponse)
def get_farm_report_summary(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    farmer_name = farm.farmer.user.full_name if farm.farmer and farm.farmer.user else "Farmer"
    
    soil = (
        db.query(SoilTest)
        .filter(SoilTest.farm_id == farm_id)
        .order_by(SoilTest.created_at.desc())
        .first()
    )
    grade = soil.health_grade if soil else "Grade A (Prime Fertile)"

    top_rec = (
        db.query(CropRecommendation)
        .filter(CropRecommendation.farm_id == farm_id)
        .order_by(CropRecommendation.overall_suitability_score.desc())
        .first()
    )

    top_crop = top_rec.crop.name if top_rec and top_rec.crop else "Tomato"
    profit = top_rec.estimated_profit_inr if top_rec else 145000.0
    roi = top_rec.roi_percentage if top_rec else 115.0

    return FarmReportSummaryResponse(
        report_id=f"AGRI-{farm.id:04d}-{datetime.now().strftime('%Y%m%d')}",
        generated_at=datetime.now(timezone.utc),
        farm_name=farm.name,
        farmer_name=farmer_name,
        location=f"{farm.location_name}, {farm.district}, {farm.state}",
        total_area_acres=farm.total_area_acres,
        soil_health_grade=grade,
        top_recommended_crop=top_crop,
        projected_net_profit_inr=profit,
        projected_roi_percent=roi,
        pdf_download_url=f"/api/v1/reports/farm-pdf/{farm.id}"
    )
