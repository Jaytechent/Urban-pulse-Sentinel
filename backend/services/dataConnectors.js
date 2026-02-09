const DEFAULT_REDDIT_USER_AGENT = 'urban-pulse-sentinel/1.0 (render free tier demo)';

const safeJsonFetch = async (url, options = {}) => {
  try {
    console.log(`   🔗 Fetching: ${url.split('?')[0]}...`);
    const response = await fetch(url, { ...options, timeout: 10000 });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    return null;
  }
};

// ✅ REAL REDDIT API - No key needed, just proper User-Agent
export const fetchRedditSignals = async () => {
  console.log('📱 Fetching social signals from Reddit...');
  
  const subreddits = (process.env.REDDIT_SUBREDDITS || 'losangeles,traffic')
    .split(',')
    .map((s) => s.trim());
  
  const userAgent = process.env.REDDIT_USER_AGENT || DEFAULT_REDDIT_USER_AGENT;
  const posts = [];

  for (const subreddit of subreddits) {
    if (!subreddit) continue;
    
    const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=25`;
    console.log(`   📖 Subreddit: r/${subreddit}`);
    
    const data = await safeJsonFetch(url, { 
      headers: { 
        'User-Agent': userAgent,
        'Accept': 'application/json'
      } 
    });
    
    if (!data?.data?.children) {
      console.log(`   ⚠️  No posts found in r/${subreddit}`);
      continue;
    }

    const subredditPosts = data.data.children.map((child) => {
      const post = child.data;
      return {
        id: post.id,
        title: post.title,
        text: `${post.title} ${post.selftext || ''}`.trim(),
        upvotes: post.ups,
        createdUtc: post.created_utc,
        source: `reddit/${subreddit}`
      };
    });

    posts.push(...subredditPosts);
    console.log(`   ✅ Got ${subredditPosts.length} posts from r/${subreddit}`);
  }

  console.log(`✅ Total social signals: ${posts.length}`);
  return { posts };
};

// ✅ REAL OPENWEATHER API
export const fetchWeatherSignals = async () => {
  console.log('🌤️  Fetching weather signals...');
  
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const city = process.env.WEATHER_CITY || 'Los Angeles';

  if (!apiKey) {
    console.log('   ⚠️  No OPENWEATHER_API_KEY configured');
    return null;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
  const data = await safeJsonFetch(url);
  
  if (!data) {
    return null;
  }

  const weather = {
    condition: data.weather?.[0]?.main?.toLowerCase() || 'unknown',
    temperature: data.main?.temp,
    windSpeed: data.wind?.speed,
    precipitation: data.rain?.['1h'] || 0,
    humidity: data.main?.humidity
  };

  console.log(`✅ Weather: ${weather.condition}, ${weather.temperature}°C`);
  return { weather };
};

// ✅ OPTIONAL TRAFFIC API (if configured)
export const fetchTrafficSignals = async () => {
  console.log('🚗 Fetching traffic signals...');
  
  const trafficApiUrl = process.env.TRAFFIC_API_URL;
  
  if (!trafficApiUrl) {
    console.log('   ℹ️  No TRAFFIC_API_URL configured, using simulated data');
    return simulateTrafficData();
  }

  const data = await safeJsonFetch(trafficApiUrl);
  
  if (data) {
    console.log('✅ Got real traffic data');
    return data;
  }

  console.log('   ⚠️  Traffic API failed, using simulated data');
  return simulateTrafficData();
};

// Simulate traffic if no API configured
const simulateTrafficData = () => {
  const baseSpeed = Math.random() > 0.7 
    ? Math.max(5, Math.round(5 + Math.random() * 10))  // Slow: 5-15 mph
    : Math.max(20, Math.round(20 + Math.random() * 15)); // Normal: 20-35 mph
  
  console.log(`✅ Simulated traffic speed: ${baseSpeed} mph`);
  return { speed: baseSpeed };
};

// ✅ VIDEO PAYLOAD - Simulated (No API for video)
export const simulateVideoPayload = ({ trafficSpeed = 25 } = {}) => {
  console.log(`🎥 Generating video analysis (speed: ${trafficSpeed} mph)...`);
  
  // Higher congestion when traffic is slow
  const congestionIndex = Math.min(1, Math.max(0, 1 - trafficSpeed / 40));
  const stoppedVehicles = congestionIndex > 0.6 
    ? Math.round(congestionIndex * 12) 
    : Math.round(congestionIndex * 6);
  const pedestrianClusters = congestionIndex > 0.5 
    ? Math.round(congestionIndex * 5) 
    : Math.round(congestionIndex * 2);

  return {
    metadata: { congestionIndex },
    detections: { stoppedVehicles, pedestrianClusters }
  };
};

// ✅ SENSOR PAYLOAD - Simulated (No API for sensors)
export const simulateSensorPayload = ({ trafficSpeed = 25, weather = {} } = {}) => {
  console.log(`🔊 Generating acoustic sensor data (speed: ${trafficSpeed} mph)...`);
  
  const noiseBaseline = weather?.precipitation > 0 ? 70 : 60;
  const noiseSpike = Math.max(0, (30 - trafficSpeed) * 1.2);
  const avgNoise = Math.min(100, noiseBaseline + noiseSpike + Math.random() * 5);

  return {
    metrics: [
      { 
        metric: 'noise', 
        value: Number(avgNoise.toFixed(1)), 
        timestamp: new Date().toISOString() 
      },
      { 
        metric: 'traffic_speed', 
        value: trafficSpeed, 
        timestamp: new Date().toISOString() 
      }
    ]
  };
};

export default {
  fetchRedditSignals,
  fetchWeatherSignals,
  fetchTrafficSignals,
  simulateVideoPayload,
  simulateSensorPayload
};