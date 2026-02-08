import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from "@google/genai";

console.log('\n🧪 Testing Gemini 3 API Connection...\n');

// ✅ Use GOOGLE_API_KEY from .env
const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error('❌ ERROR: GOOGLE_API_KEY not found in .env');
  console.error('   Make sure your .env file has: GOOGLE_API_KEY=AIzaSy...');
  process.exit(1);
}

console.log('✅ GOOGLE_API_KEY found');

try {
  // ✅ Initialize Gemini 3 with API key
  const ai = new GoogleGenAI({
    apiKey: apiKey
  });
  
  console.log('✅ Gemini 3 client initialized');

  console.log('\n📨 Sending test request to Gemini 3...');
  console.log('⏳ This may take 5-15 seconds...\n');

  const startTime = Date.now();

  // ✅ CORRECT SYNTAX for Gemini 3
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Respond with ONLY this JSON, no markdown: {\"test\": \"success\", \"message\": \"Gemini 3 is working\"}"
  });

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // ✅ Get text from response
  const text = response.text;

  if (!text) {
    throw new Error("Got empty response from Gemini 3");
  }

  console.log(`✅ Response received in ${duration}s:`);
  console.log(`   ${text}\n`);

  console.log('🎉 SUCCESS! Gemini 3 API is working correctly!\n');

} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  console.error('\nPossible causes:');
  console.error('1. Invalid API key - check your .env file');
  console.error('2. API key has no quota - go to https://console.cloud.google.com/');
  console.error('3. Network issue - check internet connection');
  console.error('4. gemini-3-flash-preview model not available yet');
  console.error('5. Rate limited - wait a few minutes and try again\n');
  process.exit(1);
}