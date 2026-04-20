from fastapi import Request, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db

security = HTTPBearer(auto_error=False)

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    from app.models.user import User
    
    token = None

    # Try Bearer header first
    if credentials:
        token = credentials.credentials

    # Fallback to cookie (optional, for compatibility)
    if not token:
        token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(
        User.id == int(payload["sub"]), 
        User.is_deleted == False
    ).first()
    
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")

    return user