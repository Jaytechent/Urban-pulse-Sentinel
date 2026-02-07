export const processVideoChunk = ({ metadata = {}, detections = {} } = {}) => {
  const stoppedVehicles = detections.stoppedVehicles ?? 0;
  const pedestrianClusters = detections.pedestrianClusters ?? 0;
  const congestionIndex = metadata.congestionIndex ?? 0;

  const anomalyDetected = stoppedVehicles > 5 || pedestrianClusters > 3 || congestionIndex > 0.75;

  return {
    anomalyDetected,
    severity: congestionIndex > 0.9 || stoppedVehicles > 10 ? 'HIGH' : 'MEDIUM',
    summary: anomalyDetected
      ? 'Video analysis detected prolonged vehicle stoppage and unusual pedestrian clustering.'
      : 'Video analysis indicates normal flow.',
    signals: {
      stoppedVehicles,
      pedestrianClusters,
      congestionIndex,
    },
  };
};
