from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from app.database.session import get_db
from app.core.dependencies import get_current_user, get_optional_user
from app.models.user import User
from app.models.ai_analysis import AIAnalysis
from app.schemas.ai import AIChatRequest, AIChatResponse, CropDiagnosisResponse, SoilObservationResponse
from app.services.ai_service import ai_service
from app.services.image_service import image_service

router = APIRouter(prefix="/ai", tags=["AI & Computer Vision Intelligence"])

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_agri_guide(
    req: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    AgriVision conversational assistant for crop guidance, disease management,
    soil nutrient advice, and market strategies with Gemini AI & agronomist fallback.
    """
    context = req.context_data or {}
    if current_user:
        context["user_name"] = current_user.full_name
        context["user_state"] = current_user.state
        context["user_district"] = current_user.district

    res = await ai_service.chat(
        query=req.message,
        farm_id=req.farm_id,
        context_data=context,
        language=req.language or "en"
    )

    # Save to history if authenticated
    if current_user:
        analysis_record = AIAnalysis(
            user_id=current_user.id,
            farm_id=req.farm_id,
            analysis_type="AGRI_ASSISTANT",
            prompt_query=req.message,
            ai_response_text=res.response
        )
        db.add(analysis_record)
        db.commit()

    return res

@router.post("/analyze-crop-leaf", response_model=CropDiagnosisResponse)
async def analyze_crop_leaf_disease(
    file: UploadFile = File(...),
    crop_hint: Optional[str] = Form(None),
    farm_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Validates uploaded crop/leaf photo, analyzes plant health condition,
    identifies possible diseases, provides symptoms, organic and chemical treatment
    recommendations, confidence score, and medical/laboratory disclaimer.
    """
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size exceeds 10MB limit")

    file_url = image_service.save_upload_file(contents, file.filename)
    diagnosis = image_service.diagnose_crop_image(file_url, crop_hint)

    if current_user:
        record = AIAnalysis(
            user_id=current_user.id,
            farm_id=farm_id,
            analysis_type="CROP_DISEASE_DIAGNOSIS",
            image_url=file_url,
            detected_crop=diagnosis.detected_crop,
            health_status=diagnosis.health_status,
            condition_name=diagnosis.condition_name,
            confidence_percentage=diagnosis.confidence_percentage,
            symptoms_observed=diagnosis.symptoms_observed,
            organic_solution=diagnosis.organic_solution,
            chemical_treatment=diagnosis.chemical_treatment,
            preventive_measures=diagnosis.preventive_measures,
            disclaimer=diagnosis.disclaimer
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        diagnosis.id = record.id

    return diagnosis

@router.post("/analyze-soil-photo", response_model=SoilObservationResponse)
async def analyze_soil_photo(
    file: UploadFile = File(...),
    farm_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Processes photographic soil topsoil image for visual texture, moisture appearance,
    and organic matter estimation. Explicitly notes this does not replace laboratory NPK assays.
    """
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size exceeds 10MB limit")

    file_url = image_service.save_upload_file(contents, file.filename)
    obs = image_service.analyze_soil_photo(file_url)

    if current_user:
        record = AIAnalysis(
            user_id=current_user.id,
            farm_id=farm_id,
            analysis_type="SOIL_OBSERVATION",
            image_url=file_url,
            detected_crop="Soil Sample",
            health_status=obs.visual_color_tone,
            condition_name=obs.estimated_soil_type,
            symptoms_observed=obs.moisture_estimate,
            organic_solution=obs.preliminary_advice,
            disclaimer=obs.disclaimer
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        obs.id = record.id

    return obs
