from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class FarmingActivityBase(BaseModel):
    title: str
    activity_type: str
    description: Optional[str] = None
    cost_inr: float = 0.0
    scheduled_date: datetime
    completed: bool = False

class FarmingActivityCreate(FarmingActivityBase):
    pass

class FarmingActivityResponse(FarmingActivityBase):
    id: int
    farm_id: int
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class LandParcelCreate(BaseModel):
    parcel_name: str
    area_acres: float
    current_crop: Optional[str] = None
    sowing_date: Optional[datetime] = None
    expected_harvest_date: Optional[datetime] = None

class LandParcelResponse(LandParcelCreate):
    id: int
    farm_id: int

    class Config:
        from_attributes = True

class FarmBase(BaseModel):
    name: str
    location_name: str
    state: str
    district: str
    village: Optional[str] = None
    total_area_acres: float = 1.0
    latitude: Optional[float] = 30.9010
    longitude: Optional[float] = 75.8573
    elevation_meters: Optional[float] = 250.0
    primary_soil_type: str = "Loamy"
    water_source: str = "Borewell"
    irrigation_system: str = "Drip"
    budget_inr: float = 50000.0

class FarmCreate(FarmBase):
    pass

class FarmUpdate(BaseModel):
    name: Optional[str] = None
    location_name: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    total_area_acres: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    primary_soil_type: Optional[str] = None
    water_source: Optional[str] = None
    irrigation_system: Optional[str] = None
    budget_inr: Optional[float] = None

class FarmResponse(FarmBase):
    id: int
    farmer_id: int
    created_at: datetime
    updated_at: datetime
    activities: List[FarmingActivityResponse] = []

    class Config:
        from_attributes = True
