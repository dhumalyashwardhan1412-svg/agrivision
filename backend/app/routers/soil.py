from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.farm import Farm
from app.models.soil import SoilTest, SoilSourceType
from app.schemas.soil import SoilTestCreateLab, SoilTestCreateAI, SoilTestResponse, SoilAnalysisResult
from app.services.soil_service import soil_service

router = APIRouter(prefix="/soil", tags=["Soil Testing & Analysis"])

@router.post("/lab-test", response_model=SoilTestResponse)
def record_laboratory_soil_test(
    data_in: SoilTestCreateLab,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farm = db.query(Farm).filter(Farm.id == data_in.farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    evaluation = soil_service.evaluate_lab_test(
        nitrogen=data_in.nitrogen,
        phosphorus=data_in.phosphorus,
        potassium=data_in.potassium,
        ph=data_in.ph,
        organic_carbon=data_in.organic_carbon or 0.65,
        electrical_conductivity=data_in.electrical_conductivity or 0.5
    )

    soil_test = SoilTest(
        farm_id=farm.id,
        source_type=SoilSourceType.LABORATORY,
        nitrogen=data_in.nitrogen,
        phosphorus=data_in.phosphorus,
        potassium=data_in.potassium,
        ph=data_in.ph,
        electrical_conductivity=data_in.electrical_conductivity,
        organic_carbon=data_in.organic_carbon,
        moisture_percentage=data_in.moisture_percentage,
        soil_texture=data_in.soil_texture,
        zinc_ppm=data_in.zinc_ppm,
        iron_ppm=data_in.iron_ppm,
        sulfur_ppm=data_in.sulfur_ppm,
        lab_name=data_in.lab_name,
        health_grade=evaluation["health_grade"],
        npk_status=evaluation["npk_status"],
        recommendations_summary=evaluation["recommendations_summary"],
        notes=data_in.notes
    )
    db.add(soil_test)
    db.commit()
    db.refresh(soil_test)
    return soil_test

@router.post("/image-estimate", response_model=SoilTestResponse)
def record_image_estimated_soil_test(
    data_in: SoilTestCreateAI,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farm = db.query(Farm).filter(Farm.id == data_in.farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    obs = soil_service.evaluate_image_estimate(
        visual_color_tone=data_in.visual_color_tone or "Dark Brown",
        visual_texture_notes=data_in.visual_texture_notes or "Loam",
        visual_moisture_level=data_in.visual_moisture_level or "Moist",
        visual_cracking_observed=data_in.visual_cracking_observed or "None"
    )

    soil_test = SoilTest(
        farm_id=farm.id,
        source_type=SoilSourceType.IMAGE_ESTIMATE,
        image_url=data_in.image_url,
        visual_color_tone=data_in.visual_color_tone,
        visual_texture_notes=data_in.visual_texture_notes,
        visual_moisture_level=data_in.visual_moisture_level,
        visual_cracking_observed=data_in.visual_cracking_observed,
        health_grade="Visual Estimate (Grade B)",
        npk_status="Visual screening only. Chemical NPK unavailable without lab test.",
        recommendations_summary=obs["preliminary_advice"],
        notes=data_in.notes
    )
    db.add(soil_test)
    db.commit()
    db.refresh(soil_test)
    return soil_test

@router.get("/records/{farm_id}", response_model=List[SoilTestResponse])
def get_farm_soil_records(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(SoilTest).filter(SoilTest.farm_id == farm_id).order_by(SoilTest.created_at.desc()).all()

@router.get("/analyze/{soil_test_id}", response_model=SoilAnalysisResult)
def analyze_specific_soil_test(
    soil_test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    soil_test = db.query(SoilTest).filter(SoilTest.id == soil_test_id).first()
    if not soil_test:
        raise HTTPException(status_code=404, detail="Soil test not found")

    if soil_test.source_type == SoilSourceType.IMAGE_ESTIMATE:
        return SoilAnalysisResult(
            soil_test_id=soil_test.id,
            health_grade=soil_test.health_grade or "Visual Screening",
            npk_balance={"N": "Unmeasured (Visual)", "P": "Unmeasured (Visual)", "K": "Unmeasured (Visual)"},
            ph_status="Estimated Neutral (6.5 - 7.2)",
            fertility_index=72.0,
            organic_matter_status=soil_test.visual_texture_notes or "Moderate",
            deficiencies=["Laboratory chemical assay required for exact micronutrient deficiencies."],
            amendments_recommended=["Add organic compost, maintain moisture, and submit soil sample to district lab."]
        )

    res = soil_service.evaluate_lab_test(
        nitrogen=soil_test.nitrogen or 240,
        phosphorus=soil_test.phosphorus or 20,
        potassium=soil_test.potassium or 180,
        ph=soil_test.ph or 6.8,
        organic_carbon=soil_test.organic_carbon or 0.6,
        electrical_conductivity=soil_test.electrical_conductivity or 0.5
    )

    return SoilAnalysisResult(
        soil_test_id=soil_test.id,
        health_grade=res["health_grade"],
        npk_balance={
            "nitrogen_kg_ha": soil_test.nitrogen,
            "phosphorus_kg_ha": soil_test.phosphorus,
            "potassium_kg_ha": soil_test.potassium
        },
        ph_status=res["ph_status"],
        fertility_index=res["fertility_index"],
        organic_matter_status=res["organic_matter_status"],
        deficiencies=res["deficiencies"],
        amendments_recommended=res["amendments_recommended"]
    )
