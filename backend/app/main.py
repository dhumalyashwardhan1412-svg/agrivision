import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database.database import engine, Base
import app.models # Ensure all models are registered
from app.utils.seed_data import seed_database

# Routers
from app.routers import (
    auth, users, farms, soil, crops, recommendations,
    farming_plans, profit, markets, equipment, shops,
    marketplace, orders, notifications, ai, reports
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist & seed demo data
    Base.metadata.create_all(bind=engine)
    try:
        seed_database()
    except Exception as e:
        print(f"Database initialization note: {e}")
    yield
    # Shutdown

app = FastAPI(
    title="AgriVision API",
    description="Smart Agriculture & Agritech RESTful API Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # allow all for local dev flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded static files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Mount API Routers under /api/v1
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_prefix)
app.include_router(users.router, prefix=api_prefix)
app.include_router(farms.router, prefix=api_prefix)
app.include_router(soil.router, prefix=api_prefix)
app.include_router(crops.router, prefix=api_prefix)
app.include_router(recommendations.router, prefix=api_prefix)
app.include_router(farming_plans.router, prefix=api_prefix)
app.include_router(profit.router, prefix=api_prefix)
app.include_router(markets.router, prefix=api_prefix)
app.include_router(equipment.router, prefix=api_prefix)
app.include_router(shops.router, prefix=api_prefix)
app.include_router(marketplace.router, prefix=api_prefix)
app.include_router(orders.router, prefix=api_prefix)
app.include_router(notifications.router, prefix=api_prefix)
app.include_router(ai.router, prefix=api_prefix)
app.include_router(reports.router, prefix=api_prefix)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AgriVision Smart Agriculture Backend",
        "version": "1.0.0"
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to AgriVision API",
        "docs_url": "/docs",
        "api_v1": api_prefix
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
