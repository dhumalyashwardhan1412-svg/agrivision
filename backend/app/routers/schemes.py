from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user, get_optional_user, require_role
from app.models.user import User, UserRole, FarmerProfile
from app.models.scheme import GovernmentScheme, SavedScheme, GovernmentType, SchemeCategory
from app.schemas.scheme import (
    SchemeResponse,
    EligibilityCheckResponse,
    SavedSchemeResponse,
    SavedSchemeCreate,
    SchemeCreate,
    SchemeUpdate
)
from app.services.scheme_match_service import evaluate_scheme_eligibility, get_recommended_schemes_for_farmer

router = APIRouter(prefix="/schemes", tags=["Government Schemes"])

@router.get("", response_model=List[SchemeResponse])
def get_schemes(
    q: Optional[str] = None,
    government_type: Optional[GovernmentType] = None,
    category: Optional[SchemeCategory] = None,
    state: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    query = db.query(GovernmentScheme).filter(GovernmentScheme.is_active == True)

    if q:
        search_fmt = f"%{q}%"
        query = query.filter(
            (GovernmentScheme.name.ilike(search_fmt)) |
            (GovernmentScheme.short_description.ilike(search_fmt)) |
            (GovernmentScheme.benefits.ilike(search_fmt))
        )
    if government_type:
        query = query.filter(GovernmentScheme.government_type == government_type)
    if category:
        query = query.filter(GovernmentScheme.category == category)
    if state and state.lower() != "all" and state.lower() != "all india":
        query = query.filter(
            (GovernmentScheme.state.ilike("%all%")) |
            (GovernmentScheme.state.ilike(f"%{state}%"))
        )

    schemes = query.order_by(GovernmentScheme.is_verified.desc(), GovernmentScheme.name.asc()).all()
    
    # Check saved status if logged in as farmer
    saved_ids = set()
    if current_user and current_user.role == UserRole.FARMER:
        farmer = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()
        if farmer:
            saved = db.query(SavedScheme).filter(SavedScheme.farmer_id == farmer.id).all()
            saved_ids = {s.scheme_id for s in saved}

    results = []
    for s in schemes:
        resp = SchemeResponse.from_orm(s)
        resp.is_saved = s.id in saved_ids
        results.append(resp)
    return results

@router.get("/recommended", response_model=List[SchemeResponse])
def get_recommended_schemes(
    current_user: User = Depends(require_role([UserRole.FARMER])),
    db: Session = Depends(get_db)
):
    return get_recommended_schemes_for_farmer(db, current_user, limit=15)

@router.get("/saved", response_model=List[SavedSchemeResponse])
def get_saved_schemes(
    current_user: User = Depends(require_role([UserRole.FARMER])),
    db: Session = Depends(get_db)
):
    farmer = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()
    if not farmer:
        return []

    saved_items = db.query(SavedScheme).filter(SavedScheme.farmer_id == farmer.id).order_by(SavedScheme.saved_at.desc()).all()
    
    result = []
    for item in saved_items:
        scheme_resp = SchemeResponse.from_orm(item.scheme)
        scheme_resp.is_saved = True
        result.append(SavedSchemeResponse(
            id=item.id,
            scheme_id=item.scheme_id,
            scheme=scheme_resp,
            notes=item.notes,
            saved_at=item.saved_at
        ))
    return result

@router.post("/{scheme_id}/save", response_model=SavedSchemeResponse)
def save_scheme(
    scheme_id: int,
    req: SavedSchemeCreate,
    current_user: User = Depends(require_role([UserRole.FARMER])),
    db: Session = Depends(get_db)
):
    scheme = db.query(GovernmentScheme).filter(GovernmentScheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found")

    farmer = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()
    if not farmer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farmer profile not found")

    saved = db.query(SavedScheme).filter(
        SavedScheme.farmer_id == farmer.id,
        SavedScheme.scheme_id == scheme_id
    ).first()

    if not saved:
        saved = SavedScheme(
            farmer_id=farmer.id,
            scheme_id=scheme_id,
            notes=req.notes
        )
        db.add(saved)
        db.commit()
        db.refresh(saved)
    else:
        if req.notes is not None:
            saved.notes = req.notes
            db.commit()
            db.refresh(saved)

    scheme_resp = SchemeResponse.from_orm(saved.scheme)
    scheme_resp.is_saved = True
    return SavedSchemeResponse(
        id=saved.id,
        scheme_id=saved.scheme_id,
        scheme=scheme_resp,
        notes=saved.notes,
        saved_at=saved.saved_at
    )

@router.delete("/{scheme_id}/save")
def unsave_scheme(
    scheme_id: int,
    current_user: User = Depends(require_role([UserRole.FARMER])),
    db: Session = Depends(get_db)
):
    farmer = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()
    if not farmer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farmer profile not found")

    deleted = db.query(SavedScheme).filter(
        SavedScheme.farmer_id == farmer.id,
        SavedScheme.scheme_id == scheme_id
    ).delete()
    db.commit()

    return {"message": "Scheme removed from saved list", "deleted": deleted > 0}

@router.get("/{scheme_id}", response_model=SchemeResponse)
def get_scheme_by_id(
    scheme_id: int,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    scheme = db.query(GovernmentScheme).filter(GovernmentScheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Government scheme not found")
    
    resp = SchemeResponse.from_orm(scheme)
    if current_user and current_user.role == UserRole.FARMER:
        farmer = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()
        if farmer:
            saved = db.query(SavedScheme).filter(
                SavedScheme.farmer_id == farmer.id,
                SavedScheme.scheme_id == scheme_id
            ).first()
            resp.is_saved = saved is not None
            eval_res = evaluate_scheme_eligibility(scheme, current_user)
            resp.eligibility_status = eval_res.status
            resp.eligibility_reasons = eval_res.matched_criteria

    return resp

@router.get("/{scheme_id}/eligibility", response_model=EligibilityCheckResponse)
def check_scheme_eligibility(
    scheme_id: int,
    current_user: User = Depends(require_role([UserRole.FARMER])),
    db: Session = Depends(get_db)
):
    scheme = db.query(GovernmentScheme).filter(GovernmentScheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found")

    return evaluate_scheme_eligibility(scheme, current_user)
