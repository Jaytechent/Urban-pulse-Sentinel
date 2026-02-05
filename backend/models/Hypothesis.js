import mongoose from 'mongoose';

const hypothesisSchema = new mongoose.Schema({
  incidentId: { type: String, required: true },
  signalsUsed: [{ type: String }],
  reasoningSteps: [{ type: String }],
  recommendedAction: { type: String },
  confidenceScore: { type: Number, min: 0, max: 1 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Hypothesis', hypothesisSchema);