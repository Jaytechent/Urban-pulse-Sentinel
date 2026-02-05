import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client with server-side API KEY
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const MODEL_NAME = "gemini-3-flash-preview";

export const analyzeIncidentContext = async (incident, streams) => {
  if (!ai) {
    throw new Error("Server missing API_KEY configuration");
  }

  // Filter streams involved in the incident
  const involvedStreams = streams.filter(s => incident.streamsInvolved.includes(s.id));
  
  // Construct Context
  const streamContext = involvedStreams.map(s => 
    `- [${s.type}] ${s.name} (Location: ${s.location.lat}, ${s.location.lng})`
  ).join('\n');

  const prompt = `
    You are the Urban Pulse Sentinel AI (Backend Core).
    
    TASK: Perform multimodal reasoning on the following urban incident.
    
    INCIDENT DETAILS:
    Title: ${incident.title}
    Severity: ${incident.severity}
    Summary: ${incident.summary}
    Timestamp: ${incident.timestamp}
    
    ACTIVE DATA STREAMS:
    ${streamContext || "No specific streams linked."}
    
    INSTRUCTIONS:
    1. Analyze the correlation between the incident report and stream types.
    2. Generate a step-by-step reasoning chain explaining the anomaly.
    3. Determine the best specific intervention.
    4. Assign a confidence score (0.0 - 1.0).
    
    RESPONSE FORMAT (JSON ONLY):
    {
      "reasoning_steps": ["step 1...", "step 2..."],
      "hypothesis_text": "Concise explanation of the event.",
      "recommended_action": "Clear, actionable command.",
      "confidence_score": 0.95
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Agent Error:", error);
    // Fallback response structure
    return {
      reasoning_steps: ["Error contacting reasoning engine", "Please verify backend logs"],
      hypothesis_text: "Automated analysis failed.",
      recommended_action: "Manual Assessment Required",
      confidence_score: 0.0
    };
  }
};