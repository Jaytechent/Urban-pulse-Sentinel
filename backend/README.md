# Urban Pulse Sentinel Backend

## Overview
Express + MongoDB service for stream registration, ingestion, and Gemini-powered incident analysis.

## Configuration
Copy `.env.example` to `.env` and update the values:

- `PORT`
- `MONGO_URI`
- `API_KEY`
- `WS_PATH`

## Key Endpoints
- `GET /api/streams` - list streams
- `POST /api/streams` - register stream
- `GET /api/incidents` - list incidents (with hypothesis)
- `POST /api/incidents/:id/analyze` - trigger Gemini reasoning
- `POST /api/ingest` - ingest multimodal windows
- `GET /api/ingest/run` - run one ingestion cycle (for Render wake-up pings)
- `GET /api/actions` - list action recommendations
- `POST /api/actions` - create action recommendations
- `POST /api/actions/:id/execute` - mark action executed
- `POST /api/actions/:id/dismiss` - dismiss action

## WebSocket
Connect to `ws://localhost:5000/ws` to receive `incident.created`, `incident.updated`, `analysis.progress`, and `action.*` events.

## Render Free Tier Note
Render free services sleep without traffic. Use a GitHub Action (or any external ping) to call:

`GET /api/ingest/run`

This wakes the service and triggers one ingestion cycle.
