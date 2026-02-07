import { Incident, Stream } from "../types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export const generateIncidentAnalysis = async (
  incident: Incident,
  streams: Stream[]
): Promise<string> => {
  try {
    // We send the request to the backend to perform the reasoning securely.
    const response = await fetch(`${BACKEND_URL}/incidents/${incident.id}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // We don't strictly need to send streams if the backend looks them up, 
      // but strictly following the previous signature, we trigger the endpoint.
      body: JSON.stringify({}) 
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.stringify(data);
  } catch (error) {
    console.error("Analysis Request Failed:", error);
    return JSON.stringify({
      reasoning_steps: ["Backend connection failed.", "Check server logs."],
      hypothesis_text: "System unreachable.",
      recommended_action: "Manual Override",
      confidence_score: 0.0
    });
  }
};
