from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float
from Core.Database import Base

class PlatformReport(Base):
    __tablename__ = "platform_reports"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(String(500))
    report_type = Column(String(50)) # PDF, XLSX, etc.
    category = Column(String(50)) # Academic, Placement, System, etc.
    size = Column(String(20)) # e.g., "2.4 MB"
    file_path = Column(String(500)) # Path to the actual file if stored
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer) # Admin user ID

class PlatformSetting(Base):
    __tablename__ = "platform_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True)
    value = Column(String(1000))
    category = Column(String(50)) # General, SMTP, Security, etc.
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SystemServiceStatus(Base):
    __tablename__ = "system_service_status"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    icon = Column(String(50), nullable=True)
    status = Column(String(50), default="up") # "up", "warn", "down"
    latency = Column(String(20), nullable=True)
    cpu = Column(String(20), nullable=True)
    mem = Column(String(20), nullable=True)
    color = Column(String(50), nullable=True)
    text_color = Column(String(50), nullable=True)
    
class SystemQuickAction(Base):
    __tablename__ = "system_quick_actions"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String(100), nullable=False)
    icon = Column(String(50), nullable=True)
    color = Column(String(50), nullable=True)
