import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import connectDB from './config/db.js';
import streamRoutes from './routes/streams.js';
import incidentRoutes from './routes/incidents.js';
import ingestRoutes from './routes/ingest.js';
import Incident from './models/Incident.js';
import Stream from './models/Stream.js';
import { runIngestionCycle } from './services/ingestPipeline.js';

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// 🔍 DEBUG: Log all incoming requests
app.use((req, res, next) => {
  console.log(`\n📥 ${req.method} ${req.path}`);
  console.log(`   Body: ${JSON.stringify(req.body).substring(0, 100)}`);
  next();
});

// Routes
app.use('/api/streams', streamRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/ingest', ingestRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('Urban Pulse Sentinel Backend Active');
});

// Seed Data for Demo (if DB is empty)
const seedData = async () => {
  try {
    const streamCount = await Stream.countDocuments();
    if (streamCount === 0) {
      console.log('Seeding Streams...');
      await Stream.insertMany([
        {
          id: 'cam-101',
          name: 'Intersection Main/5th',
          type: 'VIDEO',
          status: 'active',
          endpoint: 'https://picsum.photos/400/300?random=1',
          location: { lat: 34.0522, lng: -118.2437, address: 'Main St' }
        },
        {
          id: 'soc-twt',
          name: 'Social Sentinel (X)',
          type: 'SOCIAL',
          status: 'active',
          endpoint: 'api/social',
          location: { lat: 34.0522, lng: -118.2437 }
        },
        {
           id: 'sen-noise',
           name: 'Acoustic Array 1',
           type: 'SENSOR',
           status: 'active',
           endpoint: 'api/sensor',
           location: { lat: 34.0540, lng: -118.2460 }
        }
      ]);
    }

    const incidentCount = await Incident.countDocuments();
    if (incidentCount === 0) {
      console.log('Seeding Incidents...');
      await Incident.create({
        id: 'inc-001',
        title: 'Traffic Stoppage - Main St',
        severity: 'HIGH',
        status: 'action_required',
        summary: 'Detected stationary vehicles for >120s with associated pedestrian gathering.',
        streamsInvolved: ['cam-101', 'soc-twt', 'sen-noise'],
        location: { lat: 34.0522, lng: -118.2437, address: 'Main St & 5th' }
      });
    }
  } catch (error) {
    console.error("Seeding Error:", error);
  }
};

// Run Seeder
seedData();

const PORT = process.env.PORT || 5000;
const server = createServer(app);
const wss = new WebSocketServer({ server, path: process.env.WS_PATH || '/ws' });

const broadcast = (event, payload) => {
  const message = JSON.stringify({ event, payload, sentAt: new Date().toISOString() });
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
};

app.locals.broadcast = broadcast;

wss.on('connection', (socket) => {
  socket.send(JSON.stringify({ event: 'connected', payload: { status: 'ok' } }));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const enableLoop = process.env.ENABLE_INGEST_LOOP === 'true';
if (enableLoop) {
  const intervalMs = Number(process.env.INGEST_INTERVAL_MS || 600000);
  console.log(`Starting ingestion loop every ${intervalMs}ms`);
  runIngestionCycle({ broadcaster: app.locals.broadcast }).catch((error) => {
    console.error('Initial ingestion cycle failed:', error);
  });
  setInterval(() => {
    runIngestionCycle({ broadcaster: app.locals.broadcast }).catch((error) => {
      console.error('Ingestion cycle failed:', error);
    });
  }, intervalMs);
}
// import express from 'express';

// import cors from 'cors';
// import dotenv from 'dotenv';
// import { createServer } from 'http';
// import { WebSocketServer } from 'ws';
// import connectDB from './config/db.js';
// import streamRoutes from './routes/streams.js';
// import incidentRoutes from './routes/incidents.js';
// import ingestRoutes from './routes/ingest.js';
// import Incident from './models/Incident.js';
// import Stream from './models/Stream.js';
// import { runIngestionCycle } from './services/ingestPipeline.js';

// // Load env vars
// dotenv.config();

// // Connect to MongoDB
// connectDB();

// const app = express();

// app.use(cors());
// app.use(express.json());

// // Routes
// app.use('/api/streams', streamRoutes);
// app.use('/api/incidents', incidentRoutes);
// app.use('/api/ingest', ingestRoutes);

// // Health Check
// app.get('/', (req, res) => {
//   res.send('Urban Pulse Sentinel Backend Active');
// });

// // Seed Data for Demo (if DB is empty)
// const seedData = async () => {
//   try {
//     const streamCount = await Stream.countDocuments();
//     if (streamCount === 0) {
//       console.log('Seeding Streams...');
//       await Stream.insertMany([
//         {
//           id: 'cam-101',
//           name: 'Intersection Main/5th',
//           type: 'VIDEO',
//           status: 'active',
//           endpoint: 'https://picsum.photos/400/300?random=1',
//           location: { lat: 34.0522, lng: -118.2437, address: 'Main St' }
//         },
//         {
//           id: 'soc-twt',
//           name: 'Social Sentinel (X)',
//           type: 'SOCIAL',
//           status: 'active',
//           endpoint: 'api/social',
//           location: { lat: 34.0522, lng: -118.2437 }
//         },
//         {
//            id: 'sen-noise',
//            name: 'Acoustic Array 1',
//            type: 'SENSOR',
//            status: 'active',
//            endpoint: 'api/sensor',
//            location: { lat: 34.0540, lng: -118.2460 }
//         }
//       ]);
//     }

//     const incidentCount = await Incident.countDocuments();
//     if (incidentCount === 0) {
//       console.log('Seeding Incidents...');
//       await Incident.create({
//         id: 'inc-001',
//         title: 'Traffic Stoppage - Main St',
//         severity: 'HIGH',
//         status: 'action_required',
//         summary: 'Detected stationary vehicles for >120s with associated pedestrian gathering.',
//         streamsInvolved: ['cam-101', 'soc-twt', 'sen-noise'],
//         location: { lat: 34.0522, lng: -118.2437, address: 'Main St & 5th' }
//       });
//     }
//   } catch (error) {
//     console.error("Seeding Error:", error);
//   }
// };

// // Run Seeder
// seedData();

// const PORT = process.env.PORT || 5000;
// const server = createServer(app);
// const wss = new WebSocketServer({ server, path: process.env.WS_PATH || '/ws' });

// const broadcast = (event, payload) => {
//   const message = JSON.stringify({ event, payload, sentAt: new Date().toISOString() });
//   wss.clients.forEach((client) => {
//     if (client.readyState === client.OPEN) {
//       client.send(message);
//     }
//   });
// };

// app.locals.broadcast = broadcast;

// wss.on('connection', (socket) => {
//   socket.send(JSON.stringify({ event: 'connected', payload: { status: 'ok' } }));
// });

// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// const enableLoop = process.env.ENABLE_INGEST_LOOP === 'true';
// if (enableLoop) {
//   const intervalMs = Number(process.env.INGEST_INTERVAL_MS || 600000);
//   console.log(`Starting ingestion loop every ${intervalMs}ms`);
//   runIngestionCycle({ broadcaster: app.locals.broadcast }).catch((error) => {
//     console.error('Initial ingestion cycle failed:', error);
//   });
//   setInterval(() => {
//     runIngestionCycle({ broadcaster: app.locals.broadcast }).catch((error) => {
//       console.error('Ingestion cycle failed:', error);
//     });
//   }, intervalMs);
// }
