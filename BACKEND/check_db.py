from sqlalchemy import create_engine, text
from Core.Config import settings

try:
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT count(*) FROM courses"))
        count = result.scalar()
        print(f"Total courses: {count}")
        
        result = conn.execute(text("SELECT id, title, faculty_id FROM courses"))
        for row in result:
            print(row)
except Exception as e:
    print(f"Error: {e}")
