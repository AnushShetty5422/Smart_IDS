import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

class DetectionEngine:
    def __init__(self):
        # We use a simple Isolation Forest to detect anomalous patterns
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.is_trained = False
        self._train_initial_model()

    def _train_initial_model(self):
        # Generate some synthetic "normal" data to train the Isolation Forest
        np.random.seed(42)
        normal_data = pd.DataFrame({
            'query_count': np.random.randint(1, 50, 1000),
            'failed_logins': np.random.choice([0, 1, 2], 1000, p=[0.9, 0.08, 0.02]),
            'download_size_mb': np.random.uniform(0.1, 5.0, 1000)
        })
        # Fit the model to learn what "normal" looks like
        self.model.fit(normal_data)
        self.is_trained = True

    def evaluate_rules(self, log):
        alerts = []
        rule_score = 0
        
        # Rule 1: Brute force detection
        if log.failed_logins > 5:
            alerts.append("Brute Force Detected (>5 failed logins)")
            rule_score += 60
            
        # Rule 2: Data Exfiltration
        if log.download_size_mb > 100:
            alerts.append("Data Exfiltration Risk (Large Download)")
            rule_score += 50
            
        # Rule 3: Malicious Queries
        if log.query_type in ["DROP", "DELETE"]:
            alerts.append("Destructive Query Detected")
            rule_score += 40
            
        # Rule 4: Automated scraping / mass extraction
        if log.query_count > 100:
            alerts.append("High Query Volume (Possible Automated Extraction)")
            rule_score += 30
            
        return alerts, rule_score

    def evaluate_ml(self, log):
        if not self.is_trained:
            return 0, False
            
        features = pd.DataFrame({
            'query_count': [log.query_count],
            'failed_logins': [log.failed_logins],
            'download_size_mb': [log.download_size_mb]
        })
        
        # 1 means normal, -1 means anomaly
        prediction = self.model.predict(features)[0]
        # Lower score means more anomalous
        score = self.model.decision_function(features)[0]
        
        # Convert score to a risk percentage 0-100 (heuristic mapping)
        ml_risk = 0
        if prediction == -1:
            ml_risk = min(100, 50 + abs(score) * 200)
        else:
            ml_risk = max(0, 50 - abs(score) * 100)
            
        return float(ml_risk), bool(prediction == -1)

    def analyze_log(self, log):
        # 1. Evaluate Rule-based Engine
        rule_alerts, rule_score = self.evaluate_rules(log)
        
        # 2. Evaluate ML Anomaly Engine
        ml_risk, is_anomaly = self.evaluate_ml(log)
        
        # 3. Risk Scoring (Combine signals)
        final_score = min(100, (rule_score * 0.7) + (ml_risk * 0.3))
        
        # Bump score if ML thinks it's weird but rules barely caught it
        if is_anomaly and final_score < 40:
             final_score += 20 
             
        # Categorize Severity
        if final_score < 30:
            severity = "Low"
        elif final_score < 60:
            severity = "Medium"
        elif final_score < 80:
            severity = "High"
        else:
            severity = "Critical"
            
        return {
            "risk_score": round(final_score, 1),
            "severity": severity,
            "rule_alerts": rule_alerts,
            "is_anomaly": is_anomaly
        }
