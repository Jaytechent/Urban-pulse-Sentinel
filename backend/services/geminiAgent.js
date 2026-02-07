import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini Client with server-side API KEY
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.warn("⚠️  Warning: API_KEY not set in .env - Gemini analysis will use fallback responses");
}

const client = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const MODEL_NAME = "gemini-pro"; // Valid model name

export const analyzeIncidentContext = async (incident, streams) => {
  if (!client) {
    console.warn("⚠️  Using fallback response (API key not configured)");
    return generateFallbackResponse(incident, streams);
  }

  try {
    // Filter streams involved in the incident
    const involvedStreams = streams.filter(s => 
      incident.streamsInvolved && incident.streamsInvolved.includes(s.id)
    );
    
    // Construct Context
    const streamContext = involvedStreams.map(s => 
      `- [${s.type}] ${s.name} (Location: ${s.location?.lat || 'N/A'}, ${s.location?.lng || 'N/A'})`
    ).join('\n');

    const prompt = `
You are the Urban Pulse Sentinel AI (Backend Core).

TASK: Perform multimodal reasoning on the following urban incident.

INCIDENT DETAILS:
Title: ${incident.title}
Severity: ${incident.severity || 'Unknown'}
Summary: ${incident.summary}
Timestamp: ${incident.timestamp}
Location: ${incident.location?.coordinates ? `Lat ${incident.location.coordinates[1]}, Lng ${incident.location.coordinates[0]}` : 'Unknown'}

ACTIVE DATA STREAMS:
${streamContext || "No specific streams linked."}

INSTRUCTIONS:
1. Analyze the correlation between the incident report and stream types.
2. Generate a step-by-step reasoning chain explaining the anomaly.
3. Determine the best specific intervention.
4. Assign a confidence score (0.0 - 1.0).

RESPONSE FORMAT (JSON ONLY - NO MARKDOWN):
{
  "reasoning_steps": ["step 1...", "step 2...", "step 3..."],
  "hypothesis_text": "Concise explanation of the event.",
  "recommended_action": "Clear, actionable command.",
  "confidence_score": 0.85
}
    `;

    console.log("📨 Sending request to Gemini API...");
    
    const model = client.getGenerativeModel({ model: MODEL_NAME });
    
    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = response.response.text();
    
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    console.log("✅ Gemini response received");
    
    return parseGeminiResponse(text);

  } catch (error) {
    console.error("❌ Gemini Agent Error:", error.message);
    // Fallback response structure
    return generateFallbackResponse(incident, streams);
  }
};

/**
 * Parse JSON from Gemini response
 * Handles cases where Gemini wraps JSON in markdown code blocks
 */
function parseGeminiResponse(text) {
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch (e) {
    // Try extracting JSON from markdown code blocks
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || 
                      text.match(/```\n?([\s\S]*?)\n?```/) ||
                      text.match(/(\{[\s\S]*\})/);
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (parseError) {
        console.error("Failed to parse extracted JSON:", parseError);
      }
    }
    
    // If all parsing fails, throw error
    throw new Error(`Could not parse Gemini response: ${text.substring(0, 100)}`);
  }
}

/**
 * Generate fallback response when API is unavailable
 */
function generateFallbackResponse(incident, streams) {
  const streamTypes = streams && streams.length > 0 
    ? streams.map(s => s.type).join(", ")
    : "unknown sources";

  return {
    reasoning_steps: [
      `Analyzed incident: "${incident.title}"`,
      `Data sources involved: ${streamTypes}`,
      `Severity level: ${incident.severity || 'moderate'}`,
      `Generating recommendation based on available data...`
    ],
    hypothesis_text: `${incident.summary || incident.title} - Analysis indicates potential urban anomaly requiring attention.`,
    recommended_action: `Monitor situation. Prepare response team. Escalate if severity increases.`,
    confidence_score: 0.65
  };
}