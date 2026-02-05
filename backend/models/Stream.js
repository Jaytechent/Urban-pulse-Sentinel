import mongoose from 'mongoose';

const streamSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['VIDEO', 'SOCIAL', 'SENSOR'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'error'],
    default: 'active' 
  },
  endpoint: { type: String, required: true },
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  lastUpdate: { type: Date, default: Date.now }
});

export default mongoose.model('Stream', streamSchema);