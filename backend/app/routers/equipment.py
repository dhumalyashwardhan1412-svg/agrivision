from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.equipment import Equipment, EquipmentRental
from app.schemas.equipment import EquipmentResponse, EquipmentRentalCreate, EquipmentRentalResponse

router = APIRouter(prefix="/equipment", tags=["Farm Equipment & Machinery"])

@router.get("", response_model=List[EquipmentResponse])
def list_available_equipment(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Equipment).filter(Equipment.is_available_for_rent == True)
    if category:
        query = query.filter(Equipment.category.ilike(f"%{category}%"))
    return query.all()

@router.post("/rent", response_model=EquipmentRentalResponse)
def rent_equipment(
    rental_in: EquipmentRentalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.FARMER, UserRole.ADMIN]))
):
    if not current_user.farmer_profile:
        raise HTTPException(status_code=400, detail="User does not have a farmer profile")

    equipment = db.query(Equipment).filter(Equipment.id == rental_in.equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    days = max(1, (rental_in.end_date - rental_in.start_date).days or 1)
    total_cost = days * equipment.daily_rental_rate_inr

    rental = EquipmentRental(
        equipment_id=equipment.id,
        shop_id=rental_in.shop_id,
        farmer_id=current_user.farmer_profile.id,
        start_date=rental_in.start_date,
        end_date=rental_in.end_date,
        total_days=days,
        daily_rate_applied=equipment.daily_rental_rate_inr,
        total_cost_inr=total_cost,
        status="CONFIRMED",
        notes=rental_in.notes
    )
    db.add(rental)
    db.commit()
    db.refresh(rental)
    return rental

@router.get("/my-rentals", response_model=List[EquipmentRentalResponse])
def get_my_rentals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.farmer_profile:
        return []
    return (
        db.query(EquipmentRental)
        .filter(EquipmentRental.farmer_id == current_user.farmer_profile.id)
        .order_by(EquipmentRental.created_at.desc())
        .all()
    )
