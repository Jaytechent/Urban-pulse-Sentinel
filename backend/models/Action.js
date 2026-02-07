import mongoose from 'mongoose';

const actionSchema = new mongoose.Schema({
  incidentId: { type: String, required: true },
  recommendedAction: { type: String, required: true },
  status: {
    type: String,
    enum: ['recommended', 'authorized', 'executed', 'dismissed'],
    default: 'recommended'
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  executedAt: { type: Date }
});

actionSchema.pre('save', function updateTimestamp(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Action', actionSchema);
