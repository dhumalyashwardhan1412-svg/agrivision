import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
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
    # Run safe migrations
    # -----------------------------------------------------

    try:
        run_safe_schema_migrations()
        print("Database migrations completed.")
    except Exception as e:
        print(f"Migration note: {e}")

    # -----------------------------------------------------
    # Seed required/default data
    # -----------------------------------------------------

    try:
        seed_database()
        print("Database initialization completed.")
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

# These origins are required while developing React/Vite locally.
#
# In production, React and FastAPI are served from the same domain,
# so CORS is normally not required between them.

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Optional extra frontend origin.
#
# Example:
# FRONTEND_ORIGIN=https://agrivision.onrender.com

frontend_origin = os.getenv("FRONTEND_ORIGIN")

if frontend_origin:
    frontend_origin = frontend_origin.rstrip("/")

    if frontend_origin not in allowed_origins:
        allowed_origins.append(frontend_origin)


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


# ---------------------------------------------------------
# Authentication & Users
# ---------------------------------------------------------

app.include_router(
    auth.router,
    prefix=api_prefix,
)

app.include_router(
    users.router,
    prefix=api_prefix,
)


# ---------------------------------------------------------
# Farmer & Agriculture
# ---------------------------------------------------------

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


# ---------------------------------------------------------
# Market Intelligence
# ---------------------------------------------------------

app.include_router(
    markets.router,
    prefix=api_prefix,
)


# ---------------------------------------------------------
# Equipment & Shops
# ---------------------------------------------------------

app.include_router(
    equipment.router,
    prefix=api_prefix,
)

app.include_router(
    shops.router,
    prefix=api_prefix,
)


# ---------------------------------------------------------
# Marketplace & Orders
# ---------------------------------------------------------

app.include_router(
    marketplace.router,
    prefix=api_prefix,
)

app.include_router(
    orders.router,
    prefix=api_prefix,
)


# ---------------------------------------------------------
# Notifications
# ---------------------------------------------------------

app.include_router(
    notifications.router,
    prefix=api_prefix,
)


# ---------------------------------------------------------
# AI & Reports
# ---------------------------------------------------------

app.include_router(
    ai.router,
    prefix=api_prefix,
)

app.include_router(
    reports.router,
    prefix=api_prefix,
)


# ---------------------------------------------------------
# Moderation
# ---------------------------------------------------------

app.include_router(
    moderation.router,
    prefix=api_prefix,
)


# ---------------------------------------------------------
# Government Schemes
# ---------------------------------------------------------

app.include_router(
    schemes.router,
    prefix=api_prefix,
)


# ---------------------------------------------------------
# Buyer Requirements
# ---------------------------------------------------------

app.include_router(
    requirements.router,
    prefix=api_prefix,
)

app.include_router(
    requirements.farmer_router,
    prefix=api_prefix,
)


# ---------------------------------------------------------
# Offers / Negotiations
# ---------------------------------------------------------

app.include_router(
    offers.router,
    prefix=api_prefix,
)


# ---------------------------------------------------------
# Ratings & Reviews
# ---------------------------------------------------------

app.include_router(
    reviews.router,
    prefix=api_prefix,
)


# =========================================================
# VERSION 3 ROUTERS
# =========================================================

# ---------------------------------------------------------
# Dealer V3
# ---------------------------------------------------------

app.include_router(
    dealer_v3.router,
    prefix=api_prefix,
)


# ---------------------------------------------------------
# Admin V3
# ---------------------------------------------------------

app.include_router(
    admin_v3.router,
    prefix=api_prefix,
)


# ---------------------------------------------------------
# Offline / PWA Synchronization
# ---------------------------------------------------------

app.include_router(
    offline.router,
    prefix=api_prefix,
)


# =========================================================
# SYSTEM ROUTES
# =========================================================


# ---------------------------------------------------------
# Health Check
# ---------------------------------------------------------

@app.get("/health", tags=["System"])
def health_check():

    return {
        "status": "healthy",
        "service": "AgriVision Smart Agriculture Backend",
        "version": "3.0.0",
        "api": api_prefix,
    }


# ---------------------------------------------------------
# API Information
# ---------------------------------------------------------

@app.get("/api-info", tags=["System"])
def api_info():

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
# REACT / VITE FRONTEND
# =========================================================

#
# Docker production:
#
# /app/frontend_dist
#
# Local development build:
#
# project/frontend/dist
#

default_frontend_dist = (
    Path(__file__).resolve().parents[2]
    / "frontend"
    / "dist"
)

FRONTEND_DIST = Path(
    os.getenv(
        "FRONTEND_DIST",
        str(default_frontend_dist),
    )
).resolve()


def serve_react_file(full_path: str):
    """
    Serve a real frontend file when it exists.

    Otherwise return index.html so React Router can handle routes such as:

    /farmer/dashboard
    /farmer/offers
    /buyer/dashboard
    /buyer/requirements
    /dealer/dashboard
    /admin/dashboard
    """

    index_file = FRONTEND_DIST / "index.html"

    # -----------------------------------------------------
    # Serve actual files
    # -----------------------------------------------------

    if full_path:

        requested_file = (
            FRONTEND_DIST
            / full_path
        ).resolve()

        # Security:
        # prevent paths such as ../../secret.txt

        try:
            requested_file.relative_to(FRONTEND_DIST)
            path_is_safe = True
        except ValueError:
            path_is_safe = False

        if (
            path_is_safe
            and requested_file.exists()
            and requested_file.is_file()
        ):
            return FileResponse(requested_file)

    # -----------------------------------------------------
    # SPA fallback
    # -----------------------------------------------------

    if index_file.exists():

        return FileResponse(index_file)

    raise HTTPException(
        status_code=503,
        detail=(
            "AgriVision frontend build was not found. "
            "Build the frontend using 'npm run build' "
            "or configure FRONTEND_DIST."
        ),
    )


# =========================================================
# FRONTEND ROOT
# =========================================================

@app.get(
    "/",
    include_in_schema=False,
)
async def frontend_root():

    return serve_react_file("")


# =========================================================
# FRONTEND SPA ROUTES
# =========================================================

@app.get(
    "/{full_path:path}",
    include_in_schema=False,
)
async def frontend_routes(full_path: str):

    normalized_path = full_path.lstrip("/")

    normalized_api_prefix = api_prefix.strip("/")

    # -----------------------------------------------------
    # Never return React HTML for unknown API routes
    # -----------------------------------------------------

    if (
        normalized_path == normalized_api_prefix
        or normalized_path.startswith(
            normalized_api_prefix + "/"
        )
    ):
        raise HTTPException(
            status_code=404,
            detail="API endpoint not found",
        )

    # Upload routes are handled by StaticFiles
    if (
        normalized_path == "uploads"
        or normalized_path.startswith("uploads/")
    ):
        raise HTTPException(
            status_code=404,
            detail="Uploaded file not found",
        )

    return serve_react_file(normalized_path)


# =========================================================
# DEVELOPMENT SERVER
# =========================================================

if __name__ == "__main__":

    import uvicorn

    # Local:
    # python -m app.main
    #
    # Production normally starts using Docker CMD.

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