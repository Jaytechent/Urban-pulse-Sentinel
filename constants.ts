import { CountryOption, Incident, IncidentSeverity, Landmark, Stream, StreamType } from './types';

export const APP_NAME = "URBAN PULSE SENTINEL";
export const GEMINI_MODEL = "gemini-3-flash-preview";

export const COUNTRY_CITY_OPTIONS: CountryOption[] = [
  {
    code: 'USA',
    name: 'United States',
    center: { lat: 39.8283, lng: -98.5795 },
    cities: [
      { id: 'los-angeles', name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
      { id: 'new-york', name: 'New York City', lat: 40.7128, lng: -74.0060 },
      { id: 'chicago', name: 'Chicago', lat: 41.8781, lng: -87.6298 },
      { id: 'houston', name: 'Houston', lat: 29.7604, lng: -95.3698 },
      { id: 'seattle', name: 'Seattle', lat: 47.6062, lng: -122.3321 }
    ]
  },
  {
    code: 'CAN',
    name: 'Canada',
    center: { lat: 56.1304, lng: -106.3468 },
    cities: [
      { id: 'toronto', name: 'Toronto', lat: 43.6532, lng: -79.3832 },
      { id: 'vancouver', name: 'Vancouver', lat: 49.2827, lng: -123.1207 }
    ]
  },
  {
    code: 'GBR',
    name: 'United Kingdom',
    center: { lat: 55.3781, lng: -3.4360 },
    cities: [
      { id: 'london', name: 'London', lat: 51.5072, lng: -0.1276 },
      { id: 'manchester', name: 'Manchester', lat: 53.4808, lng: -2.2426 }
    ]
  },
  {
    code: 'FRA',
    name: 'France',
    center: { lat: 46.2276, lng: 2.2137 },
    cities: [
      { id: 'paris', name: 'Paris', lat: 48.8566, lng: 2.3522 },
      { id: 'lyon', name: 'Lyon', lat: 45.7640, lng: 4.8357 }
    ]
  },
  {
    code: 'DEU',
    name: 'Germany',
    center: { lat: 51.1657, lng: 10.4515 },
    cities: [
      { id: 'berlin', name: 'Berlin', lat: 52.5200, lng: 13.4050 },
      { id: 'munich', name: 'Munich', lat: 48.1351, lng: 11.5820 }
    ]
  },
  {
    code: 'ITA',
    name: 'Italy',
    center: { lat: 41.8719, lng: 12.5674 },
    cities: [
      { id: 'rome', name: 'Rome', lat: 41.9028, lng: 12.4964 },
      { id: 'milan', name: 'Milan', lat: 45.4642, lng: 9.1900 }
    ]
  },
  {
    code: 'JPN',
    name: 'Japan',
    center: { lat: 36.2048, lng: 138.2529 },
    cities: [
      { id: 'tokyo', name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
      { id: 'osaka', name: 'Osaka', lat: 34.6937, lng: 135.5023 }
    ]
  }
];

export const LANDMARKS: Landmark[] = [
  {
    id: 'la-hollywood-sign',
    name: 'Hollywood Sign',
    lat: 34.1341,
    lng: -118.3215,
    cityId: 'los-angeles',
    countryCode: 'USA'
  },
  {
    id: 'la-griffith',
    name: 'Griffith Observatory',
    lat: 34.1184,
    lng: -118.3004,
    cityId: 'los-angeles',
    countryCode: 'USA'
  },
  {
    id: 'nyc-times',
    name: 'Times Square',
    lat: 40.7580,
    lng: -73.9855,
    cityId: 'new-york',
    countryCode: 'USA'
  },
  {
    id: 'paris-eiffel',
    name: 'Eiffel Tower',
    lat: 48.8584,
    lng: 2.2945,
    cityId: 'paris',
    countryCode: 'FRA'
  },
  {
    id: 'paris-louvre',
    name: 'Louvre Museum',
    lat: 48.8606,
    lng: 2.3376,
    cityId: 'paris',
    countryCode: 'FRA'
  },
  {
    id: 'london-bridge',
    name: 'Tower Bridge',
    lat: 51.5055,
    lng: -0.0754,
    cityId: 'london',
    countryCode: 'GBR'
  },
  {
    id: 'tokyo-skytree',
    name: 'Tokyo Skytree',
    lat: 35.7101,
    lng: 139.8107,
    cityId: 'tokyo',
    countryCode: 'JPN'
  },
  {
    id: 'berlin-brandenburg',
    name: 'Brandenburg Gate',
    lat: 52.5163,
    lng: 13.3777,
    cityId: 'berlin',
    countryCode: 'DEU'
  }
];

// Mock Streams
export const MOCK_STREAMS: Stream[] = [
  {
    id: 'cam-101',
    name: 'Intersection Main/5th',
    type: StreamType.VIDEO,
    status: 'active',
    endpoint: 'https://picsum.photos/400/300?random=1',
    location: { lat: 34.0522, lng: -118.2437 },
    countryCode: 'USA',
    cityId: 'los-angeles',
    lastUpdate: 'Live'
  },
  {
    id: 'cam-204',
    name: 'Hollywood Blvd / Vine',
    type: StreamType.VIDEO,
    status: 'active',
    endpoint: 'https://picsum.photos/400/300?random=2',
    location: { lat: 34.1019, lng: -118.3257 },
    countryCode: 'USA',
    cityId: 'los-angeles',
    lastUpdate: 'Live'
  },
  {
    id: 'soc-twt',
    name: 'Social Sentinel (LA)',
    type: StreamType.SOCIAL,
    status: 'active',
    endpoint: 'api/social/stream',
    location: { lat: 34.0522, lng: -118.2437 },
    countryCode: 'USA',
    cityId: 'los-angeles',
    lastUpdate: '2s ago'
  },
  {
    id: 'sen-noise',
    name: 'Acoustic Array - Downtown LA',
    type: StreamType.SENSOR,
    status: 'active',
    endpoint: 'api/sensors/noise',
    location: { lat: 34.0540, lng: -118.2460 },
    countryCode: 'USA',
    cityId: 'los-angeles',
    lastUpdate: '100ms ago'
  },
  {
    id: 'cam-305',
    name: 'Canary Wharf Overlook',
    type: StreamType.VIDEO,
    status: 'active',
    endpoint: 'https://picsum.photos/400/300?random=3',
    location: { lat: 51.5072, lng: -0.1276 },
    countryCode: 'GBR',
    cityId: 'london',
    lastUpdate: 'Live'
  },
  {
    id: 'cam-nyc',
    name: 'Broadway & 7th',
    type: StreamType.VIDEO,
    status: 'active',
    endpoint: 'https://picsum.photos/400/300?random=4',
    location: { lat: 40.7128, lng: -74.0060 },
    countryCode: 'USA',
    cityId: 'new-york',
    lastUpdate: 'Live'
  },
  {
    id: 'soc-tor',
    name: 'Social Sentinel (Toronto)',
    type: StreamType.SOCIAL,
    status: 'active',
    endpoint: 'api/social/stream/toronto',
    location: { lat: 43.6532, lng: -79.3832 },
    countryCode: 'CAN',
    cityId: 'toronto',
    lastUpdate: '3s ago'
  },
  {
    id: 'sen-tok',
    name: 'Acoustic Array - Shinjuku',
    type: StreamType.SENSOR,
    status: 'active',
    endpoint: 'api/sensors/noise/tokyo',
    location: { lat: 35.6762, lng: 139.6503 },
    countryCode: 'JPN',
    cityId: 'tokyo',
    lastUpdate: '120ms ago'
  },
  {
    id: 'sen-air',
    name: 'Air Quality Node - Berlin',
    type: StreamType.SENSOR,
    status: 'active',
    endpoint: 'api/sensors/air',
    location: { lat: 52.5200, lng: 13.4050 },
    countryCode: 'DEU',
    cityId: 'berlin',
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
    countryCode: 'USA',
    cityId: 'los-angeles',
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
    location: { lat: 48.8566, lng: 2.3522, address: 'Place de la République' },
    severity: IncidentSeverity.MEDIUM,
    status: 'analyzing',
    summary: 'Unusual gathering detected outside event hours.',
    countryCode: 'FRA',
    cityId: 'paris',
    streamsInvolved: ['cam-204'],
    hypothesis: undefined // Pending analysis
  },
  {
    id: 'inc-003',
    title: 'Transit Delay Spike',
    timestamp: new Date(Date.now() - 5400000).toISOString(),
    location: { lat: 43.6532, lng: -79.3832, address: 'Union Station' },
    severity: IncidentSeverity.MEDIUM,
    status: 'detecting',
    summary: 'Delay signals indicate congestion across transit nodes.',
    countryCode: 'CAN',
    cityId: 'toronto',
    streamsInvolved: ['soc-twt'],
    hypothesis: undefined
  },
  {
    id: 'inc-004',
    title: 'Seismic Microburst Alert',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    location: { lat: 35.6762, lng: 139.6503, address: 'Shibuya Crossing' },
    severity: IncidentSeverity.HIGH,
    status: 'action_required',
    summary: 'Sensor anomaly indicates localized tremor with aftershock risk.',
    countryCode: 'JPN',
    cityId: 'tokyo',
    streamsInvolved: ['sen-noise', 'sen-air'],
    hypothesis: undefined
  }
];
