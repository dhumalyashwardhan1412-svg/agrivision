from typing import Dict, Any, List
from app.models.soil import SoilTest, SoilSourceType

class SoilService:
    @staticmethod
    def evaluate_lab_test(
        nitrogen: float,
        phosphorus: float,
        potassium: float,
        ph: float,
        organic_carbon: float = 0.6,
        electrical_conductivity: float = 0.5
    ) -> Dict[str, Any]:
        """
        Scientifically interprets laboratory soil test values.
        Standard Indian Agronomic Reference Ranges (kg/ha):
        - Nitrogen (N): Low (<280), Medium (280-560), High (>560)
        - Phosphorus (P): Low (<10), Medium (10-25), High (>25)
        - Potassium (K): Low (<110), Medium (110-280), High (>280)
        - pH: Acidic (<6.0), Optimal (6.0 - 7.5), Alkaline (>7.5)
        - Organic Carbon (%): Low (<0.5), Medium (0.5 - 0.75), High (>0.75)
        """
        deficiencies = []
        amendments = []
        
        # Nitrogen assessment
        if nitrogen < 200:
            n_status = "Severely Low"
            deficiencies.append("Severe Nitrogen Deficiency (Stunted growth, leaf yellowing)")
            amendments.append("Apply Neem-coated Urea in split doses or 5 tons/acre well-decomposed FYM/Vermicompost.")
        elif nitrogen < 280:
            n_status = "Low"
            deficiencies.append("Mild Nitrogen Deficiency")
            amendments.append("Incorporate green manuring (Dhaincha/Sunn hemp) or Azotobacter biofertilizer.")
        elif nitrogen <= 560:
            n_status = "Optimal"
        else:
            n_status = "High"
            amendments.append("Reduce synthetic nitrogen application to prevent excessive vegetative growth and pest vulnerability.")

        # Phosphorus assessment
        if phosphorus < 10:
            p_status = "Low"
            deficiencies.append("Phosphorus Deficiency (Weak root development, purpling of older leaves)")
            amendments.append("Apply Single Super Phosphate (SSP) or DAP along with Phosphate Solubilizing Bacteria (PSB).")
        elif phosphorus <= 25:
            p_status = "Optimal"
        else:
            p_status = "High"

        # Potassium assessment
        if potassium < 110:
            k_status = "Low"
            deficiencies.append("Potassium Deficiency (Marginal leaf scorch, reduced disease resistance)")
            amendments.append("Apply Muriate of Potash (MOP) or Sulfate of Potash (SOP) at basal sowing.")
        elif potassium <= 280:
            k_status = "Optimal"
        else:
            k_status = "High"

        # pH assessment
        if ph < 5.5:
            ph_status = "Strongly Acidic"
            deficiencies.append(f"Strongly Acidic Soil (pH {ph:.1f}) - Aluminum/Manganese toxicity risk")
            amendments.append(f"Apply Agricultural Lime (Calcium Carbonate) @ 250-500 kg/acre to raise pH.")
        elif ph < 6.5:
            ph_status = "Slightly Acidic"
        elif ph <= 7.5:
            ph_status = "Ideal / Neutral"
        elif ph <= 8.5:
            ph_status = "Moderately Alkaline"
            amendments.append("Apply Agricultural Gypsum @ 200 kg/acre and incorporate organic press-mud to lower pH.")
        else:
            ph_status = "Strongly Alkaline / Saline"
            deficiencies.append(f"Strongly Alkaline (pH {ph:.1f}) - Micronutrient lockout (Fe, Zn, Mn)")
            amendments.append("Apply Gypsum + elemental sulfur and leach excess salts with deep irrigation.")

        # Organic Carbon
        if organic_carbon < 0.5:
            oc_status = "Low"
            deficiencies.append("Low Soil Organic Carbon (<0.5%) - Poor soil microbiome activity")
            amendments.append("Apply 4-6 tonnes of compost, Jeevamrutha, or biochar to restore humus.")
        elif organic_carbon <= 0.75:
            oc_status = "Medium"
        else:
            oc_status = "High / Fertile"

        # Calculate overall fertility score
        scores = []
        scores.append(85 if n_status == "Optimal" else (50 if n_status == "Low" else (30 if n_status == "Severely Low" else 80)))
        scores.append(90 if p_status == "Optimal" else (55 if p_status == "Low" else 85))
        scores.append(90 if k_status == "Optimal" else (55 if k_status == "Low" else 85))
        scores.append(95 if "Ideal" in ph_status else (75 if "Slightly" in ph_status or "Moderately" in ph_status else 45))
        scores.append(95 if "High" in oc_status else (75 if "Medium" in oc_status else 45))
        
        fertility_index = round(sum(scores) / len(scores), 1)
        
        if fertility_index >= 80:
            health_grade = "Grade A (Prime Fertile)"
        elif fertility_index >= 65:
            health_grade = "Grade B (Moderately Fertile)"
        elif fertility_index >= 50:
            health_grade = "Grade C (Needs Nutrient Boost)"
        else:
            health_grade = "Grade D (Degraded / Action Required)"

        npk_summary = f"N: {n_status} ({nitrogen} kg/ha) | P: {p_status} ({phosphorus} kg/ha) | K: {k_status} ({potassium} kg/ha)"
        recommendations_summary = " ".join(amendments) if amendments else "Soil nutrient levels are well balanced. Maintain current organic crop rotation."

        return {
            "health_grade": health_grade,
            "fertility_index": fertility_index,
            "npk_status": npk_summary,
            "ph_status": ph_status,
            "organic_matter_status": oc_status,
            "deficiencies": deficiencies,
            "amendments_recommended": amendments,
            "recommendations_summary": recommendations_summary
        }

    @staticmethod
    def evaluate_image_estimate(
        visual_color_tone: str,
        visual_texture_notes: str,
        visual_moisture_level: str,
        visual_cracking_observed: str
    ) -> Dict[str, Any]:
        """
        Provides qualitative visual observation analysis.
        Explicitly clarifies this is visual screening, not lab data.
        """
        challenges = []
        advice = []
        
        if "Black" in visual_color_tone or "Dark Brown" in visual_color_tone:
            soil_type = "Rich Loam / Black Soil"
            humus = "Moderate to High Organic Matter visible"
            advice.append("Dark color indicates healthy presence of decayed organic matter and good water retention.")
        elif "Red" in visual_color_tone:
            soil_type = "Red Soil / Sandy Loam"
            humus = "Low to Moderate Organic Matter"
            challenges.append("Red soils typically have lower nitrogen and phosphorus retention.")
            advice.append("Add rich farmyard manure and mulching to improve water holding capacity.")
        else:
            soil_type = "Alluvial / Silt Loam"
            humus = "Moderate"
            advice.append("Alluvial texture is generally versatile for multi-crop rotations.")

        if visual_cracking_observed and "High" in visual_cracking_observed:
            challenges.append("High surface cracking observed indicating swelling clay with moisture stress.")
            advice.append("Schedule frequent lighter irrigations or install drip lines to prevent soil crusting.")

        if "Dry" in visual_moisture_level:
            challenges.append("Topsoil appears dry and parched.")
            advice.append("Pre-irrigate before land tilling to preserve beneficial microbial colonies.")

        return {
            "visual_color_tone": visual_color_tone,
            "estimated_soil_type": soil_type,
            "moisture_estimate": visual_moisture_level,
            "organic_humus_appearance": humus,
            "potential_challenges": challenges,
            "preliminary_advice": " ".join(advice),
            "disclaimer": "Photographic soil analysis provides visual clues on texture and moisture, but a chemical laboratory test is required for exact N-P-K & micronutrient dosages."
        }

soil_service = SoilService()
