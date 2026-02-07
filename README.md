# Urban Pulse Sentinel

Urban Pulse Sentinel is an **autonomous urban intelligence system** that continuously monitors authorized city data streams (video, social signals, sensors, and context APIs), detects emerging anomalies through **spatio‑temporal multimodal reasoning**, and recommends justified interventions. It is **not a chatbot**. It is an **Action‑Era orchestrator** built around Gemini 3.

> **Judge‑friendly summary:** Urban Pulse Sentinel fuses video + social + sensor signals to identify real‑world anomalies, explain why they matter, and propose actionable responses with confidence scoring—turning raw city data into explainable, proactive urban intelligence.

---

## Table of Contents
- [System Goal](#system-goal)
- [Key Differentiators (Why We Can Win)](#key-differentiators-why-we-can-win)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Core Features](#core-features)
- [Data Sources (Legal + Realistic)](#data-sources-legal--realistic)
- [Ingestion & Reasoning Flow](#ingestion--reasoning-flow)
- [Anomaly Detection Layer (Before Gemini)](#anomaly-detection-layer-before-gemini)
- [Gemini Agent Responsibilities](#gemini-agent-responsibilities)
- [Gemini Prompt & Output (Real Example)](#gemini-prompt--output-real-example)
- [Thought Signatures (What They Mean)](#thought-signatures-what-they-mean)
- [Action Orchestration (Concrete + Tracked)](#action-orchestration-concrete--tracked)
- [Sample Data Artifacts](#sample-data-artifacts)
- [WebSocket Events](#websocket-events)
- [API Reference (Backend)](#api-reference-backend)
- [Deployment (Render + MongoDB Atlas)](#deployment-render--mongodb-atlas)
- [Reliability & Error Handling](#reliability--error-handling)
- [Environment Configuration](#environment-configuration)
- [Run Locally](#run-locally)
- [Ethics & Privacy](#ethics--privacy)
- [Project Statement for Judges](#project-statement-for-judges)
- [Roadmap: Urban Pulse Sentinel v2](#roadmap-urban-pulse-sentinel-v2)

---

## System Goal
Urban Pulse Sentinel autonomously detects and explains **city‑scale anomalies** using **multimodal, spatio‑temporal reasoning**. It fuses:
- **Video streams** (public or simulated)
- **Social signals** (public posts + keywords)
- **Sensor data** (noise, weather, traffic speed)

Then it generates:
- **Hypotheses** (reasoning steps)
- **Recommended interventions**
- **Confidence scores**

---

## Key Differentiators (Why We Can Win)
1. **Action‑Era Orchestration**: Moves beyond dashboards into *decision recommendations* with justifications.
2. **Multimodal fusion**: Video + sensor + social + context are reasoned together, not in isolation.
3. **Explainability**: Gemini outputs a reasoning chain + confidence score.
4. **Real‑time readiness**: WebSocket live updates + ingestion pipeline.
5. **Ethical framing**: No face recognition, no identity tracking, only authorized/public data.

---

## Architecture Overview
```
Frontend (React)
  └─ Live dashboard, map, timeline, reasoning panel
Backend (Node.js + Express)
  ├─ Stream registration
  ├─ Ingestion + anomaly processing
  ├─ Gemini reasoning agent
  ├─ Action tracking
  ├─ MongoDB persistence
  └─ WebSocket live updates

MongoDB
  ├─ Stream
  ├─ Incident
  ├─ Hypothesis
  └─ Action
```

---

## Tech Stack
**Backend**
- Node.js + Express
- MongoDB (Mongoose)
- WebSocket server for live updates

**AI**
- Gemini 3 (current backend model: `gemini-3-flash-preview`)
- Multimodal reasoning
- Thought signatures (reasoning chains + confidence)

**Frontend**
- React (Vite)
- Map + timeline visualization

---

## Core Features
- **Stream registration** for video, social, and sensor sources
- **Continuous ingestion pipeline** (interval‑based or external wake‑up ping)
- **Anomaly detection** from fused signals (rule‑based, pre‑Gemini)
- **Gemini reasoning** with hypothesis + intervention
- **Action tracking** (recommended → executed/dismissed)
- **WebSocket updates** to push new incidents and reasoning states

---

## Data Sources (Legal + Realistic)
**Video Sources**
- Public traffic webcams (YouTube Live / HLS)
- Open datasets (AI City Challenge, UCSD Traffic Dataset)

**Social Sources**
- Reddit public feeds (no API key required)
- Keywords: “accident”, “stuck traffic”, “crowd gathering”, “police presence”

**Sensor / Context**
- OpenWeather API
- Simulated traffic speed JSON
- Simulated noise metrics

---

## Ingestion & Reasoning Flow
1. **Register streams** via `/api/streams`
2. **Ingest data windows** or run `/api/ingest/run`
3. **Detect anomaly** (video/social/sensor processors)
4. **Create incident** in MongoDB
5. **Trigger Gemini analysis** via `/api/incidents/:id/analyze`
6. **Return hypothesis + action + confidence** to UI

---

## Anomaly Detection Layer (Before Gemini)
This MVP intentionally runs a **rule‑based anomaly layer** before Gemini to avoid noisy reasoning on raw data.

**Video rules**
- Uses congestion index + stopped vehicles + pedestrian clusters.

**Social rules**
- Keyword‑hit thresholds across recent posts.

**Sensor rules**
- Noise and traffic speed thresholds.

These processors produce a structured payload that Gemini can reason over.

---

## Gemini Agent Responsibilities
The Gemini agent must:
1. Fuse multimodal inputs
2. Detect anomalies over time
3. Generate hypotheses
4. Simulate interventions
5. Recommend actions with justification

---

## Gemini Prompt & Output (Real Example)
**Prompt (excerpt)**
```text
You are the Urban Pulse Sentinel AI (Backend Core).

TASK: Perform multimodal reasoning on the following urban incident.

INCIDENT DETAILS:
Title: Traffic Stoppage - Main St
Severity: HIGH
Summary: Detected stationary vehicles for >120s...
Timestamp: 2024-01-01T00:00:00Z

ACTIVE DATA STREAMS:
- [VIDEO] Intersection Main/5th (Location: 34.0522, -118.2437)
- [SOCIAL] Social Sentinel (X)

INSTRUCTIONS:
1. Analyze the correlation between the incident report and stream types.
2. Generate a step-by-step reasoning chain explaining the anomaly.
3. Determine the best specific intervention.
4. Assign a confidence score (0.0 - 1.0).

RESPONSE FORMAT (JSON ONLY):
{ "reasoning_steps": [...], "hypothesis_text": "...", "recommended_action": "...", "confidence_score": 0.95 }
```

**Gemini Output (example)**
```json
{
  "reasoning_steps": [
    "Video stream shows prolonged vehicle stoppage.",
    "Social posts mention accident keywords within 5 minutes.",
    "Weather is clear; congestion is non-routine.",
    "Conclusion: likely collision blocking lanes."
  ],
  "hypothesis_text": "Non-routine congestion likely caused by a collision at Main/5th.",
  "recommended_action": "Dispatch traffic control units and issue reroute advisory.",
  "confidence_score": 0.91
}
```

---

## Thought Signatures (What They Mean)
**Thought signatures** = the structured reasoning output from Gemini:
- `reasoning_steps` (explicit chain)
- `confidence_score` (0–1)

This creates explainability and auditability for every action recommendation.

---

## Action Orchestration (Concrete + Tracked)
Actions are **structured, tracked, and broadcast** (not just text in the UI).

**Action states**:
- `recommended` → `authorized` → `executed` or `dismissed`

**Example action object**:
```json
{
  "incidentId": "inc-001",
  "recommendedAction": "Dispatch traffic control units and issue reroute advisory.",
  "status": "recommended",
  "createdAt": "2024-01-01T00:00:10Z"
}
```

Actions can be updated via API and broadcast to the UI in real time.

---

## Sample Data Artifacts
**Incident (stored)**
```json
{
  "id": "inc-001",
  "title": "Traffic Stoppage - Main St",
  "severity": "HIGH",
  "status": "action_required",
  "summary": "Non-routine congestion likely caused by a collision...",
  "streamsInvolved": ["cam-101", "soc-twt"],
  "location": { "lat": 34.0522, "lng": -118.2437, "address": "Main St & 5th" }
}
```

**Action (tracked)**
```json
{
  "incidentId": "inc-001",
  "recommendedAction": "Dispatch traffic control units and issue reroute advisory.",
  "status": "recommended"
}
```

---

## WebSocket Events
Connect to `ws://<host>/ws` to receive:
- `incident.created`
- `incident.updated`
- `analysis.progress` (status: started/completed)
- `action.recommended`
- `action.executed`
- `action.dismissed`

---

## API Reference (Backend)
- `GET /api/streams` – list streams
- `POST /api/streams` – register a stream
- `GET /api/incidents` – list incidents
- `POST /api/incidents/:id/analyze` – Gemini analysis
- `POST /api/ingest` – ingest a single payload
- `GET /api/ingest/run` – run one ingestion cycle (Render wake endpoint)
- `GET /api/actions` – list actions
- `POST /api/actions` – create action
- `POST /api/actions/:id/execute` – execute action
- `POST /api/actions/:id/dismiss` – dismiss action

---

## Deployment (Render + MongoDB Atlas)
Render free tier sleeps without traffic. Use a GitHub Action (or ping service) to hit:
```
GET https://<your-render-host>/api/ingest/run
```
This wakes the backend and runs one ingestion cycle.

---

## Reliability & Error Handling
- **Gemini timeouts/errors** return a safe fallback response to avoid UI failures.
- **Ingestion failures** are logged and do not crash the server.
- **Render wake endpoint** gives deterministic ingestion even when cron jobs are unavailable.

---

## Environment Configuration
### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/urban_pulse
API_KEY=your_gemini_api_key
WS_PATH=/ws
ENABLE_INGEST_LOOP=false
INGEST_INTERVAL_MS=600000
DEFAULT_LAT=34.0522
DEFAULT_LNG=-118.2437
DEFAULT_ADDRESS=Downtown LA
VIDEO_STREAM_ID=cam-101
SOCIAL_STREAM_ID=soc-twt
SENSOR_STREAM_ID=sen-noise
REDDIT_SUBREDDITS=losangeles,traffic
REDDIT_USER_AGENT=urban-pulse-sentinel/1.0
OPENWEATHER_API_KEY=
WEATHER_CITY=Los Angeles
TRAFFIC_API_URL=
```

### Frontend (`.env`)
```env
VITE_BACKEND_URL=http://localhost:5000/api
```

---

## Run Locally
**Prerequisites:** Node.js + MongoDB

```bash
npm install
npm run dev
```
Backend:
```bash
cd backend
npm install
npm run dev
```

---

## Ethics & Privacy
- Only authorized or public data streams
- No face recognition
- No identity tracking
- Video anonymized or public

---

## Project Statement for Judges
Urban Pulse Sentinel is an autonomous urban reasoning agent that detects, understands, and responds to city‑scale anomalies by reasoning across video, social, and sensor data streams in real time. It moves beyond dashboards and alerts into **explainable, proactive urban intelligence**.

---

## Roadmap: Urban Pulse Sentinel v2
**Next‑step enhancements designed to push this into a true city‑scale operating system:**

1. **Continuous agent loop** with adaptive scheduling based on anomaly rate
2. **Real video analytics integration** (object detection + tracking) with anonymization
3. **Advanced hypothesis memory** (“thought signatures”) to link recurring incidents
4. **Live intervention simulator** (what‑if impact prediction)
5. **Expanded civic APIs** (911 call volume proxies, transit disruptions, emergency notices)
6. **Model‑level governance** for policy compliance and bias mitigation
7. **Multi‑city deployment** with tenant separation and regional dashboards

---

## Why Urban Pulse Sentinel Can Place #1
- **Clear actionability** + explainability
- **Realistic data flow and ingestion architecture**
- **Ethical design baked in**
- **Demonstrates Action‑Era AI** (not just observation)

If you want, we can add a demo video link and a judge walkthrough checklist in this README.
