import { Incident, Stream } from "../types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export const generateIncidentAnalysis = async (
  incident: Incident,
  streams: Stream[]
): Promise<string> => {
  try {
    console.log("🔄 Starting analysis request...");
    console.log("   Incident:", incident.title);
    console.log("   Incident ID:", incident.id);
    console.log("   Streams count:", streams.length);

    // ✅ SEND incident AND streams data to backend
    const body = {
      incident: incident,
      streams: streams
    };

    console.log("📨 Sending to backend...");
    const response = await fetch(`${BACKEND_URL}/incidents/${incident.id}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)  // ✅ NOW WE SEND ACTUAL DATA
    });

    console.log("   Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("   Backend error:", errorText);
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Analysis received from backend");
    console.log("   Response keys:", Object.keys(data));
    
    return JSON.stringify(data);
  } catch (error) {
    console.error("❌ Analysis Request Failed:", error);
    
    // Return fallback response
    return JSON.stringify({
      reasoning_steps: [
        "Backend connection failed.",
        "Check server logs.",
        "Falling back to default analysis."
      ],
      hypothesis_text: "System unreachable.",
      recommended_action: "Manual Override",
      confidence_score: 0.0
    });
  }
};

// import { Incident, Stream } from "../types";

// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

// export const generateIncidentAnalysis = async (
//   incident: Incident,
//   streams: Stream[]
// ): Promise<string> => {
//   try {
//     // We send the request to the backend to perform the reasoning securely.
//     const response = await fetch(`${BACKEND_URL}/incidents/${incident.id}/analyze`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       // We don't strictly need to send streams if the backend looks them up, 
//       // but strictly following the previous signature, we trigger the endpoint.
//     body: JSON.stringify({ incident, streams })
//     });

//     if (!response.ok) {
//       throw new Error(`Backend error: ${response.statusText}`);
//     }

//     const data = await response.json();
//     return JSON.stringify(data);
//   } catch (error) {
//     console.error("Analysis Request Failed:", error);
//     return JSON.stringify({
//       reasoning_steps: ["Backend connection failed.", "Check server logs."],
//       hypothesis_text: "System unreachable.",
//       recommended_action: "Manual Override",
//       confidence_score: 0.0
//     });
//   }
// };

