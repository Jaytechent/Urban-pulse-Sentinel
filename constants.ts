import { Incident, IncidentSeverity, Stream, StreamType } from './types';

export const APP_NAME = "URBAN PULSE SENTINEL";
export const GEMINI_MODEL = "gemini-3-flash-preview";

// Mock Streams
export const MOCK_STREAMS: Stream[] = [
  {
    id: 'cam-101',
    name: 'Intersection Main/5th',
    type: StreamType.VIDEO,
    status: 'active',
    endpoint: 'https://picsum.photos/400/300?random=1',
    location: { lat: 34.0522, lng: -118.2437 },
    lastUpdate: 'Live'
  },
  {
    id: 'cam-204',
    name: 'Highway 101 Exit 4B',
    type: StreamType.VIDEO,
    status: 'active',
    endpoint: 'https://picsum.photos/400/300?random=2',
    location: { lat: 34.0560, lng: -118.2500 },
    lastUpdate: 'Live'
  },
  {
    id: 'soc-twt',
    name: 'Social Sentinel (X/Twitter)',
    type: StreamType.SOCIAL,
    status: 'active',
    endpoint: 'api/social/stream',
    location: { lat: 34.0522, lng: -118.2437 }, // City center
    lastUpdate: '2s ago'
  },
  {
    id: 'sen-noise',
    name: 'Acoustic Array - Downtown',
    type: StreamType.SENSOR,
    status: 'active',
    endpoint: 'api/sensors/noise',
    location: { lat: 34.0540, lng: -118.2460 },
    lastUpdate: '100ms ago'
  }
];

// Initial Incidents
export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-001',
    title: 'Traffic Stoppage - Main St',
    timestamp: new Date().toISOString(),
    location: { lat: 34.0522, lng: -118.2437, address: 'Main St & 5th Ave' },
    severity: IncidentSeverity.HIGH,
    status: 'action_required',
    summary: 'Detected stationary vehicles for >120s with associated pedestrian gathering.',
    streamsInvolved: ['cam-101', 'soc-twt', 'sen-noise'],
    hypothesis: {
      id: 'hyp-001',
      incidentId: 'inc-001',
      signalsUsed: ['Video: Stationary objects', 'Social: "Crash" keyword spike', 'Audio: Decibel spike (Skid/Impact)'],
      reasoningSteps: [
        '1. Video analysis detects flow rate drop to 0.',
        '2. Audio sensor registered 95dB spike 2 mins ago.',
        '3. Social stream cluster indicates "accident" and "stuck".',
        '4. Conclusion: Non-routine congestion due to collision.'
      ],
      recommendedAction: 'Dispatch Traffic Control Units + Reroute Advisory',
      confidenceScore: 0.92
    }
  },
  {
    id: 'inc-002',
    title: 'Crowd Density Warning',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    location: { lat: 34.0560, lng: -118.2500, address: 'City Plaza' },
    severity: IncidentSeverity.MEDIUM,
    status: 'analyzing',
    summary: 'Unusual gathering detected outside event hours.',
    streamsInvolved: ['cam-204'],
    hypothesis: undefined // Pending analysis
  }
];