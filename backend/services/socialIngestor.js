const KEYWORDS = ['accident', 'stuck traffic', 'crowd gathering', 'police presence', 'fire', 'crash', 'pileup'];

export const processSocialWindow = ({ posts = [] } = {}) => {
  const normalized = posts.map((post) => (post.text || '').toLowerCase());
  const hits = normalized.filter((text) => KEYWORDS.some((keyword) => text.includes(keyword)));
  const anomalyDetected = hits.length >= 3;

  return {
    anomalyDetected,
    severity: hits.length >= 6 ? 'HIGH' : 'MEDIUM',
    summary: anomalyDetected
      ? `Social signals show ${hits.length} high-intent mentions of disruption keywords.`
      : 'Social signals remain within baseline chatter.',
    signals: {
      totalPosts: posts.length,
      keywordHits: hits.length,
    },
  };
};
