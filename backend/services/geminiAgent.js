import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from "@google/genai";

// Initialize Gemini 3 Client with API KEY
const apiKey = process.env.GOOGLE_API_KEY;

console.log("🔍 DEBUG: GOOGLE_API_KEY =", apiKey ? "✅ SET" : "❌ NOT SET");

if (!apiKey) {
  console.warn("⚠️  Warning: GOOGLE_API_KEY not set in .env - Gemini analysis will use fallback responses");
}

let ai = null;
try {
  ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
  console.log("🔍 DEBUG: GoogleGenAI instance created:", ai ? "✅ YES" : "❌ NO");
} catch (error) {
  console.error("🔍 DEBUG: Error creating GoogleGenAI:", error.message);
}

const MODEL_NAME = "gemini-3-flash-preview";

export const analyzeIncidentContext = async (incident, streams) => {
  console.log("\n" + "=".repeat(60));
  console.log("🔄 analyzeIncidentContext CALLED");
  console.log("   Incident:", incident.title);
  console.log("   Streams count:", streams.length);
  console.log("   AI client ready:", ai ? "✅ YES" : "❌ NO");
  console.log("=".repeat(60));
  
  if (!ai) {
    console.warn("⚠️  No AI client, using fallback response");
    return generateFallbackResponse(incident, streams);
  }

  try {
    // Filter streams involved in the incident
    const involvedStreams = streams.filter(s => 
      incident.streamsInvolved && incident.streamsInvolved.includes(s.id)
    );
    
    console.log("   Involved streams:", involvedStreams.length);
    
    // Construct Context
    const streamContext = involvedStreams.map(s => 
      `- [${s.type}] ${s.name} (Location: ${s.location?.lat || 'N/A'}, ${s.location?.lng || 'N/A'})`
    ).join('\n');

    const prompt = `You are the Urban Pulse Sentinel AI.

INCIDENT: ${incident.title}
SEVERITY: ${incident.severity}
SUMMARY: ${incident.summary}

STREAMS: ${streamContext || "None"}

Respond ONLY with JSON (no markdown):
{
  "reasoning_steps": ["step 1", "step 2", "step 3"],
  "hypothesis_text": "Brief explanation",
  "recommended_action": "Specific action",
  "confidence_score": 0.85
}`;

    console.log("📨 Calling Gemini 3 API...");
    console.log("   Model:", MODEL_NAME);
    console.log("   Prompt chars:", prompt.length);
    
    const startTime = Date.now();

    // ✅ Call Gemini 3 with timeout
    console.log("⏳ Sending request... (timeout: 30s)");
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Gemini API timeout (30s)")), 30000)
    );

    const responsePromise = ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt
    });

    const response = await Promise.race([responsePromise, timeoutPromise]);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Response received in ${duration}s`);

    // ✅ Get text from response
    const text = response.text;
    
    console.log("   Text length:", text ? text.length : "NULL");
    console.log("   Text preview:", text ? text.substring(0, 150) : "EMPTY");
    
    if (!text || text.trim() === "") {
      console.warn("⚠️  Empty response, using fallback");
      return generateFallbackResponse(incident, streams);
    }

    console.log("📝 Parsing JSON...");
    const parsed = parseGeminiResponse(text);
    console.log("✅ Success! Returning parsed response");
    console.log("=".repeat(60) + "\n");
    
    return parsed;

  } catch (error) {
    console.error("❌ ERROR:", error.message);
    console.error("   Type:", error.constructor.name);
    if (error.stack) {
      console.error("   Stack:", error.stack.split('\n')[0]);
    }
    console.log("⚠️  Falling back to fallback response...");
    console.log("=".repeat(60) + "\n");
    
    return generateFallbackResponse(incident, streams);
  }
};

function parseGeminiResponse(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    // Try extracting JSON from markdown
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || 
                      text.match(/```\n?([\s\S]*?)\n?```/) ||
                      text.match(/(\{[\s\S]*\})/);
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (parseError) {
        console.error("   Parse error:", parseError.message);
      }
    }
    
    // Return as-is if can't parse
    console.warn("   Could not parse JSON, returning fallback");
    throw new Error(`JSON parse failed: ${text.substring(0, 100)}`);
  }
}

function generateFallbackResponse(incident, streams) {
  const streamTypes = streams && streams.length > 0 
    ? streams.map(s => s.type).join(", ")
    : "unknown sources";

  return {
    reasoning_steps: [
      `Analyzed incident: "${incident.title}"`,
      `Data sources involved: ${streamTypes}`,
      `Severity level: ${incident.severity || 'moderate'}`,
      `Generated recommendation based on available data`
    ],
    hypothesis_text: `${incident.summary || incident.title} - Analysis indicates potential urban anomaly requiring attention.`,
    recommended_action: `Monitor situation. Prepare response team. Escalate if severity increases.`,
    confidence_score: 0.65
  };
}

// import dotenv from 'dotenv';
// dotenv.config();

// import { GoogleGenAI } from "@google/genai";

// // Initialize Gemini 3 Client with API KEY
// const apiKey = process.env.GOOGLE_API_KEY;

// if (!apiKey) {
//   console.warn("⚠️  Warning: GOOGLE_API_KEY not set in .env - Gemini analysis will use fallback responses");
// }

// const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
// const MODEL_NAME = "gemini-3-flash-preview";

// export const analyzeIncidentContext = async (incident, streams) => {
//   if (!ai) {
//     console.warn("⚠️  Using fallback response (API key not configured)");
//     return generateFallbackResponse(incident, streams);
//   }

//   try {
//     // Filter streams involved in the incident
//     const involvedStreams = streams.filter(s => 
//       incident.streamsInvolved && incident.streamsInvolved.includes(s.id)
//     );
    
//     // Construct Context
//     const streamContext = involvedStreams.map(s => 
//       `- [${s.type}] ${s.name} (Location: ${s.location?.lat || 'N/A'}, ${s.location?.lng || 'N/A'})`
//     ).join('\n');

//     const prompt = `You are the Urban Pulse Sentinel AI (Backend Core).

// TASK: Perform multimodal reasoning on the following urban incident.

// INCIDENT DETAILS:
// Title: ${incident.title}
// Severity: ${incident.severity || 'Unknown'}
// Summary: ${incident.summary}
// Timestamp: ${incident.timestamp}
// Location: ${incident.location?.coordinates ? `Lat ${incident.location.coordinates[1]}, Lng ${incident.location.coordinates[0]}` : 'Unknown'}

// ACTIVE DATA STREAMS:
// ${streamContext || "No specific streams linked."}

// INSTRUCTIONS:
// 1. Analyze the correlation between the incident report and stream types.
// 2. Generate a step-by-step reasoning chain explaining the anomaly.
// 3. Determine the best specific intervention.
// 4. Assign a confidence score (0.0 - 1.0).

// RESPONSE FORMAT (JSON ONLY - NO MARKDOWN):
// {
//   "reasoning_steps": ["step 1...", "step 2...", "step 3..."],
//   "hypothesis_text": "Concise explanation of the event.",
//   "recommended_action": "Clear, actionable command.",
//   "confidence_score": 0.85
// }`;

//     console.log("📨 Sending request to Gemini 3 API...");
    
//     // ✅ CORRECT SYNTAX for Gemini 3
//     const response = await ai.models.generateContent({
//       model: MODEL_NAME,
//       contents: prompt
//     });

//     // ✅ Get text from response
//     const text = response.text;
    
//     if (!text) {
//       throw new Error("Empty response from Gemini");
//     }

//     console.log("✅ Gemini response received");
    
//     return parseGeminiResponse(text);

//   } catch (error) {
//     console.error("❌ Gemini Agent Error:", error.message);
//     console.log("⚠️  Falling back to default response...");
//     // Fallback response structure
//     return generateFallbackResponse(incident, streams);
//   }
// };

// /**
//  * Parse JSON from Gemini response
//  * Handles cases where Gemini wraps JSON in markdown code blocks
//  */
// function parseGeminiResponse(text) {
//   try {
//     // Try direct parse first
//     return JSON.parse(text);
//   } catch (e) {
//     // Try extracting JSON from markdown code blocks
//     const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || 
//                       text.match(/```\n?([\s\S]*?)\n?```/) ||
//                       text.match(/(\{[\s\S]*\})/);
    
//     if (jsonMatch && jsonMatch[1]) {
//       try {
//         return JSON.parse(jsonMatch[1]);
//       } catch (parseError) {
//         console.error("Failed to parse extracted JSON:", parseError);
//       }
//     }
    
//     // If all parsing fails, throw error
//     throw new Error(`Could not parse Gemini response: ${text.substring(0, 100)}`);
//   }
// }

// /**
//  * Generate fallback response when API is unavailable
//  */
// function generateFallbackResponse(incident, streams) {
//   const streamTypes = streams && streams.length > 0 
//     ? streams.map(s => s.type).join(", ")
//     : "unknown sources";

//   return {
//     reasoning_steps: [
//       `Analyzed incident: "${incident.title}"`,
//       `Data sources involved: ${streamTypes}`,
//       `Severity level: ${incident.severity || 'moderate'}`,
//       `Generated recommendation based on available data`
//     ],
//     hypothesis_text: `${incident.summary || incident.title} - Analysis indicates potential urban anomaly requiring attention.`,
//     recommended_action: `Monitor situation. Prepare response team. Escalate if severity increases.`,
//     confidence_score: 0.65
//   };
// }