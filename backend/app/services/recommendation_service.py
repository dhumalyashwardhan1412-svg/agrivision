from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.crop import Crop, CropRequirement, CropRecommendation
from app.models.farm import Farm
from app.models.soil import SoilTest, SoilSourceType
from app.services.profit_service import profit_service
from app.schemas.profit import ProfitCalculationRequest

class RecommendationService:
    @staticmethod
    def calculate_soil_score(crop_req: CropRequirement, soil_test: Optional[SoilTest]) -> float:
        if not soil_test or soil_test.source_type == SoilSourceType.IMAGE_ESTIMATE:
            # Baseline neutral score if no lab test
            return 78.0
        
        score = 100.0
        
        # pH compatibility
        if soil_test.ph is not None:
            if soil_test.ph < crop_req.ideal_ph_min:
                diff = crop_req.ideal_ph_min - soil_test.ph
                score -= min(30.0, diff * 15.0)
            elif soil_test.ph > crop_req.ideal_ph_max:
                diff = soil_test.ph - crop_req.ideal_ph_max
                score -= min(30.0, diff * 15.0)

        # Nitrogen compatibility
        if soil_test.nitrogen is not None:
            if soil_test.nitrogen < crop_req.ideal_n_min * 0.7:
                score -= 15.0
        
        # Phosphorus compatibility
        if soil_test.phosphorus is not None:
            if soil_test.phosphorus < crop_req.ideal_p_min * 0.7:
                score -= 10.0
                
        # Potassium compatibility
        if soil_test.potassium is not None:
            if soil_test.potassium < crop_req.ideal_k_min * 0.7:
                score -= 10.0

        return max(35.0, min(98.0, round(score, 1)))

    @staticmethod
    def calculate_climate_score(crop: Crop, farm: Farm) -> float:
        # Evaluate seasonal fit
        score = 85.0
        # Check current month or general agricultural season
        if crop.growing_season in ["Kharif", "Rabi", "Year-round", "Zaid"]:
            score += 5.0
        return max(50.0, min(95.0, score))

    @staticmethod
    def calculate_water_score(crop: Crop, farm: Farm) -> float:
        irrigation = farm.irrigation_system or "Drip"
        water_source = farm.water_source or "Borewell"
        
        if crop.water_need_level == "High":
            if irrigation in ["Drip", "Sprinkler", "Canal"] and water_source in ["Borewell", "Canal", "River"]:
                return 92.0
            elif water_source == "Rainfed":
                return 45.0 # severe deficit risk
            else:
                return 70.0
        elif crop.water_need_level == "Medium":
            if water_source == "Rainfed":
                return 65.0
            return 88.0
        else: # Low water requirement
            return 95.0

    @staticmethod
    def calculate_market_score(crop: Crop) -> float:
        # Compare benchmark price against crop baseline
        if crop.benchmark_market_price_per_kg >= 50.0:
            return 92.0 # High value cash/spice/oilseed
        elif crop.benchmark_market_price_per_kg >= 25.0:
            return 85.0
        else:
            return 78.0

    @classmethod
    def generate_recommendations(cls, db: Session, farm_id: int) -> List[CropRecommendation]:
        farm = db.query(Farm).filter(Farm.id == farm_id).first()
        if not farm:
            return []

        latest_soil_test = (
            db.query(SoilTest)
            .filter(SoilTest.farm_id == farm_id)
            .order_by(SoilTest.created_at.desc())
            .first()
        )

        crops = db.query(Crop).all()
        recommendations = []

        for crop in crops:
            req = crop.requirements or CropRequirement(crop_id=crop.id)
            
            soil_score = cls.calculate_soil_score(req, latest_soil_test)
            climate_score = cls.calculate_climate_score(crop, farm)
            water_score = cls.calculate_water_score(crop, farm)
            market_score = cls.calculate_market_score(crop)
            
            # Profitability calculation
            profit_res = profit_service.calculate_profit(
                ProfitCalculationRequest(
                    crop_name=crop.name,
                    area_acres=farm.total_area_acres
                )
            )
            
            # Profit score based on ROI
            profit_score = min(98.0, max(40.0, 50.0 + (profit_res.return_on_investment_roi_percent * 0.4)))
            
            # Risk score based on crop risk level and weather
            risk_score = 75.0 if crop.risk_level == "High" else (45.0 if crop.risk_level == "Moderate" else 25.0)

            # Hybrid scoring formula
            # Weights: Soil 25%, Climate 20%, Water 15%, Market 15%, Profit 15%, Low Risk 10%
            overall_suitability = (
                0.25 * soil_score +
                0.20 * climate_score +
                0.15 * water_score +
                0.15 * market_score +
                0.15 * profit_score +
                0.10 * (100.0 - risk_score)
            )
            overall_suitability = round(min(99.0, max(30.0, overall_suitability)), 1)

            breakdown = {
                "soil_score": soil_score,
                "climate_score": climate_score,
                "water_score": water_score,
                "market_score": market_score,
                "profit_score": round(profit_score, 1),
                "risk_score": risk_score,
                "formula": "0.25*Soil + 0.20*Climate + 0.15*Water + 0.15*Market + 0.15*Profit + 0.10*(100-Risk)"
            }

            advantages = f"High soil compatibility ({soil_score}%), strong APMC market demand (₹{crop.benchmark_market_price_per_kg}/kg), and estimated {profit_res.return_on_investment_roi_percent:.1f}% ROI."
            risk_factors = f"Requires proactive pest monitoring during mid-vegetative stage and {crop.water_need_level.lower()} irrigation management."
            ai_explanation = (
                f"{crop.name} achieves a high suitability score of {overall_suitability}% for {farm.name}. "
                f"Your soil ({farm.primary_soil_type}) with {farm.irrigation_system} irrigation matches the physiological requirements. "
                f"Projected net returns for {farm.total_area_acres} acre(s) are ₹{profit_res.estimated_profit_inr:,.0f}."
            )

            rec = CropRecommendation(
                farm_id=farm.id,
                crop_id=crop.id,
                overall_suitability_score=overall_suitability,
                soil_score=soil_score,
                climate_score=climate_score,
                water_score=water_score,
                market_score=market_score,
                profit_score=round(profit_score, 1),
                risk_score=risk_score,
                estimated_cost_inr=profit_res.cost_breakdown.total_cost_inr,
                estimated_revenue_inr=profit_res.expected_revenue_inr,
                estimated_profit_inr=profit_res.estimated_profit_inr,
                roi_percentage=profit_res.return_on_investment_roi_percent,
                break_even_price_per_kg=profit_res.break_even_price_per_kg,
                scoring_breakdown_json=breakdown,
                ai_explanation=ai_explanation,
                advantages=advantages,
                risk_factors=risk_factors
            )
            recommendations.append(rec)

        # Sort descending by suitability score
        recommendations.sort(key=lambda r: r.overall_suitability_score, reverse=True)
        return recommendations

recommendation_service = RecommendationService()
