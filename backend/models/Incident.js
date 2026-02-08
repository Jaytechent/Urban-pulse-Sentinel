import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['detecting', 'analyzing', 'action_required', 'resolved'],
    default: 'detecting'
  },
  summary: { type: String },
  countryCode: { type: String },
  cityId: { type: String },
  streamsInvolved: [{ type: String }], // Array of Stream IDs
  hypothesis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hypothesis'
  }
});

export default mongoose.model('Incident', incidentSchema);
