export enum StreamType {
  VIDEO = 'VIDEO',
  SOCIAL = 'SOCIAL',
  SENSOR = 'SENSOR'
}

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface Stream {
  id: string;
  name: string;
  type: StreamType;
  status: 'active' | 'inactive' | 'error';
  endpoint: string; // URL or Mock ID
  location: GeoLocation;
  lastUpdate: string;
}

export interface Hypothesis {
  id: string;
  incidentId: string;
  signalsUsed: string[]; // IDs of streams/signals
  reasoningSteps: string[];
  recommendedAction: string;
  confidenceScore: number; // 0-1
}

export interface Incident {
  id: string;
  title: string;
  timestamp: string;
  location: GeoLocation;
  severity: IncidentSeverity;
  status: 'detecting' | 'analyzing' | 'action_required' | 'resolved';
  summary: string;
  streamsInvolved: string[]; // Stream IDs
  hypothesis?: Hypothesis;
}

export interface SensorDataPoint {
  time: string;
  value: number;
  metric: string;
}