import express from 'express';
import Incident from '../models/Incident.js';
import Hypothesis from '../models/Hypothesis.js';
import Stream from '../models/Stream.js';
import { analyzeIncidentContext } from '../services/geminiAgent.js';

const router = express.Router();

// GET /api/incidents - Get all active incidents
router.get('/', async (req, res) => {
  try {
    const incidents = await Incident.find().populate('hypothesis');
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/incidents/:id/analyze - Trigger Gemini Analysis
router.post('/:id/analyze', async (req, res) => {
  try {
    const incident = await Incident.findOne({ id: req.params.id });
    if (!incident) return res.status(404).json({ message: 'Incident not found' });

    // Check if hypothesis exists and is fresh (simple check for now)
    // if (incident.hypothesis) ... logic to skip if fresh

    const streams = await Stream.find({ id: { $in: incident.streamsInvolved } });
    
    // Call Gemini Agent
    const analysis = await analyzeIncidentContext(incident, streams);

    // Save Hypothesis
    const hypothesis = new Hypothesis({
      incidentId: incident.id,
      signalsUsed: incident.streamsInvolved,
      reasoningSteps: analysis.reasoning_steps,
      recommendedAction: analysis.recommended_action,
      confidenceScore: analysis.confidence_score,
    });
    
    const savedHypothesis = await hypothesis.save();
    
    // Update Incident with Hypothesis reference and potentially update summary
    incident.hypothesis = savedHypothesis._id;
    incident.summary = analysis.hypothesis_text; // Update summary with AI insight
    if (analysis.confidence_score > 0.8) incident.status = 'action_required';
    await incident.save();

    // Return the formatted analysis to frontend
    if (req.app?.locals?.broadcast) {
      req.app.locals.broadcast('incident.updated', incident);
    }
    res.json(analysis);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
