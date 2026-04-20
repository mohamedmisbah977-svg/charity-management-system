from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.api.auth import router as auth_router
from app.api import cases
from app.api import aids 
from app.api import monthly
from app.api import reports
from app.api import users, audit
from app.api import system_settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://charity-management-system-production.up.railway.app",
        "https://astonishing-kindness-production-a216.up.railway.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Set-Cookie"],  # ← Add this
)

app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(cases.router, prefix=settings.API_PREFIX)
app.include_router(aids.router, prefix=settings.API_PREFIX)
app.include_router(monthly.router, prefix=settings.API_PREFIX, tags=["Monthly Aid"])
app.include_router(reports.router, prefix=settings.API_PREFIX, tags=["Reports"])
app.include_router(users.router, prefix=settings.API_PREFIX, tags=["Users"])
app.include_router(audit.router, prefix=settings.API_PREFIX, tags=["Audit"])
app.include_router(system_settings.router, prefix=settings.API_PREFIX, tags=["Settings"])

os.makedirs("/app/uploads", exist_ok=True)
try:
    app.mount("/uploads", StaticFiles(directory="/app/uploads"), name="uploads")
except Exception:
    pass

@app.get("/health")
def health():
    return {"status": "ok", "system": settings.PROJECT_NAME}