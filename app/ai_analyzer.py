import requests

OLLAMA_URL = "http://localhost:11434/api/generate"

def generate_threat_report(log, analysis_result):
    if analysis_result['severity'] not in ['High', 'Critical']:
        return "No significant threat detected."

    prompt = f"""
You are an expert Cybersecurity SOC Analyst. Analyze the following database intrusion alert and provide a concise, 2-3 sentence threat summary and 2 immediate mitigation actions.

Incident Details:
- User: {log.username}
- IP Address: {log.ip_address}
- Query Count: {log.query_count}
- Failed Logins: {log.failed_logins}
- Download Size: {log.download_size_mb} MB
- Query Type: {log.query_type}

System Analysis:
- Risk Score: {analysis_result['risk_score']} ({analysis_result['severity']})
- Triggered Rules: {', '.join(analysis_result['rule_alerts'])}
- ML Anomaly Detected: {analysis_result['is_anomaly']}

Format your response clearly. Do not include any pleasantries or intro text.
"""

    payload = {
        "model": "mistral",
        "prompt": prompt,
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=15)
        if response.status_code == 200:
            return response.json().get("response", "Error generating report.")
        else:
            return f"AI Analysis failed. Status: {response.status_code}"
    except requests.exceptions.RequestException:
        return "AI Engine unreachable. Please make sure Ollama is running (`ollama run mistral`)."
