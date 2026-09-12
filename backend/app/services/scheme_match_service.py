from typing import Tuple, List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.user import User, FarmerProfile
from app.models.scheme import GovernmentScheme, SavedScheme
from app.schemas.scheme import SchemeResponse, EligibilityCheckResponse

class SchemeMatchService:
    @staticmethod
    def evaluate_eligibility(farmer_user: User, scheme: GovernmentScheme) -> Dict[str, Any]:
        """
        Evaluates a farmer's profile against a government scheme's eligibility rules.
        Returns a dictionary with status, score, matched_criteria, and unmatched_criteria.
        """
        matched: List[str] = []
        unmatched: List[str] = []
        profile: Optional[FarmerProfile] = getattr(farmer_user, "farmer_profile", None)

        # 1. State / Geographic Eligibility
        scheme_state = scheme.state.strip().lower()
        farmer_state = (farmer_user.state or "").strip().lower()

        if scheme_state in ["all india", "national", "central"]:
            matched.append(f"Geographic Scope: Central scheme applicable across all Indian states including {farmer_user.state or 'your state'}")
        elif farmer_state and (farmer_state in scheme_state or scheme_state in farmer_state):
            matched.append(f"State Match: Valid for farmers in {farmer_user.state}")
        else:
            unmatched.append(f"State Restriction: Scheme is exclusively for {scheme.state}, but your profile is registered in {farmer_user.state or 'Unknown'}")

        # 2. Land Holding Eligibility
        farmer_land = profile.total_land_area if profile else getattr(farmer_user, "total_farm_land", 0.0) or 0.0
        
        if scheme.min_land_acres > 0 and farmer_land < scheme.min_land_acres:
            unmatched.append(f"Minimum Land Requirement: Scheme requires at least {scheme.min_land_acres} acres (your farm is {farmer_land} acres)")
        elif scheme.max_land_acres is not None and farmer_land > scheme.max_land_acres:
            unmatched.append(f"Maximum Land Ceiling: Scheme capped at {scheme.max_land_acres} acres for small/marginal farmers (your farm is {farmer_land} acres)")
        else:
            if scheme.max_land_acres:
                matched.append(f"Land Area Match: Your {farmer_land} acres qualifies within allowable limit ({scheme.min_land_acres} to {scheme.max_land_acres} acres)")
            else:
                matched.append(f"Land Area Match: Your {farmer_land} acres meets the scheme requirements")

        # 3. Crop Compatibility
        eligible_crops_raw = (scheme.eligible_crops or "").strip().lower()
        farmer_crops_raw = ((profile.primary_crops or "") if profile else "").strip().lower()

        if "all" in eligible_crops_raw or eligible_crops_raw == "":
            matched.append("Crop Compatibility: Open for all food grains, pulses, oilseeds, and horticultural crops")
        else:
            scheme_crops = [c.strip() for c in eligible_crops_raw.split(",") if c.strip()]
            farmer_crops = [c.strip() for c in farmer_crops_raw.split(",") if c.strip()]
            
            common_crops = [c for c in farmer_crops if any(sc in c or c in sc for sc in scheme_crops)]
            if common_crops:
                matched.append(f"Crop Match: Applicable for your registered crops ({', '.join([c.title() for c in common_crops])})")
            elif farmer_crops:
                unmatched.append(f"Crop Restriction: Scheme specifies ({scheme.eligible_crops}), but your registered crops are ({profile.primary_crops if profile else ''})")
            else:
                matched.append(f"Crop Eligibility: Open for eligible crops ({scheme.eligible_crops})")

        # 4. Special Agronomic Factors (Organic, Irrigation, Credit)
        if scheme.category.value == "IRRIGATION":
            farmer_irrigation = (profile.irrigation_source or "").lower() if profile else ""
            if "drip" in farmer_irrigation or "sprinkler" in farmer_irrigation or "borewell" in farmer_irrigation or "well" in farmer_irrigation:
                matched.append(f"Water Infrastructure: Compatible with your irrigation system ({profile.irrigation_source if profile else ''})")
            else:
                matched.append("Water Infrastructure: Water source eligible for micro-irrigation subsidy")

        if "organic" in scheme.name.lower() or "paramparagat" in scheme.name.lower():
            if profile and profile.organic_certified:
                matched.append("Organic Certification: Your verified organic farming status provides high-priority subsidy allocation")
            else:
                unmatched.append("Certification Notice: Priority given to organic certified clusters or transition farms")

        # Calculate Status & Match Score
        total_rules = len(matched) + len(unmatched)
        score_pct = round((len(matched) / total_rules) * 100, 1) if total_rules > 0 else 0.0

        # Disqualifying factors: Hard state mismatch
        has_state_mismatch = any("State Restriction" in u for u in unmatched)
        has_land_violation = any("Land" in u for u in unmatched)

        if has_state_mismatch or has_land_violation:
            status = "NOT_ELIGIBLE"
        elif score_pct >= 70.0:
            status = "ELIGIBLE"
        else:
            status = "POSSIBLY_ELIGIBLE"

        return {
            "status": status,
            "score_percentage": score_pct,
            "matched_criteria": matched,
            "unmatched_criteria": unmatched,
            "disclaimer": "Eligibility shown by AgriVision is an estimate based on your profile. Final eligibility is determined by the respective government authority."
        }

def evaluate_scheme_eligibility(scheme: GovernmentScheme, farmer_user: User) -> EligibilityCheckResponse:
    res = SchemeMatchService.evaluate_eligibility(farmer_user, scheme)
    return EligibilityCheckResponse(
        scheme_id=scheme.id,
        scheme_name=scheme.name,
        status=res["status"],
        score_percentage=res["score_percentage"],
        matched_criteria=res["matched_criteria"],
        unmatched_criteria=res["unmatched_criteria"],
        disclaimer=res["disclaimer"]
    )

def get_recommended_schemes_for_farmer(db: Session, farmer_user: User, limit: int = 15) -> List[SchemeResponse]:
    schemes = db.query(GovernmentScheme).filter(GovernmentScheme.is_active == True).all()
    
    # Get farmer's saved schemes
    profile = getattr(farmer_user, "farmer_profile", None)
    saved_ids = set()
    if profile:
        saved_records = db.query(SavedScheme).filter(SavedScheme.farmer_id == profile.id).all()
        saved_ids = {s.scheme_id for s in saved_records}

    scored_schemes = []
    for s in schemes:
        eval_res = SchemeMatchService.evaluate_eligibility(farmer_user, s)
        resp_obj = SchemeResponse.from_orm(s)
        resp_obj.is_saved = s.id in saved_ids
        resp_obj.eligibility_status = eval_res["status"]
        resp_obj.eligibility_reasons = eval_res["matched_criteria"][:3]
        
        # Sort priority: ELIGIBLE first (score descending), then POSSIBLY_ELIGIBLE
        priority = 2 if eval_res["status"] == "ELIGIBLE" else (1 if eval_res["status"] == "POSSIBLY_ELIGIBLE" else 0)
        scored_schemes.append((priority, eval_res["score_percentage"], resp_obj))

    scored_schemes.sort(key=lambda x: (x[0], x[1]), reverse=True)
    return [item[2] for item in scored_schemes[:limit]]
