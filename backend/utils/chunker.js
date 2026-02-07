export const chunkByWindow = (items, windowMs, getTime = (item) => item.timestamp) => {
  if (!Array.isArray(items)) return [];
  const sorted = [...items].sort((a, b) => new Date(getTime(a)) - new Date(getTime(b)));
  const chunks = [];
  let current = [];

  for (const item of sorted) {
    if (current.length === 0) {
      current.push(item);
      continue;
    }

    const firstTime = new Date(getTime(current[0])).getTime();
    const currentTime = new Date(getTime(item)).getTime();
    if (currentTime - firstTime <= windowMs) {
      current.push(item);
    } else {
      chunks.push(current);
      current = [item];
    }
  }

  if (current.length) chunks.push(current);
  return chunks;
};

export const summarizeWindow = (items, mapper = (item) => item) => {
  if (!Array.isArray(items) || items.length === 0) return [];
  return items.map(mapper);
};
