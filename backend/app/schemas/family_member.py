from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class FamilyMemberBase(BaseModel):
    name: str
    age: Optional[int] = None
    marital_status: Optional[str] = None
    school_or_university: Optional[str] = None
    member_relationship: str  # ← To this
    notes: Optional[str] = None
    
class FamilyMemberCreate(FamilyMemberBase):
    pass

class FamilyMemberUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    marital_status: Optional[str] = None
    school_or_university: Optional[str] = None
    member_relationship: Optional[str] = None
    notes: Optional[str] = None

class FamilyMemberResponse(FamilyMemberBase):
    id: int
    case_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True