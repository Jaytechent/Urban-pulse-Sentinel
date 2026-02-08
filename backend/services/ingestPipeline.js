import Incident from '../models/Incident.js';
import { processVideoChunk } from './videoProcessor.js';
import { processSocialWindow } from './socialIngestor.js';
import { processSensorWindow } from './sensorIngestor.js';
import {
  fetchRedditSignals,
  fetchTrafficSignals,
  fetchWeatherSignals,
  simulateSensorPayload,
  simulateVideoPayload
} from './dataConnectors.js';

const defaultLocation = {
  lat: Number(process.env.DEFAULT_LAT || 34.0522),
  lng: Number(process.env.DEFAULT_LNG || -118.2437),
  address: process.env.DEFAULT_ADDRESS || 'Downtown'
};

const generateIncidentId = (prefix) => `${prefix}-${Date.now().toString(36)}`;

export const createIncidentFromAnalysis = async ({
  incidentType,
  result,
  location = defaultLocation,
  streamId,
  broadcaster
}) => {
  if (!result?.anomalyDetected) {
    return null;
  }

  const incident = await Incident.create({
    id: generateIncidentId(incidentType.slice(0, 3)),
   title: result.title || `${result.summary?.slice(0, 25)}...`,
    severity: result.severity,
    status: 'analyzing',
    summary: result.summary,
    streamsInvolved: streamId ? [streamId] : [],
    location: location || defaultLocation
  });

  if (broadcaster) {
    broadcaster('incident.created', incident);
  }

  return incident;
};

export const runIngestionCycle = async ({ broadcaster } = {}) => {
  const traffic = await fetchTrafficSignals();
  const weather = await fetchWeatherSignals();
  const reddit = await fetchRedditSignals();

  const trafficSpeed = traffic?.speed || 15;
  const videoPayload = simulateVideoPayload({ trafficSpeed });
  const sensorPayload = simulateSensorPayload({ trafficSpeed, weather: weather?.weather });

  const videoResult = processVideoChunk(videoPayload);
  const socialResult = processSocialWindow(reddit || { posts: [] });
  const sensorResult = processSensorWindow(sensorPayload);

  const incidents = [];

  const videoIncident = await createIncidentFromAnalysis({
    incidentType: 'video',
    result: videoResult,
    streamId: process.env.VIDEO_STREAM_ID,
    broadcaster
  });
  if (videoIncident) incidents.push(videoIncident);

  const socialIncident = await createIncidentFromAnalysis({
    incidentType: 'social',
    result: socialResult,
    streamId: process.env.SOCIAL_STREAM_ID,
    broadcaster
  });
  if (socialIncident) incidents.push(socialIncident);

  const sensorIncident = await createIncidentFromAnalysis({
    incidentType: 'sensor',
    result: sensorResult,
    streamId: process.env.SENSOR_STREAM_ID,
    broadcaster
  });
  if (sensorIncident) incidents.push(sensorIncident);

  return {
    sources: {
      traffic,
      weather,
      redditCount: reddit?.posts?.length || 0
    },
    results: {
      video: videoResult,
      social: socialResult,
      sensor: sensorResult
    },
    incidents
  };
};
