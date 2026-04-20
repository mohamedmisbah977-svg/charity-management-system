from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import Optional, List
from datetime import date

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.user import User, Case, FamilyMember, WorkRecord
from app.schemas.case import CaseCreate, CaseUpdate, CaseResponse, CaseListResponse
from app.schemas.family_member import FamilyMemberCreate, FamilyMemberUpdate, FamilyMemberResponse
from app.schemas.work_record import WorkRecordCreate, WorkRecordUpdate, WorkRecordResponse
from app.utils.case_number import generate_case_number
from app.services.audit_service import create_audit_log

router = APIRouter(tags=["Cases"])

# ============ Case CRUD ============

@router.get("/cases", response_model=CaseListResponse)
def list_cases(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    city: Optional[str] = None,
    housing_type: Optional[str] = None,
    receives_government_aid: Optional[bool] = None,
    is_monthly_aid: Optional[bool] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    min_income: Optional[float] = None,
    max_income: Optional[float] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Case).filter(Case.is_deleted == False)
    
    # Apply filters
    if search:
        query = query.filter(
            or_(
                Case.file_number.ilike(f"%{search}%"),
                Case.full_name.ilike(f"%{search}%"),
                Case.phone_number_1.ilike(f"%{search}%")
            )
        )
    
    if city:
        query = query.filter(Case.city == city)
    
    if housing_type:
        query = query.filter(Case.housing_type == housing_type)
    
    if receives_government_aid is not None:
        query = query.filter(Case.receives_government_aid == receives_government_aid)
    
    if is_monthly_aid is not None:
        query = query.filter(Case.is_monthly_aid == is_monthly_aid)
    
    if start_date:
        query = query.filter(Case.join_date >= start_date)
    
    if end_date:
        query = query.filter(Case.join_date <= end_date)
    
    total = query.count()
    items = query.order_by(Case.created_at.desc()).offset((page - 1) * size).limit(size).all()
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size
    }

@router.get("/cases/{case_id}", response_model=CaseResponse)
def get_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Case).filter(Case.id == case_id, Case.is_deleted == False).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@router.post("/cases", response_model=CaseResponse)
def create_case(
    case_data: CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Generate unique file number
    file_number = generate_case_number(db)
    
    case = Case(**case_data.model_dump(), file_number=file_number)
    db.add(case)
    db.commit()
    db.refresh(case)
    
    # Audit log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action_type="CREATE",
        entity_name="Case",
        entity_id=case.id,
        description=f"Created case {case.file_number}",
        ip_address="127.0.0.1"
    )
    
    return case

@router.put("/cases/{case_id}", response_model=CaseResponse)
def update_case(
    case_id: int,
    case_data: CaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Case).filter(Case.id == case_id, Case.is_deleted == False).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    for key, value in case_data.model_dump(exclude_unset=True).items():
        setattr(case, key, value)
    
    db.commit()
    db.refresh(case)
    
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action_type="UPDATE",
        entity_name="Case",
        entity_id=case.id,
        description=f"Updated case {case.file_number}",
        ip_address="127.0.0.1"
    )
    
    return case

@router.delete("/cases/{case_id}")
def delete_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Case).filter(Case.id == case_id, Case.is_deleted == False).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    case.is_deleted = True
    db.commit()
    
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action_type="DELETE",
        entity_name="Case",
        entity_id=case.id,
        description=f"Deleted case {case.file_number}",
        ip_address="127.0.0.1"
    )
    
    return {"message": "Case deleted successfully"}

# ============ Family Members CRUD ============

import traceback

@router.get("/cases/{case_id}/family", response_model=List[FamilyMemberResponse])
def get_family_members(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        case = db.query(Case).filter(Case.id == case_id, Case.is_deleted == False).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        result = db.query(FamilyMember).filter(
            FamilyMember.case_id == case_id,
            FamilyMember.is_deleted == False
        ).all()
        
        return result
    except Exception as e:
        print("=" * 50)
        print("ERROR in get_family_members:")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print(traceback.format_exc())
        print("=" * 50)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cases/{case_id}/family", response_model=FamilyMemberResponse)
def create_family_member(
    case_id: int,
    member_data: FamilyMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Case).filter(Case.id == case_id, Case.is_deleted == False).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    member = FamilyMember(**member_data.model_dump(), case_id=case_id)
    db.add(member)
    db.commit()
    db.refresh(member)
    
    return member

@router.put("/family/{member_id}", response_model=FamilyMemberResponse)
def update_family_member(
    member_id: int,
    member_data: FamilyMemberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    member = db.query(FamilyMember).filter(FamilyMember.id == member_id, FamilyMember.is_deleted == False).first()
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    
    for key, value in member_data.model_dump(exclude_unset=True).items():
        setattr(member, key, value)
    
    db.commit()
    db.refresh(member)
    
    return member

@router.delete("/family/{member_id}")
def delete_family_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    member = db.query(FamilyMember).filter(FamilyMember.id == member_id, FamilyMember.is_deleted == False).first()
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    
    member.is_deleted = True
    db.commit()
    
    return {"message": "Family member deleted successfully"}

# ============ Work Records CRUD ============

@router.get("/cases/{case_id}/work", response_model=List[WorkRecordResponse])
def get_work_records(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Case).filter(Case.id == case_id, Case.is_deleted == False).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    return db.query(WorkRecord).filter(
        WorkRecord.case_id == case_id,
        WorkRecord.is_deleted == False
    ).all()

@router.post("/cases/{case_id}/work", response_model=WorkRecordResponse)
def create_work_record(
    case_id: int,
    work_data: WorkRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Case).filter(Case.id == case_id, Case.is_deleted == False).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    work = WorkRecord(**work_data.model_dump(), case_id=case_id)
    db.add(work)
    db.commit()
    db.refresh(work)
    
    return work

@router.put("/work/{work_id}", response_model=WorkRecordResponse)
def update_work_record(
    work_id: int,
    work_data: WorkRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    work = db.query(WorkRecord).filter(WorkRecord.id == work_id, WorkRecord.is_deleted == False).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work record not found")
    
    for key, value in work_data.model_dump(exclude_unset=True).items():
        setattr(work, key, value)
    
    db.commit()
    db.refresh(work)
    
    return work

@router.delete("/work/{work_id}")
def delete_work_record(
    work_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    work = db.query(WorkRecord).filter(WorkRecord.id == work_id, WorkRecord.is_deleted == False).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work record not found")
    
    work.is_deleted = True
    db.commit()
    
    return {"message": "Work record deleted successfully"}