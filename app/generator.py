import random
import time
import requests
from datetime import datetime

# Configure URL of the FastAPI backend
API_URL = "http://127.0.0.1:8000/api/logs/ingest"

USERS = ["admin", "john.doe", "alice.smith", "guest", "service_account"]
LOCATIONS = ["USA", "India", "UK", "Germany", "Japan"]
QUERY_TYPES = ["SELECT", "INSERT", "UPDATE", "DELETE", "DROP"]

def generate_normal_log():
    return {
        "username": random.choice(USERS),
        "ip_address": f"192.168.1.{random.randint(1, 255)}",
        "timestamp": datetime.now().isoformat(),
        "query_count": random.randint(1, 50),
        "query_type": random.choice(["SELECT", "SELECT", "INSERT", "UPDATE"]),
        "failed_logins": random.choices([0, 1, 2], weights=[0.8, 0.15, 0.05])[0],
        "download_size_mb": round(random.uniform(0.1, 5.0), 2),
        "location": random.choice(LOCATIONS),
        "privilege_change": False,
        "target_table": random.choice(["users", "inventory", "transactions", "public_data"])
    }

def generate_attack_log(attack_type):
    log = generate_normal_log()
    if attack_type == "brute_force":
        log["failed_logins"] = random.randint(5, 20)
    elif attack_type == "data_exfiltration":
        log["download_size_mb"] = round(random.uniform(500, 2000), 2)
        log["query_count"] = random.randint(200, 1000)
    elif attack_type == "sql_injection":
        log["query_type"] = "DROP"
        log["failed_logins"] = random.randint(1, 5)
    elif attack_type == "honeypot_breach":
        log["target_table"] = "secret_payroll_data"
        log["query_type"] = "SELECT"
    return log

def run_simulation(interval=2):
    print("Starting Data Generator Simulation...")
    try:
        while True:
            # 10% chance of generating an attack
            if random.random() < 0.1:
                attack_type = random.choice(["brute_force", "data_exfiltration", "sql_injection", "honeypot_breach"])
                log = generate_attack_log(attack_type)
                print(f"Generated ATTACK log: {attack_type}")
            else:
                log = generate_normal_log()
                print("Generated NORMAL log")
            
            try:
                response = requests.post(API_URL, json=log)
                if response.status_code == 200:
                    print("Log successfully sent to API.")
            except requests.exceptions.ConnectionError:
                print("Error: Could not connect to API. Is the server running?")
                
            time.sleep(interval)
    except KeyboardInterrupt:
        print("Simulation stopped.")

if __name__ == "__main__":
    run_simulation()
