import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database.database import engine, Base
from app.database.migrations import run_safe_schema_migrations

# Important: registers all SQLAlchemy models
import app.models

from app.utils.seed_data import seed_database

# =========================================================
# ROUTERS
# =========================================================

from app.routers import (
    auth,
    users,
    farms,
    soil,
    crops,
    recommendations,
    farming_plans,
    profit,
    markets,
    equipment,
    shops,
    marketplace,
    orders,
    notifications,
    ai,
    reports,
    moderation,
    schemes,
    requirements,
    offers,
    reviews,
    dealer_v3,
    admin_v3,
    offline,
)


# =========================================================
# APPLICATION LIFESPAN
# =========================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    print("Starting AgriVision Version 3 Backend...")

    # Create database tables
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables verified.")
    except Exception as e:
        print(f"Database table creation error: {e}")

    # Run safe migrations
    try:
        run_safe_schema_migrations()
        print("Database migrations completed.")
    except Exception as e:
        print(f"Migration note: {e}")

    # Seed required/default data
    try:
        seed_database()
    except Exception as e:
        print(f"Database initialization note: {e}")

    print("AgriVision Version 3 Backend started successfully.")

    yield

    print("AgriVision Backend shutting down...")


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="AgriVision API",
    description=(
        "AgriVision Version 3 - Smart Agriculture Ecosystem API. "
        "Provides farmer, buyer, dealer, marketplace, market intelligence, "
        "notification, review, administration, and AI-powered services."
    ),
    version="3.0.0",
    lifespan=lifespan,
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

# React / Vite development servers
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# STATIC / UPLOAD FILES
# =========================================================

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=settings.UPLOAD_DIR),
    name="uploads",
)


# =========================================================
# API V1 ROUTERS
# =========================================================

api_prefix = settings.API_V1_STR

# Authentication & users
app.include_router(auth.router, prefix=api_prefix)
app.include_router(users.router, prefix=api_prefix)

# Farmer & agriculture
app.include_router(farms.router, prefix=api_prefix)
app.include_router(soil.router, prefix=api_prefix)
app.include_router(crops.router, prefix=api_prefix)
app.include_router(recommendations.router, prefix=api_prefix)
app.include_router(farming_plans.router, prefix=api_prefix)
app.include_router(profit.router, prefix=api_prefix)

# Market intelligence
app.include_router(markets.router, prefix=api_prefix)

# Equipment & shops
app.include_router(equipment.router, prefix=api_prefix)
app.include_router(shops.router, prefix=api_prefix)

# Marketplace & orders
app.include_router(marketplace.router, prefix=api_prefix)
app.include_router(orders.router, prefix=api_prefix)

# Notifications
app.include_router(notifications.router, prefix=api_prefix)

# AI & reports
app.include_router(ai.router, prefix=api_prefix)
app.include_router(reports.router, prefix=api_prefix)

# Moderation
app.include_router(moderation.router, prefix=api_prefix)

# Government schemes
app.include_router(schemes.router, prefix=api_prefix)

# Buyer requirements & offers
app.include_router(requirements.router, prefix=api_prefix)
app.include_router(requirements.farmer_router, prefix=api_prefix)
app.include_router(offers.router, prefix=api_prefix)

# Ratings & reviews
app.include_router(reviews.router, prefix=api_prefix)

# =========================================================
# VERSION 3 ROUTERS
# =========================================================

# Dealer V3
app.include_router(
    dealer_v3.router,
    prefix=api_prefix,
)

# Admin V3
app.include_router(
    admin_v3.router,
    prefix=api_prefix,
)

# Offline / PWA synchronization
app.include_router(
    offline.router,
    prefix=api_prefix,
)


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "AgriVision Smart Agriculture Backend",
        "version": "3.0.0",
        "api": api_prefix,
    }


# =========================================================
# ROOT
# =========================================================

@app.get("/", tags=["System"])
def root():
    return {
        "message": "Welcome to AgriVision Version 3 API",
        "status": "running",
        "version": "3.0.0",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "health_url": "/health",
        "api_v1": api_prefix,
    }


# =========================================================
# DEVELOPMENT SERVER
# =========================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8001,
        reload=True,
    )