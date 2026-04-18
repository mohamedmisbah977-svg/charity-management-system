from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.api.auth import router as auth_router
from app.api import cases
from app.api import aids  # ← ADD THIS IMPORT
from app.api import monthly

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=settings.API_PREFIX)

# Add cases router
app.include_router(cases.router, prefix=settings.API_PREFIX)

# Add aids router ← ADD THIS LINE
app.include_router(aids.router, prefix=settings.API_PREFIX)


app.include_router(monthly.router, prefix="/api", tags=["Monthly Aid"])

# Phase 2+ routers will be registered here:
# from app.api import monthly, reports, users, audit, settings_api
# app.include_router(monthly.router, prefix=settings.API_PREFIX)
# ...

os.makedirs("/app/uploads", exist_ok=True)
try:
    app.mount("/uploads", StaticFiles(directory="/app/uploads"), name="uploads")
except Exception:
    pass


@app.get("/health")
def health():
    return {"status": "ok", "system": settings.PROJECT_NAME}