export const processSensorWindow = ({ metrics = [] } = {}) => {
  const noiseValues = metrics.filter((m) => m.metric === 'noise').map((m) => m.value);
  const trafficValues = metrics.filter((m) => m.metric === 'traffic_speed').map((m) => m.value);
  const avgNoise = noiseValues.length ? noiseValues.reduce((a, b) => a + b, 0) / noiseValues.length : 0;
  const avgTraffic = trafficValues.length ? trafficValues.reduce((a, b) => a + b, 0) / trafficValues.length : 0;

  const anomalyDetected = avgNoise > 75 || (avgTraffic > 0 && avgTraffic < 12);

  return {
    anomalyDetected,
    severity: avgNoise > 90 || avgTraffic < 8 ? 'HIGH' : 'MEDIUM',
    summary: anomalyDetected
      ? 'Sensor window shows elevated noise levels and suppressed traffic speeds.'
      : 'Sensor telemetry remains within expected bounds.',
    signals: {
      avgNoise,
      avgTraffic,
    },
  };
};
