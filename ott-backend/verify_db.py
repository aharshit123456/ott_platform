from database import engine
from sqlalchemy import text

def check_db():
    try:
        url = os.getenv("DATABASE_URL")
        print(f"DEBUG: DATABASE_URL={url}")
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("Database connection successful:", result.fetchone())
    except Exception as e:
        print("Database connection failed:", e)

if __name__ == "__main__":
    check_db()
