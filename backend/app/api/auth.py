from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Cookie
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.security import (
    verify_password, create_access_token, create_refresh_token,
    get_current_user, decode_token,
)
from app.core.config import settings
from app.models.user import User, AuditLog

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


def _audit(db, user_id, action, description, ip):
    db.add(AuditLog(
        user_id=user_id,
        action_type=action,
        entity_name="User",
        entity_id=user_id,
        description=description,
        ip_address=ip,
    ))


@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    response: Response,
    body: LoginRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(
        User.username == body.username,
        User.is_deleted == False,
    ).first()

    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="اسم المستخدم أو كلمة المرور غير صحيحة",
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="الحساب غير مفعّل")

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    cookie_opts = dict(
        httponly=True,
        samesite="Strict",
        secure=settings.ENVIRONMENT == "production",
    )
    response.set_cookie("access_token", access_token,
                        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, **cookie_opts)
    response.set_cookie("refresh_token", refresh_token,
                        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400, **cookie_opts)

    ip = request.client.host if request.client else "unknown"
    _audit(db, user.id, "LOGIN", f"تسجيل دخول: {user.username}", ip)
    db.commit()

    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ip = request.client.host if request.client else "unknown"
    _audit(db, current_user.id, "LOGOUT", f"تسجيل خروج: {current_user.username}", ip)
    db.commit()
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "تم تسجيل الخروج بنجاح"}


@router.get("/me", response_model=UserOut)
async def get_me(current_user=Depends(get_current_user)):
    return current_user


@router.post("/refresh")
async def refresh(
    response: Response,
    refresh_token: Optional[str] = Cookie(default=None),
    db: Session = Depends(get_db),
):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = db.query(User).filter(User.id == int(payload["sub"]), User.is_deleted == False).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User unavailable")

    new_token = create_access_token({"sub": str(user.id)})
    response.set_cookie("access_token", new_token,
                        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                        httponly=True, samesite="lax",
                        secure=settings.ENVIRONMENT == "production")
    return {"access_token": new_token, "token_type": "bearer"}
