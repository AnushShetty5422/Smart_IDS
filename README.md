# 🛡️ Smart IDS

> An AI-Powered Intrusion Detection System with Real-Time Security Analytics

Smart IDS is a hybrid Intrusion Detection System (IDS) that combines rule-based detection, machine learning, and AI-assisted analysis to identify suspicious activities and visualize security events in real time.

Designed as a final-year engineering project, Smart IDS demonstrates how traditional intrusion detection can be enhanced using modern AI techniques while providing an intuitive monitoring dashboard.

---

## ✨ Features

- 🔍 Real-time log monitoring
- 🤖 Machine Learning anomaly detection
- 🧠 AI-assisted log analysis using Ollama (Mistral)
- 🛡️ Rule-based threat detection
- 🍯 Honeypot integration
- 📊 Interactive security dashboard
- 📈 Real-time analytics and visualization
- 🚨 Security alert generation
- 📄 Automated incident summaries
- ⚡ FastAPI backend with REST APIs

---

## 🏗️ System Architecture

```
                Network Logs
                      │
                      ▼
             Log Collection Module
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
 Rule-Based Engine         ML Anomaly Detection
        │                           │
        └─────────────┬─────────────┘
                      ▼
             AI Log Interpretation
               (Ollama + Mistral)
                      │
                      ▼
              FastAPI Backend API
                      │
                      ▼
           React Monitoring Dashboard
```

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- Recharts
- Framer Motion
- Lucide React

### Backend

- Python
- FastAPI
- SQLAlchemy

### Machine Learning

- Scikit-Learn
- Isolation Forest
- Pandas
- NumPy

### AI

- Ollama
- Mistral

### Database

- SQLite

---

## 📂 Project Structure

```
Smart_IDS/

├── backend/
│   ├── api/
│   ├── models/
│   ├── services/
│   └── database/
│
├── frontend/
│   ├── src/
│   ├── components/
│   └── pages/
│
├── ml/
│   └── anomaly_detection/
│
├── honeypot/
│
├── docs/
│
└── README.md
```

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/Smart_IDS.git
cd Smart_IDS
```

---

### Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload
```

---

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## 📸 Screenshots

> Add screenshots of your dashboard here.

### Dashboard

![Dashboard](docs/dashboard.png)

### Alerts

![Alerts](docs/alerts.png)

### Analytics

![Analytics](docs/analytics.png)

---

## 📊 Key Modules

- Log Collection
- Threat Detection
- Machine Learning Engine
- AI Log Analysis
- Honeypot Integration
- Alert Management
- Security Dashboard

---

## 🎯 Future Improvements

- Docker deployment
- Multi-user authentication
- Cloud deployment
- Threat intelligence integration
- Email/SMS alerting
- SIEM integration
- Distributed log collection
- Advanced ML models

---

## 📖 Research

This project was developed as part of a Bachelor of Technology major project focusing on AI-assisted Intrusion Detection and Real-Time Security Analytics.

---

## 👨‍💻 Author

**Anush Shetty**

Electronics & Computer Science Engineering

Cybersecurity • Python • AI • Software Development

GitHub: https://github.com/YOUR_USERNAME

---

## 📜 License

This project is intended for educational and research purposes.

Feel free to fork, learn from, and improve it.
