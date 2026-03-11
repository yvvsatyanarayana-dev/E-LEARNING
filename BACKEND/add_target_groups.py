import psycopg2
from Core.Config import settings

def add_target_group_columns():
    try:
        url = settings.DATABASE_URL.replace("postgresql+psycopg2://", "postgresql://")
        conn = psycopg2.connect(url)
        cur = conn.cursor()
        
        # Add to lessons
        cur.execute("ALTER TABLE lessons ADD COLUMN IF NOT EXISTS target_group VARCHAR(50) DEFAULT 'All';")
        print("Added target_group to lessons.")
        
        # Add to assignments
        cur.execute("ALTER TABLE assignments ADD COLUMN IF NOT EXISTS target_group VARCHAR(50) DEFAULT 'All';")
        print("Added target_group to assignments.")
        
        # Add to quizzes
        cur.execute("ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS target_group VARCHAR(50) DEFAULT 'All';")
        print("Added target_group to quizzes.")
        
        conn.commit()
        cur.close()
        conn.close()
        print("Successfully added all target_group columns.")
        
    except psycopg2.Error as e:
        print(f"PostgreSQL Error: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_target_group_columns()
