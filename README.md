# Urban Pulse Sentinel

**An autonomous urban intelligence system that turns raw city data into explainable, proactive decisions.**

Urban Pulse Sentinel continuously monitors authorized city data streams (video, social signals, sensors, and context APIs), detects emerging anomalies through **spatio-temporal multimodal reasoning**, and recommends justified interventions—powered by **Gemini 3 Pro** via Google AI Studio.

> **In plain terms:** Fuse video + social + sensor signals to identify real-world anomalies, explain why they matter, and propose actionable responses with confidence scoring. Move beyond "alerts" into "here's what you should do about it."

---

## Table of Contents
- [System Goal](#system-goal)
- [Key Differentiators](#key-differentiators)
- [Why We Win](#why-we-win--competitive-comparison)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Core Features](#core-features)
- [Data Sources](#data-sources-legal--realistic)
- [How It Works: Ingestion & Reasoning Flow](#how-it-works-ingestion--reasoning-flow)
- [Gemini Agent Responsibilities](#gemini-agent-responsibilities)
- [Action Orchestration](#action-orchestration)
- [API Reference](#api-reference-backend)
- [WebSocket Events](#websocket-events)
- [Deployment](#deployment-render--mongodb-atlas)
- [Environment Configuration](#environment-configuration)
- [Run Locally](#run-locally)
- [Ethics & Privacy](#ethics--privacy)
- [Project Statement](#project-statement)
- [Roadmap: v2](#roadmap-urban-pulse-sentinel-v2)

---

## System Goal

Urban Pulse Sentinel **autonomously detects and explains city-scale anomalies** using **multimodal, spatio-temporal reasoning**. 

It ingests and fuses:
- **Video streams** (public or simulated)
- **Social signals** (Reddit, Twitter-like public posts + keywords)
- **Sensor data** (noise, weather, traffic speed, crowd density)

And generates:
- **Hypotheses with reasoning chains**
- **Recommended interventions** (specific actions, not generic alerts)
- **Confidence scores** (0.0–1.0, with uncertainty bounds)

---

## Key Differentiators

### 1. Multimodal Anomaly Fusion (Requires Cross-Validation)
Detects incidents that **need multiple data sources to confirm**. Single-source systems either false-alarm constantly or miss context.

**Example workflow:**
- **Sensor alone:** "Traffic slowed 20%"
- **Social alone:** "People saying accident on 405"
- **Urban Pulse:** "Confirmed accident at 405 & Wilshire. Recommend immediate reroute + emergency dispatch standby. Confidence: 0.91"

---

### 2. Actionable Intervention Recommendations (Not Just Alerts)
Most smart cities output alerts. Urban Pulse outputs **what to do about it**.

**Traditional output:** "Crowd detected at LAX pickup zone"
**Urban Pulse output:**
```json
{
  "action": "Reroute ride-share pickups to Terminal 3, free up LAX pickup zone",
  "impact": "Normalization ETA: 12 min",
  "confidence": 0.91,
  "reasoning": "Reddit posts + live cam show surge in pickups. Weather clear, suggesting event-driven (not weather-driven). Historical similar incident Jan 15 → reroute fixed in 10 min."
}
```

---

### 3. Explainable Reasoning Chains
Every anomaly includes:
- **Which data sources triggered detection** (and why)
- **Step-by-step reasoning** (not just a score)
- **Historical similarity** (similar incident on Jan 15 → here's what worked)
- **Confidence + uncertainty bounds**

Ops teams can **audit and override intelligently**. No black boxes.

---

### 4. Sub-60-Second Latency: Anomaly → Recommendation
Fast enough to **intervene during incidents**, not just analyze after.

---

### 5. Privacy-First, Compliance-Ready
- ✅ No facial recognition
- ✅ No identity tracking
- ✅ Reasoning on anonymized metadata (crowd density, flow vectors, aggregated social signals)
- ✅ GDPR/CCPA ready from design, not retrofit

---

## Why We Win – Competitive Comparison

| **Feature** | **Urban Pulse Sentinel** | **Traditional Smart City** | **Dashboard-Only Systems** |
|---|---|---|---|
| **Multimodal reasoning** | ✅ Video + Social + Sensor fused | ⚠️ Siloed data streams | ❌ No reasoning |
| **Explains reasoning** | ✅ Chain-of-thought, auditable | ❌ Black-box scores | ❌ No reasoning |
| **Recommends actions** | ✅ Specific interventions + impact | ⚠️ Generic alerts only | ❌ Manual review required |
| **Latency** | ⏱️ <60 seconds | ⏱️ 5–10 minutes | ⏱️ N/A (manual) |
| **Privacy-first** | ✅ Anonymized by design | ⚠️ Often retrofitted | ✅ No data collection |
| **Handles uncertainty** | ✅ Confidence + bounds | ❌ Binary alerts | ❌ N/A |
| **Real-time updates** | ✅ WebSocket streaming | ⚠️ Polling / dashboards | ⚠️ Batch reports |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend (React + Vite)                │
│  Live Dashboard • Map Visualization • Timeline • Chat   │
└────────────────────────┬────────────────────────────────┘
                         │
                    WebSocket
                         │
┌────────────────────────▼────────────────────────────────┐
│             Backend (Node.js + Express)                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Stream Registration & Ingestion Pipeline         │   │
│  │ • Video ingest (frames/metadata)                │   │
│  │ • Social signal aggregation (Reddit)            │   │
│  │ • Sensor data normalization                     │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Anomaly Detection Layer                         │   │
│  │ • Rule-based thresholds (traffic speed, etc)   │   │
│  │ • Statistical outlier detection                │   │
│  │ • Time-series pattern matching                 │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Gemini 3 Pro Reasoning Agent                    │   │
│  │ • Multimodal fusion                            │   │
│  │ • Hypothesis generation                        │   │
│  │ • Intervention simulation                      │   │
│  │ • Confidence scoring                           │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ MongoDB Persistence                            │   │
│  │ • Streams • Incidents • Hypotheses             │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| **Layer** | **Technology** |
|---|---|
| **Frontend** | React (Vite), Tailwind CSS, Leaflet (maps), WebSocket client |
| **Backend** | Node.js, Express, Mongoose (MongoDB ODM) |
| **AI/ML** | Gemini 3 Pro (Google AI Studio), multimodal reasoning, structured output |
| **Database** | MongoDB (local or Atlas), indexing for geo-queries |
| **Real-time** | WebSocket server (Socket.io or native ws) |
| **Deployment** | Render (backend), MongoDB Atlas, GitHub Actions (CI/CD) |

---

## Core Features

| **Feature** | **Description** |
|---|---|
| **Stream Registration** | Register video, social, and sensor sources via REST API |
| **Continuous Ingestion** | Interval-based or event-driven pipeline (interval-based for MVP) |
| **Anomaly Detection** | Rule-based + statistical processors on video/social/sensor data |
| **Gemini Reasoning** | Multimodal fusion → hypothesis generation → confidence scoring |
| **WebSocket Live Updates** | Push new incidents and analysis updates to clients in real-time |
| **Action Confirmation UI** | Operators can authorize, dismiss, or modify recommended actions |
| **Incident History** | Search, filter, and analyze past incidents with reasoning trails |

---

## Data Sources (Legal + Realistic)

### Video Sources
| Source | Type | Access | Use Case |
|---|---|---|---|
| Public traffic webcams (YouTube Live) | Real-time stream | Public | Traffic anomalies, congestion detection |
| Open datasets (AI City Challenge, UCSD Traffic) | Archived video | Research license | Training, benchmarking |
| Simulated video metadata | JSON | Generated | MVP demo (no real video processing) |

### Social Sources
| Source | Type | Keywords | Example |
|---|---|---|---|
| Reddit public feeds | Posts + comments | "accident", "traffic jam", "crowd", "police" | Real-time crowdsourced reports |
| Public posts (future: Twitter API) | Tweets | Location-tagged posts | Event-driven alerts |

### Sensor / Context
| Source | Type | Update Interval | Example |
|---|---|---|---|
| OpenWeather API | JSON | 10 minutes | Weather impact on traffic/visibility |
| Simulated traffic speed data | JSON | 1 minute | Vehicle speed, congestion metrics |
| Simulated noise metrics | JSON | 5 minutes | Ambient noise (construction, events) |

---

## How It Works: Ingestion & Reasoning Flow

```
Step 1: Stream Registration
  User or config registers video/social/sensor source
  → Stored in MongoDB
  
Step 2: Ingest Data Window
  Backend fetches latest data from all registered sources
  Example:
    • Last 10 Reddit posts (keyword-filtered)
    • Last 5 frames from YouTube Live stream
    • Last 2 OpenWeather snapshots
  
Step 3: Anomaly Detection (Rule-Based)
  Processors check for:
    • Traffic speed drop >20%
    • Social post spike (5+ mentions in 5 min)
    • Crowd density surge (if video metadata available)
  If ANY trigger, create Incident in MongoDB
  
Step 4: Gemini Analysis
  Construct multimodal prompt:
    {
      "video_context": "Heavy traffic, some debris visible",
      "social_signals": ["accident on 405", "stuck 30 min"],
      "sensor_data": {"speed": 15 mph, "normal": 45 mph},
      "weather": {"condition": "clear", "visibility": "good"}
    }
  Send to Gemini 3 Pro with structured output prompt
  
Step 5: Gemini Output (Structured)
  {
    "hypothesis": "Traffic accident on 405 near Wilshire",
    "confidence": 0.91,
    "reasoning": [
      "Social signals mention '405 accident' (3 posts)",
      "Traffic speed dropped 67% below baseline",
      "Weather clear, suggesting non-weather cause",
      "Historical similar incident: Jan 15, resolved in 12 min with reroute"
    ],
    "recommended_action": "Reroute ride-share to surface streets, alert CHP",
    "estimated_impact": "Normalization in 10–15 minutes",
    "uncertainty": "Traffic sensor coverage limited; not 100% confident in exact location"
  }
  
Step 6: Return to Frontend
  Push via WebSocket → Live update on dashboard
  Operator reviews reasoning and clicks "Authorize" or "Dismiss"
  If authorized, action is logged and (for MVP) simulated
```

---

## Gemini Agent Responsibilities

The Gemini 3 Pro agent must:

1. **Fuse multimodal inputs**
   - Ingest and contextualize video metadata (movement, crowds)
   - Parse social signals (sentiment, location relevance)
   - Normalize sensor readings (traffic speed, noise)

2. **Detect anomalies over time**
   - Compare current state to historical baseline
   - Identify unusual combinations (e.g., high social chatter + low traffic = congestion from event, not accident)

3. **Generate hypotheses with reasoning chains**
   - Output step-by-step logic (not just a label)
   - Reference which data source triggered each step
   - Acknowledge data gaps and limitations

4. **Simulate interventions**
   - Predict impact of rerouting, alerts, closures
   - Estimate time-to-resolution
   - Suggest alternatives if primary action fails

5. **Score confidence and uncertainty**
   - 0.0–1.0 scale with bounds
   - Explain sources of uncertainty (missing data, conflicting signals)

---

## Action Orchestration

Actions are **simulated and stored** for MVP:

| Action | Simulation | Future Real Integration |
|---|---|---|
| **Alert authorities** | Log to DB + mock email | SMS/email to CHP, LAPD |
| **Reroute traffic** | Update map UI to show alternate routes | API call to navigation providers |
| **Public advisory** | Generate text message | SMS broadcast to residents |
| **Close roads** | Simulate on dashboard | SCATS/traffic signal API |

**Note:** No real emergency systems are triggered for this MVP. All actions are logged in MongoDB for audit trails.

---

## API Reference (Backend)

### Streams
```
GET    /api/streams                 → List all registered streams
POST   /api/streams                 → Register a new stream
GET    /api/streams/:id             → Get stream details
DELETE /api/streams/:id             → Deregister a stream
```

**Example POST /api/streams:**
```json
{
  "type": "video",
  "name": "LAX Pickup Zone Cam",
  "source_url": "https://youtube.com/live/...",
  "location": {"lat": 33.9425, "lng": -118.4081},
  "refresh_interval_ms": 60000
}
```

### Incidents
```
GET    /api/incidents               → List all incidents
GET    /api/incidents/:id           → Get incident details + reasoning
POST   /api/incidents/:id/analyze   → Trigger Gemini analysis
POST   /api/incidents/:id/confirm   → Authorize or dismiss action
```

**Example GET /api/incidents/:id:**
```json
{
  "id": "inc-20250207-001",
  "created_at": "2025-02-07T14:23:01Z",
  "location": {"lat": 34.0522, "lng": -118.2437},
  "title": "Traffic congestion on 405 near Wilshire",
  "status": "detected",
  "anomaly_sources": ["traffic_speed", "social_signal"],
  "hypothesis": {
    "description": "Accident or stalled vehicle",
    "confidence": 0.91,
    "reasoning": [
      "Speed drop: 45 → 15 mph (67% decrease)",
      "Social: 3 Reddit posts mentioning '405 accident' in last 5 min",
      "Weather: Clear, suggesting non-weather cause"
    ]
  },
  "recommended_action": {
    "action": "Reroute ride-share to surface streets",
    "impact": "Estimated normalization in 12 min",
    "confidence": 0.91
  }
}
```

### Ingestion
```
GET    /api/ingest/run              → Run one ingestion cycle (Render wake-up)
POST   /api/ingest                  → Manually ingest a single payload
```

**Example POST /api/ingest:**
```json
{
  "stream_id": "cam-101",
  "data": {
    "type": "video_metadata",
    "traffic_speed_mph": 20,
    "crowd_density": "high",
    "timestamp": "2025-02-07T14:23:00Z"
  }
}
```

---

## WebSocket Events

Connect to `ws://<host>/ws` to receive live updates:

| Event | Payload | Description |
|---|---|---|
| `incident.created` | `{id, title, location, status}` | New anomaly detected |
| `incident.updated` | `{id, hypothesis, recommended_action}` | Gemini analysis complete |
| `incident.confirmed` | `{id, action, operator}` | Operator authorized action |
| `analysis.progress` | `{id, step, message}` | Real-time reasoning step (future) |

**Example WebSocket message:**
```json
{
  "event": "incident.created",
  "data": {
    "id": "inc-20250207-001",
    "title": "Traffic anomaly on 405",
    "location": {"lat": 34.0522, "lng": -118.2437},
    "status": "analyzing"
  }
}
```

---

## Deployment (Render + MongoDB Atlas)

### Quick Start (Production)

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Deploy backend to Render:**
   - New Web Service → Connect GitHub repo
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Environment variables: Add `MONGO_URI`, `API_KEY` (Gemini)

3. **MongoDB Atlas:**
   - Create cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
   - Copy connection string → `MONGO_URI` in Render env

4. **Wake-up endpoint:**
   - Set up scheduler (e.g., Render Cron Job or external service)
   - Call `GET https://<your-render-host>/api/ingest/run` every 10 minutes

   Example using GitHub Actions:
   ```yaml
   name: Wake Ingestion
   on:
     schedule:
       - cron: '*/10 * * * *'
   jobs:
     ingest:
       runs-on: ubuntu-latest
       steps:
         - run: curl -X GET https://your-render-host/api/ingest/run
   ```

### Frontend Deployment (Vercel / Netlify)

```bash
npm run build
# Deploy `dist/` folder to Vercel/Netlify
```

---

## Environment Configuration

### Backend (`backend/.env`)
```env
# Server
PORT=5000
NODE_ENV=production

# MongoDB
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/urban_pulse

# Gemini API
API_KEY=your_google_ai_studio_api_key

# WebSocket
WS_PATH=/ws

# Ingestion
ENABLE_INGEST_LOOP=false
INGEST_INTERVAL_MS=600000

# Default Location (Downtown LA)
DEFAULT_LAT=34.0522
DEFAULT_LNG=-118.2437
DEFAULT_ADDRESS=Downtown LA

# Stream IDs
VIDEO_STREAM_ID=cam-101
SOCIAL_STREAM_ID=soc-reddit
SENSOR_STREAM_ID=sen-openweather

# Social Sources
REDDIT_SUBREDDITS=losangeles,traffic,ucla
REDDIT_USER_AGENT=urban-pulse-sentinel/1.0

# Weather API
OPENWEATHER_API_KEY=your_openweather_key
WEATHER_CITY=Los Angeles

# Traffic Simulation
TRAFFIC_API_URL=https://api.example.com/traffic
```

### Frontend (`.env`)
```env
VITE_BACKEND_URL=https://your-render-host/api
VITE_WS_URL=wss://your-render-host/ws
```

---

## Run Locally

### Prerequisites
- Node.js (v18+)
- MongoDB Community Edition or MongoDB Compass
- Gemini API key from [Google AI Studio](https://aistudio.google.com)

### Setup

1. **Clone repository:**
   ```bash
   git clone https://github.com/yourusername/urban-pulse-sentinel.git
   cd urban-pulse-sentinel
   ```

2. **Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your API keys
   npm run dev
   ```
   Backend runs on `http://localhost:5000`

3. **Frontend:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

4. **Start MongoDB:**
   ```bash
   # Using Docker (easiest)
   docker run -d -p 27017:27017 mongo:latest
   
   # Or, if MongoDB installed locally:
   mongod
   ```

5. **Test the flow:**
   - Open `http://localhost:5173`
   - Go to **Streams** → Add a video stream
   - Click **Ingest Now** to fetch data
   - Check **Incidents** to see results
   - Click an incident to see Gemini reasoning

---

## Ethics & Privacy

Urban Pulse Sentinel is built on privacy-first principles:

| Principle | Implementation |
|---|---|
| **No face recognition** | Video processing operates on metadata only (movement vectors, crowd density) |
| **No identity tracking** | Social signals are aggregated; individual posters not identified |
| **Public data only** | Uses authorized, public, or simulated data streams |
| **Anonymization by design** | Video feeds are either public or anonymized at ingestion time |
| **Transparent reasoning** | Every recommendation includes reasoning chain; operators can audit and override |
| **GDPR/CCPA ready** | No PII stored; data retention policies enforced in MongoDB |

---

## Project Statement

Urban Pulse Sentinel is an **autonomous urban reasoning agent** that detects, understands, and responds to city-scale anomalies by reasoning across video, social, and sensor data streams in real time.

It moves beyond traditional dashboards and binary alerts into **explainable, proactive urban intelligence**—turning raw city data into actionable insights that ops teams can trust, audit, and act on within seconds.

---

## Roadmap: Urban Pulse Sentinel v2

**Next-step enhancements designed to push this into a true city-scale operating system:**

| Feature | Description | Timeline |
|---|---|---|
| **Continuous agent loop** | Adaptive scheduling based on anomaly rate + time-of-day patterns | Q2 2025 |
| **Real video analytics** | Object detection + tracking with on-device anonymization | Q2 2025 |
| **Advanced hypothesis memory** | "Thought signatures" linking recurring incidents, learning intervention outcomes | Q3 2025 |
| **Live intervention simulator** | What-if engine predicting impact of reroutes, closures, alerts before execution | Q3 2025 |
| **Expanded civic APIs** | Integration with 911 call volume, transit disruptions, emergency notices | Q3 2025 |
| **Model-level governance** | Policy guardrails, bias mitigation, explainability audits at inference time | Q4 2025 |
| **Multi-city deployment** | Tenant isolation, regional dashboards, transfer learning across cities | Q4 2025 |
| **Mobile alerts** | Push notifications to citizens + operators for high-confidence anomalies | Q2 2025 |

---

## Demo & Support

**Demo Video:** [Link to demo video]


---

## License

MIT License – See `LICENSE` file for details.

---

**Built with ❤️ using Gemini 3 Pro | © 2026 Urban Pulse Sentinel**