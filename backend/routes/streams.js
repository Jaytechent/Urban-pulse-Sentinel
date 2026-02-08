import express from 'express';
import Stream from '../models/Stream.js';

const router = express.Router();

// GET /api/streams - Get all streams
router.get('/', async (req, res) => {
  try {
    const streams = await Stream.find();
    res.json(streams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/streams - Register a new stream
router.post('/', async (req, res) => {
  const stream = new Stream({
    id: req.body.id,
    name: req.body.name,
    type: req.body.type,
    endpoint: req.body.endpoint,
    location: req.body.location,
    countryCode: req.body.countryCode,
    cityId: req.body.cityId
  });

  try {
    const newStream = await stream.save();
    res.status(201).json(newStream);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
