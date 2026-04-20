from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import os
from sqlalchemy import text, inspect

from app.core.config import settings
from app.core.database import engine
from app.api.auth import router as auth_router
from app.api import cases, aids, monthly, reports, users, audit, system_settings


def ensure_database_columns():
    """Add missing columns to database tables"""
    try:
        print("Checking database columns...")
        inspector = inspect(engine)
        columns = [c['name'] for c in inspector.get_columns('family_members')]
        print(f"Existing columns: {columns}")
        
        if 'member_relationship' not in columns:
            print("Adding missing column: member_relationship")
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE family_members ADD COLUMN member_relationship VARCHAR(50)"))
                conn.commit()
                print("Column 'member_relationship' added successfully!")
        else:
            print("Column 'member_relationship' already exists")
    except Exception as e:
        print(f"Error adding column: {e}")

def drop_old_column():
    """Drop the old relationship column if it exists"""
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE family_members DROP COLUMN IF EXISTS relationship"))
            conn.commit()
            print("Old column 'relationship' dropped successfully")
    except Exception as e:
        print(f"Error dropping column: {e}")
        
        
        
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

# Run column check immediately (not waiting for startup event)
ensure_database_columns()
drop_old_column()
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