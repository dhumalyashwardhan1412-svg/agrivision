from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.crop import Crop
from app.schemas.crop import CropResponse

router = APIRouter(prefix="/crops", tags=["Crops"])

@router.get("", response_model=List[CropResponse])
def get_all_crops(
    category: Optional[str] = None,
    season: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Crop)
    if category:
        query = query.filter(Crop.category.ilike(f"%{category}%"))
    if season:
        query = query.filter(Crop.growing_season.ilike(f"%{season}%"))
    return query.all()

@router.get("/{crop_id}", response_model=CropResponse)
def get_crop_details(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return crop
