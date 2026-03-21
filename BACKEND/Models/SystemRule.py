from sqlalchemy import Column, Integer, String, Boolean
from Core.Database import Base

class SystemRule(Base):
    __tablename__ = "system_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    desc = Column(String(255))
    on = Column(Boolean, default=True)

    def __repr__(self):
        return f"<SystemRule {self.name} | {'ON' if self.on else 'OFF'}>"
