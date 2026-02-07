const DEFAULT_REDDIT_USER_AGENT = 'urban-pulse-sentinel/1.0 (render free tier demo)';

const safeJsonFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Connector error for ${url}:`, error.message);
    return null;
  }
};

export const fetchRedditSignals = async () => {
  const subreddits = (process.env.REDDIT_SUBREDDITS || 'losangeles,traffic').split(',').map((s) => s.trim());
  const userAgent = process.env.REDDIT_USER_AGENT || DEFAULT_REDDIT_USER_AGENT;
  const posts = [];

  for (const subreddit of subreddits) {
    if (!subreddit) continue;
    const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=25`;
    const data = await safeJsonFetch(url, { headers: { 'User-Agent': userAgent } });
    if (!data?.data?.children) continue;
    data.data.children.forEach((child) => {
      const post = child.data;
      posts.push({
        id: post.id,
        text: `${post.title} ${post.selftext || ''}`.trim(),
        createdUtc: post.created_utc,
        source: `reddit/${subreddit}`
      });
    });
  }

  return { posts };
};

export const fetchWeatherSignals = async () => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const city = process.env.WEATHER_CITY || 'Los Angeles';

  if (!apiKey) {
    return {
      weather: {
        condition: 'clear',
        temperature: 22,
        windSpeed: 3,
        precipitation: 0
      }
    };
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
  const data = await safeJsonFetch(url);
  if (!data) return null;

  return {
    weather: {
      condition: data.weather?.[0]?.main?.toLowerCase() || 'unknown',
      temperature: data.main?.temp,
      windSpeed: data.wind?.speed,
      precipitation: data.rain?.['1h'] || 0
    }
  };
};

export const fetchTrafficSignals = async () => {
  const trafficApiUrl = process.env.TRAFFIC_API_URL;
  if (trafficApiUrl) {
    const data = await safeJsonFetch(trafficApiUrl);
    if (data) return data;
  }

  const baseSpeed = Math.max(5, Math.round(10 + Math.random() * 20));
  return { speed: baseSpeed };
};

export const simulateVideoPayload = ({ trafficSpeed }) => {
  const congestionIndex = Math.min(1, Math.max(0, 1 - trafficSpeed / 40));
  const stoppedVehicles = congestionIndex > 0.6 ? Math.round(congestionIndex * 12) : Math.round(congestionIndex * 6);
  const pedestrianClusters = congestionIndex > 0.5 ? Math.round(congestionIndex * 5) : Math.round(congestionIndex * 2);

  return {
    metadata: { congestionIndex },
    detections: { stoppedVehicles, pedestrianClusters }
  };
};

export const simulateSensorPayload = ({ trafficSpeed, weather }) => {
  const noiseBaseline = weather?.precipitation > 0 ? 70 : 60;
  const noiseSpike = Math.max(0, (30 - trafficSpeed) * 1.2);
  const avgNoise = Math.min(100, noiseBaseline + noiseSpike + Math.random() * 5);

  return {
    metrics: [
      { metric: 'noise', value: Number(avgNoise.toFixed(1)), timestamp: new Date().toISOString() },
      { metric: 'traffic_speed', value: trafficSpeed, timestamp: new Date().toISOString() }
    ]
  };
};
