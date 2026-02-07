import express from 'express';
import { processVideoChunk } from '../services/videoProcessor.js';
import { processSocialWindow } from '../services/socialIngestor.js';
import { processSensorWindow } from '../services/sensorIngestor.js';
import { createIncidentFromAnalysis, runIngestionCycle } from '../services/ingestPipeline.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { type, payload = {}, location, streamId } = req.body || {};

  if (!type) {
    return res.status(400).json({ message: 'type is required (video, social, sensor).' });
  }

  let result;
  let incidentType = type.toLowerCase();

  switch (incidentType) {
    case 'video':
      result = processVideoChunk(payload);
      break;
    case 'social':
      result = processSocialWindow(payload);
      break;
    case 'sensor':
      result = processSensorWindow(payload);
      break;
    default:
      return res.status(400).json({ message: 'Unsupported ingest type.' });
  }

  try {
    const incident = await createIncidentFromAnalysis({
      incidentType,
      result,
      location,
      streamId,
      broadcaster: req.app?.locals?.broadcast
    });

    if (!incident) {
      return res.status(200).json({ message: 'No anomaly detected.', analysis: result });
    }

    return res.status(201).json({ message: 'Incident created.', incident, analysis: result });
  } catch (error) {
    console.error('Ingest error:', error);
    return res.status(500).json({ message: 'Failed to create incident.' });
  }
});

router.get('/run', async (req, res) => {
  try {
    const summary = await runIngestionCycle({ broadcaster: req.app?.locals?.broadcast });
    return res.status(200).json({ message: 'Ingestion cycle complete.', summary });
  } catch (error) {
    console.error('Ingest run error:', error);
    return res.status(500).json({ message: 'Failed to run ingestion cycle.' });
  }
});

export default router;
