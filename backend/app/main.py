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

    # -----------------------------------------------------
    # Create database tables
    # -----------------------------------------------------

    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables verified.")
    except Exception as e:
        print(f"Database table creation error: {e}")

    # -----------------------------------------------------
    # Run safe database migrations
    # -----------------------------------------------------

    try:
        run_safe_schema_migrations()
        print("Database migrations completed.")
    except Exception as e:
        print(f"Migration note: {e}")

    # -----------------------------------------------------
    # Seed default / required database data
    # -----------------------------------------------------
    #
    # Local development:
    # SEED_DATABASE defaults to true.
    #
    # Vercel production:
    # Set SEED_DATABASE=false
    #

    seed_enabled = (
        os.getenv("SEED_DATABASE", "true").strip().lower() == "true"
    )

    if seed_enabled:
        try:
            seed_database()
            print("Database initialization completed.")
        except Exception as e:
            print(f"Database initialization note: {e}")
    else:
        print("Database seeding skipped.")

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
        "notifications, reviews, administration and AI-powered services."
    ),
    version="3.0.0",
    lifespan=lifespan,
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

# Local frontend development URLs
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


# ---------------------------------------------------------
# Production frontend URL
# ---------------------------------------------------------
#
# Example:
#
# FRONTEND_ORIGIN=https://agrivision.vercel.app
#

frontend_origin = os.getenv("FRONTEND_ORIGIN", "").strip()

if frontend_origin:
    frontend_origin = frontend_origin.rstrip("/")

    if frontend_origin not in allowed_origins:
        allowed_origins.append(frontend_origin)


# ---------------------------------------------------------
# Optional multiple frontend origins
# ---------------------------------------------------------
#
# Example:
#
# FRONTEND_ORIGINS=https://site1.com,https://site2.com
#

extra_origins = os.getenv("FRONTEND_ORIGINS", "").strip()

if extra_origins:
    for origin in extra_origins.split(","):
        origin = origin.strip().rstrip("/")

        if (
            origin
            and origin.startswith(("http://", "https://"))
            and origin not in allowed_origins
        ):
            allowed_origins.append(origin)


print("Allowed CORS origins:")

for origin in allowed_origins:
    print(f" - {origin}")


app.add_middleware(
    CORSMiddleware,

    # Exact frontend domains that may access this API
    allow_origins=allowed_origins,

    # Required if authentication/cookies/authorization are used
    allow_credentials=True,

    # Allow GET, POST, PUT, PATCH, DELETE, OPTIONS, etc.
    allow_methods=["*"],

    # Allow Authorization and other request headers
    allow_headers=["*"],
)


# =========================================================
# STATIC / UPLOADED FILES
# =========================================================

os.makedirs(
    settings.UPLOAD_DIR,
    exist_ok=True,
)

app.mount(
    "/uploads",
    StaticFiles(directory=settings.UPLOAD_DIR),
    name="uploads",
)


# =========================================================
# API PREFIX
# =========================================================

api_prefix = settings.API_V1_STR


# =========================================================
# AUTHENTICATION & USERS
# =========================================================

app.include_router(
    auth.router,
    prefix=api_prefix,
)

app.include_router(
    users.router,
    prefix=api_prefix,
)


# =========================================================
# FARMER & AGRICULTURE
# =========================================================

app.include_router(
    farms.router,
    prefix=api_prefix,
)

app.include_router(
    soil.router,
    prefix=api_prefix,
)

app.include_router(
    crops.router,
    prefix=api_prefix,
)

app.include_router(
    recommendations.router,
    prefix=api_prefix,
)

app.include_router(
    farming_plans.router,
    prefix=api_prefix,
)

app.include_router(
    profit.router,
    prefix=api_prefix,
)


# =========================================================
# MARKET INTELLIGENCE
# =========================================================

app.include_router(
    markets.router,
    prefix=api_prefix,
)


# =========================================================
# EQUIPMENT & SHOPS
# =========================================================

app.include_router(
    equipment.router,
    prefix=api_prefix,
)

app.include_router(
    shops.router,
    prefix=api_prefix,
)


# =========================================================
# MARKETPLACE & ORDERS
# =========================================================

app.include_router(
    marketplace.router,
    prefix=api_prefix,
)

app.include_router(
    orders.router,
    prefix=api_prefix,
)


# =========================================================
# NOTIFICATIONS
# =========================================================

app.include_router(
    notifications.router,
    prefix=api_prefix,
)


# =========================================================
# AI & REPORTS
# =========================================================

app.include_router(
    ai.router,
    prefix=api_prefix,
)

app.include_router(
    reports.router,
    prefix=api_prefix,
)


# =========================================================
# MODERATION
# =========================================================

app.include_router(
    moderation.router,
    prefix=api_prefix,
)


# =========================================================
# GOVERNMENT SCHEMES
# =========================================================

app.include_router(
    schemes.router,
    prefix=api_prefix,
)


# =========================================================
# BUYER REQUIREMENTS
# =========================================================

app.include_router(
    requirements.router,
    prefix=api_prefix,
)

app.include_router(
    requirements.farmer_router,
    prefix=api_prefix,
)


# =========================================================
# OFFERS / NEGOTIATIONS
# =========================================================

app.include_router(
    offers.router,
    prefix=api_prefix,
)


# =========================================================
# RATINGS & REVIEWS
# =========================================================

app.include_router(
    reviews.router,
    prefix=api_prefix,
)


# =========================================================
# DEALER VERSION 3
# =========================================================

app.include_router(
    dealer_v3.router,
    prefix=api_prefix,
)


# =========================================================
# ADMIN VERSION 3
# =========================================================

app.include_router(
    admin_v3.router,
    prefix=api_prefix,
)


# =========================================================
# OFFLINE / PWA SYNCHRONIZATION
# =========================================================

app.include_router(
    offline.router,
    prefix=api_prefix,
)


# =========================================================
# SYSTEM ROUTES
# =========================================================

@app.api_route(
    "/",
    methods=["GET", "HEAD"],
    include_in_schema=False,
)
async def root():
    return {
        "message": "AgriVision Version 3 Backend",
        "status": "running",
        "version": "3.0.0",
        "api": api_prefix,
        "docs": "/docs",
        "health": "/health",
    }


@app.api_route(
    "/health",
    methods=["GET", "HEAD"],
    tags=["System"],
)
async def health_check():
    return {
        "status": "healthy",
        "service": "AgriVision Smart Agriculture Backend",
        "version": "3.0.0",
        "api": api_prefix,
    }


@app.get(
    "/api-info",
    tags=["System"],
)
async def api_info():
    return {
        "message": "AgriVision Version 3 API",
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

    port = int(
        os.getenv(
            "PORT",
            "8001",
        )
    )

    host = (
        "0.0.0.0"
        if os.getenv("PORT")
        else "127.0.0.1"
    )

    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=not bool(os.getenv("PORT")),
    )