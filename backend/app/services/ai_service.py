from typing import Dict, Any, List, Optional

from openai import OpenAI

from app.core.config import settings
from app.schemas.ai import AIChatResponse


class AIService:

    @staticmethod
    def get_agronomy_knowledge_response(
        query: str,
        context_data: Optional[Dict[str, Any]] = None
    ) -> AIChatResponse:

        q = query.lower()
        actions: List[str] = []

        if "tomato" in q and (
            "pest" in q
            or "disease" in q
            or "leaf" in q
            or "blight" in q
        ):
            res = (
                "**Tomato Disease & Pest Advisory:**\n\n"
                "• **Early/Late Blight:** Look for dark brown concentric "
                "target-like rings on leaves.\n"
                "• **Whitefly & Leaf Curl Virus:** Neem-based pest management "
                "and yellow sticky traps can help reduce pest pressure.\n"
                "• **Fertigation Tip:** Avoid excessive overhead irrigation "
                "to minimize prolonged leaf wetness.\n\n"
                "For an accurate diagnosis, upload a clear photo of the "
                "affected leaf."
            )

            actions = [
                "Analyze Leaf Photo",
                "Calculate Tomato Profit",
                "Check Tomato Mandi Prices"
            ]

        elif (
            "fertilizer" in q
            or "npk" in q
            or "urea" in q
            or "dap" in q
        ):
            res = (
                "**Smart Fertilizer & Soil Management Guidance:**\n\n"
                "1. Base fertilizer decisions on the crop and soil-test results.\n"
                "2. Nitrogen applications are usually better split across "
                "crop growth stages rather than applied all at once.\n"
                "3. Phosphorus and potassium requirements depend on crop, soil "
                "test, and expected yield.\n"
                "4. Organic matter such as well-decomposed compost can improve "
                "soil structure and biological activity.\n\n"
                "For a precise recommendation, provide the crop, soil pH, "
                "NPK test values, and area."
            )

            actions = [
                "Enter Soil Test Lab Data",
                "Explore Organic Farming Plan",
                "Nearby Fertilizer Shops"
            ]

        elif (
            "market" in q
            or "price" in q
            or "sell" in q
            or "mandi" in q
        ):
            res = (
                "**Market Intelligence & Selling Strategy:**\n\n"
                "• Compare prices across nearby APMC markets before selling.\n"
                "• For highly perishable crops, transportation, storage, and "
                "time-to-market can significantly affect the final margin.\n"
                "• For grains, compare current market prices with applicable "
                "government MSP information before making a selling decision.\n\n"
                "AgriVision can help you compare expected revenue, costs, "
                "and estimated profit."
            )

            actions = [
                "View Mandi Price Trends",
                "List Produce on Marketplace",
                "Compare Nearby Mandis"
            ]

        elif (
            "organic" in q
            or "bio" in q
            or "natural" in q
        ):
            res = (
                "**Organic & Natural Farming Guidance:**\n\n"
                "• Use integrated pest management to reduce unnecessary "
                "chemical applications.\n"
                "• Compost and properly prepared organic inputs can improve "
                "soil organic matter.\n"
                "• Biological control products should be selected according "
                "to the crop, pest, and approved product instructions.\n"
                "• For certified organic farming, follow the applicable "
                "certification standards and input requirements."
            )

            actions = [
                "Generate Organic Crop Plan",
                "List Organic Produce",
                "Find Bio-inputs Near Me"
            ]

        elif (
            "subsidy" in q
            or "scheme" in q
            or "loan" in q
            or "kcc" in q
        ):
            res = (
                "**Government Agricultural Schemes & Subsidies:**\n\n"
                "Government agricultural schemes can provide support for "
                "income assistance, irrigation, mechanization, crop finance, "
                "and other agricultural activities.\n\n"
                "Eligibility, subsidy percentage, and application rules "
                "can vary by state, farmer category, crop, and scheme. "
                "Always verify the current rules with the relevant "
                "government department or official portal."
            )

            actions = [
                "Locate Machinery Hubs",
                "Download Smart Farm Report",
                "Calculate Equipment ROI"
            ]

        else:
            res = (
                "**AgriVision Agronomist Assistant:**\n\n"
                "I am your AI agricultural advisor. I can help with:\n"
                "• **Soil Health Interpretation** — NPK and pH guidance\n"
                "• **Crop Recommendations** — crop selection and planning\n"
                "• **Cost & Profit Simulation** — farm financial estimates\n"
                "• **Pest & Disease Diagnosis** — photo-based screening\n"
                "• **Market Intelligence** — mandi price and selling guidance\n"
                "• **Organic Farming** — sustainable farming practices\n\n"
                "Ask me a farming question or upload a crop/soil image."
            )

            actions = [
                "Run Crop Recommendation",
                "Check Soil Health",
                "Scan Crop Disease Photo"
            ]

        return AIChatResponse(
            response=res,
            suggested_actions=actions,
            source="AgriVision Agricultural Intelligence Engine"
        )

    @classmethod
    async def chat(
        cls,
        query: str,
        farm_id: Optional[int] = None,
        context_data: Optional[Dict[str, Any]] = None
    ) -> AIChatResponse:

        # ============================================================
        # GROQ AI
        # ============================================================

        if (
            settings.GROQ_API_KEY
            and len(settings.GROQ_API_KEY.strip()) > 5
        ):
            try:
                client = OpenAI(
                    api_key=settings.GROQ_API_KEY,
                    base_url="https://api.groq.com/openai/v1"
                )

                system_prompt = (
                    "You are AgriVision AI, an expert agricultural advisor "
                    "and farm business consultant.\n\n"

                    "Your job is to provide practical, accurate, "
                    "farmer-friendly agricultural guidance.\n\n"

                    "Focus on:\n"
                    "- Crop management\n"
                    "- Soil health\n"
                    "- NPK and pH interpretation\n"
                    "- Irrigation\n"
                    "- Pest and disease management\n"
                    "- Integrated Pest Management (IPM)\n"
                    "- Organic and sustainable farming\n"
                    "- Farm economics and profitability\n"
                    "- Agricultural markets\n\n"

                    "Rules:\n"
                    "1. Give clear and practical answers.\n"
                    "2. Use simple language when possible.\n"
                    "3. Give step-by-step recommendations when appropriate.\n"
                    "4. Do not invent current market prices, weather, "
                    "government schemes, or scientific facts.\n"
                    "5. If current information is required, clearly tell "
                    "the user that current data should be verified.\n"
                    "6. For pesticide or fertilizer recommendations, advise "
                    "following the product label and local agricultural "
                    "authority guidance.\n"
                    "7. Never claim that a photo diagnosis is a confirmed "
                    "laboratory diagnosis."
                )

                user_prompt = f"Farmer Query:\n{query}"

                if context_data:
                    user_prompt += (
                        f"\n\nFarm/User Context:\n{context_data}"
                    )

                response = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {
                            "role": "system",
                            "content": system_prompt
                        },
                        {
                            "role": "user",
                            "content": user_prompt
                        }
                    ],
                    temperature=0.7,
                    max_tokens=1200
                )

                answer = response.choices[0].message.content

                if answer and answer.strip():
                    return AIChatResponse(
                        response=answer.strip(),
                        suggested_actions=[
                            "Analyze Soil",
                            "Check Market Prices",
                            "Calculate Crop Profit"
                        ],
                        source="Groq AI + AgriVision Knowledge Base"
                    )

            except Exception as e:
                print(f"[AgriVision] Groq AI error: {e}")

        # ============================================================
        # FALLBACK KNOWLEDGE ENGINE
        # ============================================================

        return cls.get_agronomy_knowledge_response(
            query,
            context_data
        )


ai_service = AIService()