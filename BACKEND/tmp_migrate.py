import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from Core.Database import engine

with engine.connect() as conn:
    conn.execute(text('ALTER TABLE notifications ADD COLUMN link VARCHAR;'))
    conn.commit()
print("Column added successfully.")
