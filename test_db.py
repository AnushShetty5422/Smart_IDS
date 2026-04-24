import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()
url = os.environ.get("DATABASE_URL")
print(f"Connecting to: {url}")

try:
    engine = create_engine(url)
    connection = engine.connect()
    print("SUCCESS: Connected to Supabase!")
    connection.close()
except Exception as e:
    print(f"FAILED: {e}")
