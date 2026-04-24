import json
from fastapi import FastAPI, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models import LogEntry
from app.engine import DetectionEngine
from app.ai_analyzer import generate_threat_report
from app.database import DBLogEntry, DBAlert, get_db, SessionLocal

app = FastAPI(title="Smart IDS API", version="2.0.0")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the detection engine
engine = DetectionEngine()

def process_alert(log, analysis_result):
    report = generate_threat_report(log, analysis_result)
    
    # Use a fresh session for the background thread to prevent SQLite errors
    db = SessionLocal()
    try:
        db_alert = DBAlert(
            timestamp=log.timestamp.isoformat(),
            username=log.username,
            ip_address=log.ip_address,
            risk_score=analysis_result["risk_score"],
            severity=analysis_result["severity"],
            rule_alerts=json.dumps(analysis_result["rule_alerts"]),
            ai_analysis=report
        )
        db.add(db_alert)
        db.commit()
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Smart IDS API is running (Database Integrated)"}

@app.post("/api/logs/ingest")
def ingest_log(log: LogEntry, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # 1. Save Log to Persistent Database
    db_log = DBLogEntry(
        username=log.username,
        ip_address=log.ip_address,
        timestamp=log.timestamp.isoformat(),
        query_count=log.query_count,
        query_type=log.query_type,
        failed_logins=log.failed_logins,
        download_size_mb=log.download_size_mb,
        location=log.location,
        privilege_change=log.privilege_change
    )
    db.add(db_log)
    db.commit()
    
    # 2. Run the log through Detection Engine
    analysis_result = engine.analyze_log(log)
    
    if analysis_result["severity"] in ["High", "Critical"]:
        print(f"ALERT! Risk: {analysis_result['risk_score']} ({analysis_result['severity']})")
        # Run AI analysis in the background
        background_tasks.add_task(process_alert, log, analysis_result)
    
    return {
        "status": "success", 
        "message": "Log processed",
        "analysis": analysis_result
    }

@app.get("/api/alerts")
def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(DBAlert).order_by(desc(DBAlert.id)).limit(50).all()
    # Format for frontend
    formatted_alerts = []
    for a in alerts:
        formatted_alerts.append({
            "id": a.id,
            "timestamp": a.timestamp,
            "username": a.username,
            "ip_address": a.ip_address,
            "risk_score": a.risk_score,
            "severity": a.severity,
            "rule_alerts": json.loads(a.rule_alerts) if a.rule_alerts else [],
            "ai_analysis": a.ai_analysis
        })
    return {"alerts": formatted_alerts}

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    total_logs = db.query(DBLogEntry).count()
    total_alerts = db.query(DBAlert).count()
    
    critical_alerts = db.query(DBAlert).filter(DBAlert.severity == "Critical").count()
    high_alerts = db.query(DBAlert).filter(DBAlert.severity == "High").count()
    medium_alerts = db.query(DBAlert).filter(DBAlert.severity == "Medium").count()
    low_alerts = db.query(DBAlert).filter(DBAlert.severity == "Low").count()
    
    # Calculate top targeted users from alerts
    alerts = db.query(DBAlert).all()
    user_counts = {}
    for alert in alerts:
        user_counts[alert.username] = user_counts.get(alert.username, 0) + 1
    
    top_users = [{"name": k, "attacks": v} for k, v in sorted(user_counts.items(), key=lambda item: item[1], reverse=True)[:5]]
    
    # Severity Distribution for Pie Chart
    severity_dist = [
        {"name": "Critical", "value": critical_alerts, "color": "#FF3366"},
        {"name": "High", "value": high_alerts, "color": "#FF9D00"},
        {"name": "Medium", "value": medium_alerts, "color": "#00E5FF"},
        {"name": "Low", "value": low_alerts, "color": "#00FF9D"},
    ]
    
    # Get recent raw logs for the Terminal window
    recent_logs_db = db.query(DBLogEntry).order_by(desc(DBLogEntry.id)).limit(10).all()
    recent_logs = [{"timestamp": log.timestamp, "username": log.username, "ip_address": log.ip_address} for log in recent_logs_db]
    
    return {
        "total_logs": total_logs,
        "critical_alerts": critical_alerts,
        "high_alerts": high_alerts,
        "total_alerts": total_alerts,
        "top_targets": top_users,
        "severity_distribution": [item for item in severity_dist if item["value"] > 0],
        "recent_logs": recent_logs
    }
