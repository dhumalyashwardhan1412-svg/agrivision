from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from app.models.dealer_discount import DiscountType

class DealerProductBase(BaseModel):
    name: str
    category: str
    brand: Optional[str] = None
    price: float = Field(..., gt=0)
    unit: str = "Pack"
    stock_quantity: int = Field(100, ge=0)
    low_stock_threshold: int = Field(10, ge=0)
    is_organic: bool = False
    description: Optional[str] = None
    image_url: Optional[str] = None

class DealerProductCreate(DealerProductBase):
    pass

class DealerProductResponse(BaseModel):
    id: int
    shop_id: int
    name: str
    category: str
    brand: Optional[str] = None
    price: float
    unit: str
    stock_quantity: int
    stock: int # alias for frontend ease
    low_stock_threshold: int
    is_organic: bool
    is_in_stock: bool
    description: Optional[str] = None
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DealerDiscountCreate(BaseModel):
    product_id: int
    title: str
    discount_type: DiscountType = DiscountType.PERCENTAGE
    discount_value: float = Field(..., gt=0)
    min_quantity: int = 1
    max_discount_inr: Optional[float] = None
    max_discount_cap: Optional[float] = None
    start_date: Union[datetime, str]
    end_date: Union[datetime, str]
    description: Optional[str] = None
    is_active: bool = True

class DealerDiscountResponse(BaseModel):
    id: int
    shop_id: int
    product_id: int
    product_name: Optional[str] = None
    original_price: Optional[float] = None
    discounted_price: Optional[float] = None
    title: str
    discount_type: DiscountType
    discount_value: float
    min_quantity: int
    max_discount_inr: Optional[float] = None
    max_discount_cap: Optional[float] = None
    start_date: datetime
    end_date: datetime
    description: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ProductStockUpdate(BaseModel):
    low_stock_threshold: int = Field(..., ge=0)

class LowStockProductResponse(BaseModel):
    product_id: int
    shop_id: int
    shop_name: str
    product_name: str
    category: str
    current_stock: int
    low_stock_threshold: int
    status: str # "HEALTHY", "LOW", "CRITICAL", "OUT_OF_STOCK"
    suggested_restock: int
    unit: str

class DemandCategoryForecast(BaseModel):
    category: str
    current_stock: int
    sales_last_30_days: int
    trend: str # "RISING", "STABLE", "FALLING"
    demand_change_percent: float # e.g. +18.5%
    recommended_stock: int
    confidence: str # "HIGH", "MODERATE", "LOW"

class DemandInsightsResponse(BaseModel):
    shop_id: int
    shop_name: str
    has_sufficient_data: bool
    data_notice: Optional[str] = None
    forecasts: List[DemandCategoryForecast]
    overall_trend: str
    monthly_sales_chart: List[Dict[str, Any]] = []
