from pydantic import BaseModel, Field, validator
from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List
from enum import Enum

class CycleStatus(str, Enum):
    OPEN = "Open"
    CLOSED = "Closed"

class TransactionStatus(str, Enum):
    PENDING = "Pending"
    DELIVERED = "Delivered"
    MISSED = "Missed"

# ============ Cycle Schemas ============
class MonthlyCycleBase(BaseModel):
    year: int
    month: int

    @validator('year')
    def validate_year(cls, v):
        if v < 2020 or v > 2030:
            raise ValueError('Year must be between 2020 and 2030')
        return v

    @validator('month')
    def validate_month(cls, v):
        if v < 1 or v > 12:
            raise ValueError('Month must be between 1 and 12')
        return v

class MonthlyCycleCreate(MonthlyCycleBase):
    pass

class MonthlyCycleUpdate(BaseModel):
    status: Optional[CycleStatus] = None

class MonthlyCycleResponse(MonthlyCycleBase):
    id: int
    status: CycleStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    total_transactions: int = 0
    total_amount: Decimal = 0
    delivered_count: int = 0
    pending_count: int = 0
    missed_count: int = 0
    
    class Config:
        from_attributes = True

class MonthlyCycleListResponse(BaseModel):
    items: List[MonthlyCycleResponse]
    total: int
    page: int
    size: int
    pages: int

# ============ Transaction Schemas ============
class MonthlyTransactionBase(BaseModel):
    monthly_aid_cycle_id: int
    case_id: int
    monthly_amount: Decimal

class MonthlyTransactionCreate(MonthlyTransactionBase):
    pass

class MonthlyTransactionUpdate(BaseModel):
    status: Optional[TransactionStatus] = None
    delivered_date: Optional[date] = None
    notes: Optional[str] = None

class MonthlyTransactionResponse(MonthlyTransactionBase):
    id: int
    status: TransactionStatus
    delivered_date: Optional[date] = None
    delivered_by_user_id: Optional[int] = None
    delivered_by_name: Optional[str] = None
    notes: Optional[str] = None
    case_name: Optional[str] = None
    case_file_number: Optional[str] = None
    case_phone: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class MonthlyTransactionListResponse(BaseModel):
    items: List[MonthlyTransactionResponse]
    total: int
    page: int
    size: int
    pages: int

# ============ Dashboard Stats ============
class MonthlyDashboardStats(BaseModel):
    total_monthly_cases: int
    current_cycle_id: Optional[int] = None
    current_cycle_name: Optional[str] = None
    current_cycle_status: Optional[str] = None
    current_cycle_total_transactions: int = 0
    current_cycle_total_amount: Decimal = 0
    current_cycle_delivered_count: int = 0
    current_cycle_pending_count: int = 0
    current_cycle_missed_count: int = 0
    current_cycle_completion_percentage: float = 0