import sys
import os

# Ensure the script can import local modules
sys.path.append(r"d:\E-LEARNING\BACKEND")

from Core.Database import engine
from sqlalchemy import text

def alter_db():
    try:
        with engine.connect() as conn:
            # Check if category column exists, if not add it
            try:
                conn.execute(text("ALTER TABLE internships ADD COLUMN category VARCHAR(50) DEFAULT 'internship';"))
                conn.execute(text("UPDATE internships SET category = 'internship' WHERE category IS NULL;"))
                print("Added category column.")
            except Exception as e:
                print(f"category column already exists or error: {e}")

            try:
                conn.execute(text("ALTER TABLE internships ADD COLUMN application_link VARCHAR(500);"))
                print("Added application_link column.")
            except Exception as e:
                print(f"application_link column already exists or error: {e}")

            try:
                conn.execute(text("ALTER TABLE internships ADD COLUMN target_group VARCHAR(50) DEFAULT 'All';"))
                conn.execute(text("UPDATE internships SET target_group = 'All' WHERE target_group IS NULL;"))
                print("Added target_group column.")
            except Exception as e:
                print(f"target_group column already exists or error: {e}")
            
            # Commit the transaction explicitly if required by the dialect/driver
            conn.commit()
            print("Successfully updated database schema.")
    except Exception as ex:
        print(f"Database error: {ex}")

if __name__ == "__main__":
    alter_db()
