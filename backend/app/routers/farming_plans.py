from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.farm import Farm
from app.models.crop import Crop
from app.models.farming_plan import FarmingPlan, FarmingMethodology
from app.schemas.farming_plan import FarmingPlanCreate, FarmingPlanResponse
from app.services.profit_service import profit_service
from app.schemas.profit import ProfitCalculationRequest

router = APIRouter(prefix="/farming-plans", tags=["Farming Plans"])

@router.post("/generate", response_model=FarmingPlanResponse)
def generate_farming_plan(
    plan_in: FarmingPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farm = db.query(Farm).filter(Farm.id == plan_in.farm_id).first()
    crop = db.query(Crop).filter(Crop.id == plan_in.crop_id).first()
    if not farm or not crop:
        raise HTTPException(status_code=404, detail="Farm or Crop not found")

    area = plan_in.target_area_acres or farm.total_area_acres or 1.0

    # Calculate financial metrics
    profit_res = profit_service.calculate_profit(
        ProfitCalculationRequest(crop_name=crop.name, area_acres=area)
    )

    # Build methodology-specific stages
    if plan_in.methodology == FarmingMethodology.ORGANIC:
        stages = [
            {
                "stage_name": "Field Preparation & Basal Bio-Enrichment",
                "day_start": 1,
                "day_end": 15,
                "key_objectives": "Deep ploughing, weed eradication, and building soil organic matter",
                "activities": [
                    "2 deep cross ploughings followed by rotavator leveling",
                    "Incorporate 6 tonnes/acre well-rotted Farmyard Manure (FYM)",
                    "Apply Trichoderma viride enriched compost (5kg/acre)"
                ],
                "inputs_required": ["FYM Compost", "Trichoderma viride", "Neem Cake"],
                "cost_estimate_inr": round(profit_res.cost_breakdown.fertilizer_cost_inr * 0.4 + 3000, 2),
                "precautions": ["Ensure soil is in fine tilth condition before seedbed forming"]
            },
            {
                "stage_name": "Seed Inoculation & Sowing / Transplanting",
                "day_start": 16,
                "day_end": 30,
                "key_objectives": "Optimal plant population and early biological root colonization",
                "activities": [
                    "Bio-priming seeds with Pseudomonas fluorescens (10g/kg)",
                    "Raise raised nursery beds with drip irrigation tape",
                    "Transplant healthy 25-day old seedlings during evening hours"
                ],
                "inputs_required": ["Certified Organic Seeds", "Pseudomonas", "Drip emitters"],
                "cost_estimate_inr": round(profit_res.cost_breakdown.seed_cost_inr + 2000, 2),
                "precautions": ["Avoid chemical fungicides during organic bio-priming"]
            },
            {
                "stage_name": "Vegetative Growth & Liquid Bio-Fertigation",
                "day_start": 31,
                "day_end": 60,
                "key_objectives": "Canopy establishment and pest prevention",
                "activities": [
                    "Apply Jeevamrutha (200L/acre) via irrigation water every 10 days",
                    "Prophylactic spray of 5% Neem Seed Kernel Extract (NSKE)",
                    "Install 15 yellow sticky traps per acre for sucking pest control"
                ],
                "inputs_required": ["Jeevamrutha", "Neem Oil 10000ppm", "Sticky Traps"],
                "cost_estimate_inr": round(profit_res.cost_breakdown.crop_protection_cost_inr * 0.5 + 1500, 2),
                "precautions": ["Check undersides of leaves weekly for early insect colonies"]
            },
            {
                "stage_name": "Flowering, Fruit Set & Final Harvest",
                "day_start": 61,
                "day_end": crop.duration_days,
                "key_objectives": "Fruit enlargement, organic quality assurance, and grade-A harvesting",
                "activities": [
                    "Spray Panchagavya (3% foliar) and seaweed liquid extract",
                    "Gradual reduction of irrigation 5 days prior to picking",
                    "Harvest in early morning hours into ventilated plastic crates"
                ],
                "inputs_required": ["Panchagavya", "Harvesting Crates", "Clean Packaging"],
                "cost_estimate_inr": round(profit_res.cost_breakdown.labour_cost_inr * 0.6 + 2500, 2),
                "precautions": ["Handle harvest gently to prevent skin bruising and spoilage"]
            }
        ]
        fert_sched = "Apply 6 tonnes FYM + 250kg Neem Cake at land prep. Drench Jeevamrutha @ 200L/acre every 10 days. Spray Panchagavya (3%) at 30, 60, and 75 DAT."
        pest_sched = "IPM with Yellow/Blue sticky traps (20/acre), Pheromone traps, and prophylactic sprays of Neem Oil (5ml/L) & Bacillus thuringiensis."
    else: # MODERN / PRECISION / CONVENTIONAL
        stages = [
            {
                "stage_name": "Laser Land Leveling & Seedbed Preparation",
                "day_start": 1,
                "day_end": 12,
                "key_objectives": "Precision land grading for uniform water distribution",
                "activities": [
                    "Laser land leveling to save 20-30% irrigation water",
                    "Basal fertilizer broadcasting (DAP 50kg/acre + MOP 30kg/acre + Zinc Sulfate 10kg/acre)",
                    "Laying inline drip irrigation tubing and silver-black plastic mulch"
                ],
                "inputs_required": ["DAP Fertilizer", "Muriate of Potash", "Plastic Mulch Film", "Drip lateral tubes"],
                "cost_estimate_inr": round(profit_res.cost_breakdown.fertilizer_cost_inr * 0.4 + profit_res.cost_breakdown.equipment_cost_inr * 0.5, 2),
                "precautions": ["Ensure proper lateral spacing of 1.2m between drip rows"]
            },
            {
                "stage_name": "Precision Sowing & Automated Fertigation",
                "day_start": 13,
                "day_end": 45,
                "key_objectives": "Rapid seedling establishment with automated water-soluble nutrients",
                "activities": [
                    "Precision seedling transplanting using transplanter/manual guide",
                    "Automated fertigation with 19:19:19 water soluble fertilizer (3kg/acre/week)",
                    "Early herbicide or manual weeding between mulch rows"
                ],
                "inputs_required": ["F1 Hybrid Seeds", "WSF 19:19:19", "Automated Venturi injector"],
                "cost_estimate_inr": round(profit_res.cost_breakdown.seed_cost_inr + 2500, 2),
                "precautions": ["Flush drip filters weekly to prevent emitter clogging"]
            },
            {
                "stage_name": "Flowering, Fruit Development & Sensor Monitoring",
                "day_start": 46,
                "day_end": 85,
                "key_objectives": "Nutrient boost for uniform sizing and crop protection",
                "activities": [
                    "Switch fertigation to 0:52:34 (MKP) and Calcium Nitrate + Boron",
                    "Targeted drone or knapsack spray of systemic fungicide for blight control",
                    "Soil moisture sensor tracking to maintain 70-80% field capacity"
                ],
                "inputs_required": ["MKP 0:52:34", "Calcium Nitrate", "Boron 20%", "Certified Agro-chemicals"],
                "cost_estimate_inr": round(profit_res.cost_breakdown.crop_protection_cost_inr + 3000, 2),
                "precautions": ["Maintain pre-harvest withholding intervals (PHI) for crop safety"]
            },
            {
                "stage_name": "Harvesting, Grading & Cold Chain Dispatch",
                "day_start": 86,
                "day_end": crop.duration_days,
                "key_objectives": "High-yield harvesting, mechanical grading, and market dispatch",
                "activities": [
                    "Sequential harvesting at breaker/turning stage for maximum shelf life",
                    "Mechanical grading into Grade A, B, and C",
                    "Immediate packing into Corrugated Fiberboard (CFB) boxes for dispatch"
                ],
                "inputs_required": ["CFB Boxes", "Grading trays", "Cold storage pallet bags"],
                "cost_estimate_inr": round(profit_res.cost_breakdown.packaging_cost_inr + profit_res.cost_breakdown.transportation_cost_inr, 2),
                "precautions": ["Do not expose harvested produce to direct afternoon sunlight"]
            }
        ]
        fert_sched = "Basal: DAP (50kg) + MOP (30kg) + Zinc. Fertigation schedule via drip: Week 2-5: 19:19:19 (3kg/wk), Week 6-9: 12:61:00 (2kg/wk), Week 10+: 0:0:50 + Calcium Nitrate (3kg/wk)."
        pest_sched = "Integrated management: Mancozeb (2g/L) for early blight, Chlorantraniliprole (0.3ml/L) for fruit borers, and preventive bio-agents."

    plan = FarmingPlan(
        farm_id=farm.id,
        crop_id=crop.id,
        title=f"{plan_in.methodology.value.title()} Farming Plan for {crop.name} ({area} Acres)",
        methodology=plan_in.methodology,
        target_area_acres=area,
        total_estimated_cost_inr=profit_res.cost_breakdown.total_cost_inr,
        expected_yield_kg=profit_res.expected_yield_kg,
        expected_revenue_inr=profit_res.expected_revenue_inr,
        estimated_net_profit_inr=profit_res.estimated_profit_inr,
        roi_percent=profit_res.return_on_investment_roi_percent,
        schedule_stages_json=stages,
        fertilizer_schedule=fert_sched,
        irrigation_schedule="Automated Drip: 2 hours every 2 days during vegetative; 3 hours daily during peak flowering & fruiting.",
        pest_disease_management=pest_sched,
        harvest_guidelines="Harvest at 75-80% maturity stage in morning hours. Grade according to size and color uniformity.",
        equipment_needed="Tractor 45HP, Rotavator, Drip Irrigation System, Mulching Machine, Knapsack Sprayer.",
        notes="Generated based on scientific agro-climatic protocols and validated farm data."
    )

    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan

@router.get("/farm/{farm_id}", response_model=List[FarmingPlanResponse])
def get_plans_for_farm(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(FarmingPlan).filter(FarmingPlan.farm_id == farm_id).order_by(FarmingPlan.created_at.desc()).all()

@router.get("/{plan_id}", response_model=FarmingPlanResponse)
def get_plan_by_id(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = db.query(FarmingPlan).filter(FarmingPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Farming plan not found")
    return plan
