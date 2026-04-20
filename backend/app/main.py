from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import os

from app.core.config import settings
from app.api.auth import router as auth_router
from app.api import cases, aids, monthly, reports, users, audit, system_settings

ALLOWED_ORIGINS = [
    "https://charity-management-system-production.up.railway.app",
    "https://astonishing-kindness-production-a216.up.railway.app",
]

class CORSOnErrorMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
        except Exception:
            response = JSONResponse(
                status_code=500,
                content={"detail": "Internal server error"}
            )
        origin = request.headers.get("origin", "")
        if origin in ALLOWED_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "*"
        return response

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ← CORSOnErrorMiddleware FIRST (outermost wrapper)
app.add_middleware(CORSOnErrorMiddleware)

# ← CORSMiddleware SECOND (handles preflight OPTIONS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Set-Cookie", "Authorization"],
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