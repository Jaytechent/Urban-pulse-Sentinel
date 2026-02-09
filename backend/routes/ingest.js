import express from 'express';
import { runIngestionCycle } from '../services/ingestPipeline.js';

const router = express.Router();

// GET /api/ingest/run - Legacy endpoint (uses default LA location)
router.get('/run', async (req, res) => {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🌱 INGEST CYCLE TRIGGERED (Default Location)');
    console.log('='.repeat(70));

    const broadcaster = req.app?.locals?.broadcast;
    const result = await runIngestionCycle({ broadcaster });

    console.log('✅ INGEST CYCLE COMPLETE');
    console.log(`   Incidents created: ${result.incidents.length}`);
    console.log('='.repeat(70) + '\n');

    res.json({
      success: true,
      sources: result.sources,
      results: result.results,
      incidents: result.incidents,
      message: `Created ${result.incidents.length} incident(s)`
    });

  } catch (err) {
    console.error('❌ INGEST ERROR:', err.message);
    res.status(500).json({
      success: false,
      message: err.message,
      error: err.toString()
    });
  }
});

// ✅ NEW: POST /api/ingest/run - With city/country selection
router.post('/run', async (req, res) => {
  try {
    const { cityId, countryCode, cityName, lat, lng } = req.body;

    console.log('\n' + '='.repeat(70));
    console.log(`🌱 INGEST CYCLE TRIGGERED FOR: ${cityName} (${countryCode})`);
    console.log(`   Location: ${lat}, ${lng}`);
    console.log('='.repeat(70));

    const broadcaster = req.app?.locals?.broadcast;

    // Create custom location object for the selected city
    const location = {
      lat: parseFloat(lat) || 34.0522,
      lng: parseFloat(lng) || -118.2437,
      address: cityName || 'Downtown'
    };

    // Pass city info to ingest pipeline
    const result = await runIngestionCycle({ 
      broadcaster,
      location,
      cityId,
      countryCode,
      cityName
    });

    console.log('✅ INGEST CYCLE COMPLETE');
    console.log(`   Incidents created: ${result.incidents.length}`);
    console.log('='.repeat(70) + '\n');

    res.json({
      success: true,
      location: { cityName, countryCode, lat, lng },
      sources: result.sources,
      results: result.results,
      incidents: result.incidents,
      message: `Created ${result.incidents.length} incident(s) for ${cityName}`
    });

  } catch (err) {
    console.error('❌ INGEST ERROR:', err.message);
    res.status(500).json({
      success: false,
      message: err.message,
      error: err.toString()
    });
  }
});

export default router;
// import express from 'express';
// import { processVideoChunk } from '../services/videoProcessor.js';
// import { processSocialWindow } from '../services/socialIngestor.js';
// import { processSensorWindow } from '../services/sensorIngestor.js';
// import { createIncidentFromAnalysis, runIngestionCycle } from '../services/ingestPipeline.js';

// const router = express.Router();

// router.post('/', async (req, res) => {
//   const { type, payload = {}, location, streamId } = req.body || {};

//   if (!type) {
//     return res.status(400).json({ message: 'type is required (video, social, sensor).' });
//   }

//   let result;
//   let incidentType = type.toLowerCase();

//   switch (incidentType) {
//     case 'video':
//       result = processVideoChunk(payload);
//       break;
//     case 'social':
//       result = processSocialWindow(payload);
//       break;
//     case 'sensor':
//       result = processSensorWindow(payload);
//       break;
//     default:
//       return res.status(400).json({ message: 'Unsupported ingest type.' });
//   }

//   try {
//     const incident = await createIncidentFromAnalysis({
//       incidentType,
//       result,
//       location,
//       streamId,
//       broadcaster: req.app?.locals?.broadcast
//     });

//     if (!incident) {
//       return res.status(200).json({ message: 'No anomaly detected.', analysis: result });
//     }

//     return res.status(201).json({ message: 'Incident created.', incident, analysis: result });
//   } catch (error) {
//     console.error('Ingest error:', error);
//     return res.status(500).json({ message: 'Failed to create incident.' });
//   }
// });

// router.get('/run', async (req, res) => {
//   try {
//     const summary = await runIngestionCycle({ broadcaster: req.app?.locals?.broadcast });
//     return res.status(200).json({ message: 'Ingestion cycle complete.', summary });
//   } catch (error) {
//     console.error('Ingest run error:', error);
//     return res.status(500).json({ message: 'Failed to run ingestion cycle.' });
//   }
// });

// export default router;
