from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.farm import Farm, FarmingActivity
from app.schemas.farm import FarmCreate, FarmUpdate, FarmResponse, FarmingActivityCreate, FarmingActivityResponse

router = APIRouter(prefix="/farms", tags=["Farms"])

@router.get("", response_model=List[FarmResponse])
def get_my_farms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.ADMIN:
        return db.query(Farm).all()
    
    if not current_user.farmer_profile:
        return []
    
    farms = db.query(Farm).filter(Farm.farmer_id == current_user.farmer_profile.id).all()
    if not farms and current_user.role == UserRole.FARMER:
        first_name = (current_user.full_name or "My").strip().split()[0]
        land_area = current_user.farmer_profile.total_land_area or 1.0
        irrig = current_user.farmer_profile.irrigation_source or "Borewell"
        loc_name = f"{current_user.district or 'Farm'}, {current_user.state or ''}".strip(", ")
        initial_farm = Farm(
            farmer_id=current_user.farmer_profile.id,
            name=f"{first_name}'s Farm",
            location_name=loc_name or f"{first_name}'s Land",
            state=current_user.state or "Maharashtra",
            district=current_user.district or "Pune",
            total_area_acres=land_area,
            water_source=irrig,
            irrigation_system=irrig,
            primary_soil_type="Alluvial",
            latitude=current_user.latitude,
            longitude=current_user.longitude
        )
        db.add(initial_farm)
        db.commit()
        db.refresh(initial_farm)
        farms = [initial_farm]

    return farms

@router.post("", response_model=FarmResponse)
def create_farm(
    farm_in: FarmCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.FARMER, UserRole.ADMIN]))
):
    if not current_user.farmer_profile:
        raise HTTPException(status_code=400, detail="User does not have a farmer profile.")

    farm = Farm(
        farmer_id=current_user.farmer_profile.id,
        name=farm_in.name,
        location_name=farm_in.location_name,
        state=farm_in.state,
        district=farm_in.district,
        village=farm_in.village,
        total_area_acres=farm_in.total_area_acres,
        latitude=farm_in.latitude,
        longitude=farm_in.longitude,
        elevation_meters=farm_in.elevation_meters,
        primary_soil_type=farm_in.primary_soil_type,
        water_source=farm_in.water_source,
        irrigation_system=farm_in.irrigation_system,
        budget_inr=farm_in.budget_inr
    )
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm

@router.get("/{farm_id}", response_model=FarmResponse)
def get_farm_by_id(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if current_user.role != UserRole.ADMIN and (not current_user.farmer_profile or farm.farmer_id != current_user.farmer_profile.id):
        raise HTTPException(status_code=403, detail="Not authorized to access this farm")
    return farm

@router.put("/{farm_id}", response_model=FarmResponse)
def update_farm(
    farm_id: int,
    farm_in: FarmUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.FARMER, UserRole.ADMIN]))
):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    if current_user.role != UserRole.ADMIN and farm.farmer_id != current_user.farmer_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this farm")

    for field, value in farm_in.model_dump(exclude_unset=True).items():
        setattr(farm, field, value)

    db.commit()
    db.refresh(farm)
    return farm

@router.delete("/{farm_id}")
def delete_farm(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.FARMER, UserRole.ADMIN]))
):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    if current_user.role != UserRole.ADMIN and farm.farmer_id != current_user.farmer_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this farm")

    db.delete(farm)
    db.commit()
    return {"message": "Farm deleted successfully"}

@router.post("/{farm_id}/activities", response_model=FarmingActivityResponse)
def add_farm_activity(
    farm_id: int,
    activity_in: FarmingActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.FARMER, UserRole.ADMIN]))
):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    if current_user.role != UserRole.ADMIN and (not current_user.farmer_profile or farm.farmer_id != current_user.farmer_profile.id):
        raise HTTPException(status_code=403, detail="Not authorized to add activities to this farm")

    activity = FarmingActivity(
        farm_id=farm.id,
        title=activity_in.title,
        activity_type=activity_in.activity_type,
        description=activity_in.description,
        cost_inr=activity_in.cost_inr,
        scheduled_date=activity_in.scheduled_date,
        completed=activity_in.completed
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity
