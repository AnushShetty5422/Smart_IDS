import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# CLOUD DATABASE SETUP
# To connect to a live cloud database (like Supabase, Neon, or Google Cloud SQL),
# you would set the DATABASE_URL environment variable to your Postgres connection string.
# Example: export DATABASE_URL="postgresql://user:password@db.supabase.co:5432/postgres"

# If no cloud URL is provided, it falls back to a local SQLite file for development.
SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./ids_database.db")

# SQLite requires check_same_thread=False, Postgres does not
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class DBLogEntry(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    ip_address = Column(String, index=True)
    timestamp = Column(String) # Storing as string for simplicity across DBs
    query_count = Column(Integer)
    query_type = Column(String)
    failed_logins = Column(Integer)
    download_size_mb = Column(Float)
    location = Column(String)
    privilege_change = Column(Boolean)
    
class DBAlert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    log_id = Column(Integer) # Optional foreign key linking to logs
    timestamp = Column(String)
    username = Column(String)
    ip_address = Column(String)
    risk_score = Column(Float)
    severity = Column(String, index=True)
    rule_alerts = Column(String) # JSON string array
    ai_analysis = Column(String)

# Create the tables
Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
