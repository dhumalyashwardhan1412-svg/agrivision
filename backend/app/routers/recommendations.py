from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.farm import Farm
from app.models.crop import CropRecommendation
from app.schemas.crop import CropRecommendationResponse
from app.services.recommendation_service import recommendation_service

router = APIRouter(prefix="/recommendations", tags=["Crop Recommendations"])

@router.get("/farm/{farm_id}", response_model=List[CropRecommendationResponse])
def get_or_calculate_crop_recommendations(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    if current_user.role != UserRole.ADMIN and (not current_user.farmer_profile or farm.farmer_id != current_user.farmer_profile.id):
        raise HTTPException(status_code=403, detail="Not authorized to access recommendations for this farm")

    # Generate fresh recommendations using hybrid scoring engine
    recs = recommendation_service.generate_recommendations(db, farm_id)

    # Persist or update recommendations in database
    db.query(CropRecommendation).filter(CropRecommendation.farm_id == farm_id).delete()
    for r in recs:
        db.add(r)
    db.commit()

    # Re-query with eager relationships
    persisted = (
        db.query(CropRecommendation)
        .filter(CropRecommendation.farm_id == farm_id)
        .order_by(CropRecommendation.overall_suitability_score.desc())
        .all()
    )
    return persisted
