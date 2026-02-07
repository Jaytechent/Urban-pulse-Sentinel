import express from 'express';
import Action from '../models/Action.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const actions = await Action.find().sort({ createdAt: -1 });
    res.json(actions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const { incidentId, recommendedAction, status, notes } = req.body || {};

  if (!incidentId || !recommendedAction) {
    return res.status(400).json({ message: 'incidentId and recommendedAction are required.' });
  }

  try {
    const action = await Action.create({
      incidentId,
      recommendedAction,
      status: status || 'recommended',
      notes
    });

    if (req.app?.locals?.broadcast) {
      req.app.locals.broadcast('action.recommended', action);
    }

    res.status(201).json(action);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/execute', async (req, res) => {
  const { notes } = req.body || {};

  try {
    const action = await Action.findById(req.params.id);
    if (!action) {
      return res.status(404).json({ message: 'Action not found.' });
    }

    action.status = 'executed';
    action.executedAt = new Date();
    if (notes) {
      action.notes = notes;
    }

    await action.save();

    if (req.app?.locals?.broadcast) {
      req.app.locals.broadcast('action.executed', action);
    }

    res.json(action);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/dismiss', async (req, res) => {
  const { notes } = req.body || {};

  try {
    const action = await Action.findById(req.params.id);
    if (!action) {
      return res.status(404).json({ message: 'Action not found.' });
    }

    action.status = 'dismissed';
    if (notes) {
      action.notes = notes;
    }

    await action.save();

    if (req.app?.locals?.broadcast) {
      req.app.locals.broadcast('action.dismissed', action);
    }

    res.json(action);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
