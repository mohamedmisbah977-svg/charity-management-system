from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Date,
    ForeignKey, Text, Numeric, UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False)
    full_name = Column(String(200), nullable=False)
    hashed_password = Column(String(256), nullable=False)
    role = Column(String(20), nullable=False, default="Staff")  # Admin | Staff
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)

    aids = relationship("Aid", back_populates="registered_by_user")
    monthly_deliveries = relationship("MonthlyAidTransaction", back_populates="delivered_by_user")
    audit_logs = relationship("AuditLog", back_populates="user")


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    file_number = Column(String(50), unique=True, nullable=False, index=True)
    full_name = Column(String(200), nullable=False, index=True)
    phone_number_1 = Column(String(50), nullable=False)
    phone_number_2 = Column(String(50))
    country = Column(String(100))
    city = Column(String(100), nullable=False, index=True)
    street_address = Column(String(200))
    notes = Column(Text)
    housing_type = Column(String(50), nullable=False)  # Owned | Rented | Other
    join_date = Column(Date, nullable=False)
    family_income = Column(Numeric(18, 2), default=0)
    property_rental_income = Column(Numeric(18, 2), default=0)
    other_income = Column(Numeric(18, 2), default=0)
    receives_government_aid = Column(Boolean, default=False)
    government_aid_organization = Column(String(200))
    is_parent_deceased = Column(Boolean, default=False)
    death_certificate_path = Column(String(500))
    death_certificate_image = Column(Text)
    is_monthly_aid = Column(Boolean, default=False)
    monthly_aid_amount = Column(Numeric(18, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)

    family_members = relationship("FamilyMember", back_populates="case", cascade="all, delete-orphan")
    work_records = relationship("WorkRecord", back_populates="case", cascade="all, delete-orphan")
    aids = relationship("Aid", back_populates="case")
    monthly_transactions = relationship("MonthlyAidTransaction", back_populates="case")


class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    age = Column(Integer)
    marital_status = Column(String(50))
    school_or_university = Column(String(200))
    relationship = Column(String(50), nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)

    case = relationship("Case", back_populates="family_members")


class WorkRecord(Base):
    __tablename__ = "work_records"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    person_type = Column(String(50), nullable=False)
    employer_name = Column(String(200))
    employer_address = Column(String(300))
    employer_phone = Column(String(50))
    job_title = Column(String(200))
    monthly_salary = Column(Numeric(18, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)

    case = relationship("Case", back_populates="work_records")


class AidType(Base):
    __tablename__ = "aid_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # Financial | InKind | Seasonal
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)

    aids = relationship("Aid", back_populates="aid_type")


class Aid(Base):
    __tablename__ = "aids"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    aid_type_id = Column(Integer, ForeignKey("aid_types.id"), nullable=False)
    registered_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    aid_date = Column(Date, nullable=False)
    amount = Column(Numeric(18, 2))
    quantity_or_description = Column(String(500))
    status = Column(String(50), default="Active")
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)

    case = relationship("Case", back_populates="aids")
    aid_type = relationship("AidType", back_populates="aids")
    registered_by_user = relationship("User", back_populates="aids")


class MonthlyAidCycle(Base):
    __tablename__ = "monthly_aid_cycles"
    __table_args__ = (UniqueConstraint("year", "month", name="uq_cycle_year_month"),)

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False, default="Closed")  # Open | Closed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)

    transactions = relationship("MonthlyAidTransaction", back_populates="cycle")


class MonthlyAidTransaction(Base):
    __tablename__ = "monthly_aid_transactions"
    __table_args__ = (UniqueConstraint("monthly_aid_cycle_id", "case_id", name="uq_txn_cycle_case"),)

    id = Column(Integer, primary_key=True, index=True)
    monthly_aid_cycle_id = Column(Integer, ForeignKey("monthly_aid_cycles.id"), nullable=False)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    delivered_by_user_id = Column(Integer, ForeignKey("users.id"))
    monthly_amount = Column(Numeric(18, 2), nullable=False)
    status = Column(String(20), nullable=False, default="Pending")  # Pending | Delivered | Missed
    delivered_date = Column(Date)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)

    cycle = relationship("MonthlyAidCycle", back_populates="transactions")
    case = relationship("Case", back_populates="monthly_transactions")
    delivered_by_user = relationship("User", back_populates="monthly_deliveries")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action_date = Column(DateTime(timezone=True), server_default=func.now())
    action_type = Column(String(100), nullable=False)
    entity_name = Column(String(200), nullable=False)
    entity_id = Column(Integer)
    old_values = Column(Text)
    new_values = Column(Text)
    description = Column(Text)
    ip_address = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="audit_logs")


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String(100), unique=True, nullable=False)
    setting_value = Column(Text)
    description = Column(Text)
    setting_type = Column(String(50))
    category = Column(String(200))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
