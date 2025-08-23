// Backend API Server
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import experimentApi from './api/experimentApi.js';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test Types endpoints
app.get('/api/test-types', async (req, res) => {
  try {
    const testTypes = await experimentApi.testTypes.getAll();
    res.json(testTypes);
  } catch (error) {
    console.error('Error fetching test types:', error);
    res.status(500).json({ error: 'Failed to fetch test types' });
  }
});

app.get('/api/test-types/:id', async (req, res) => {
  try {
    const testType = await experimentApi.testTypes.getById(req.params.id);
    if (!testType) {
      return res.status(404).json({ error: 'Test type not found' });
    }
    res.json(testType);
  } catch (error) {
    console.error('Error fetching test type:', error);
    res.status(500).json({ error: 'Failed to fetch test type' });
  }
});

app.post('/api/test-types', async (req, res) => {
  try {
    const testType = await experimentApi.testTypes.create(req.body);
    res.status(201).json(testType);
  } catch (error) {
    console.error('Error creating test type:', error);
    res.status(500).json({ error: 'Failed to create test type' });
  }
});

app.put('/api/test-types/:id', async (req, res) => {
  try {
    const testType = await experimentApi.testTypes.update(req.params.id, req.body);
    if (!testType) {
      return res.status(404).json({ error: 'Test type not found' });
    }
    res.json(testType);
  } catch (error) {
    console.error('Error updating test type:', error);
    res.status(500).json({ error: 'Failed to update test type' });
  }
});

app.delete('/api/test-types/:id', async (req, res) => {
  try {
    const testType = await experimentApi.testTypes.delete(req.params.id);
    if (!testType) {
      return res.status(404).json({ error: 'Test type not found' });
    }
    res.json(testType);
  } catch (error) {
    console.error('Error deleting test type:', error);
    res.status(500).json({ error: 'Failed to delete test type' });
  }
});

// Platforms endpoints
app.get('/api/platforms', async (req, res) => {
  try {
    const platforms = await experimentApi.platforms.getAll();
    res.json(platforms);
  } catch (error) {
    console.error('Error fetching platforms:', error);
    res.status(500).json({ error: 'Failed to fetch platforms' });
  }
});

app.get('/api/platforms/:id', async (req, res) => {
  try {
    const platform = await experimentApi.platforms.getById(req.params.id);
    if (!platform) {
      return res.status(404).json({ error: 'Platform not found' });
    }
    res.json(platform);
  } catch (error) {
    console.error('Error fetching platform:', error);
    res.status(500).json({ error: 'Failed to fetch platform' });
  }
});

app.post('/api/platforms', async (req, res) => {
  try {
    const platform = await experimentApi.platforms.create(req.body);
    res.status(201).json(platform);
  } catch (error) {
    console.error('Error creating platform:', error);
    res.status(500).json({ error: 'Failed to create platform' });
  }
});

app.put('/api/platforms/:id', async (req, res) => {
  try {
    const platform = await experimentApi.platforms.update(req.params.id, req.body);
    if (!platform) {
      return res.status(404).json({ error: 'Platform not found' });
    }
    res.json(platform);
  } catch (error) {
    console.error('Error updating platform:', error);
    res.status(500).json({ error: 'Failed to update platform' });
  }
});

app.delete('/api/platforms/:id', async (req, res) => {
  try {
    const platform = await experimentApi.platforms.delete(req.params.id);
    if (!platform) {
      return res.status(404).json({ error: 'Platform not found' });
    }
    res.json(platform);
  } catch (error) {
    console.error('Error deleting platform:', error);
    res.status(500).json({ error: 'Failed to delete platform' });
  }
});

// Experiments endpoints
app.get('/api/experiments', async (req, res) => {
  try {
    const experiments = await experimentApi.experiments.getAll(req.query);
    res.json(experiments);
  } catch (error) {
    console.error('Error fetching experiments:', error);
    res.status(500).json({ error: 'Failed to fetch experiments' });
  }
});

app.get('/api/experiments/:id', async (req, res) => {
  try {
    const experiment = await experimentApi.experiments.getById(req.params.id);
    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    res.json(experiment);
  } catch (error) {
    console.error('Error fetching experiment:', error);
    res.status(500).json({ error: 'Failed to fetch experiment' });
  }
});

app.post('/api/experiments', async (req, res) => {
  try {
    const experiment = await experimentApi.experiments.create(req.body);
    res.status(201).json(experiment);
  } catch (error) {
    console.error('Error creating experiment:', error);
    res.status(500).json({ error: 'Failed to create experiment' });
  }
});

app.put('/api/experiments/:id', async (req, res) => {
  try {
    const experiment = await experimentApi.experiments.update(req.params.id, req.body);
    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    res.json(experiment);
  } catch (error) {
    console.error('Error updating experiment:', error);
    res.status(500).json({ error: 'Failed to update experiment' });
  }
});

app.delete('/api/experiments/:id', async (req, res) => {
  try {
    const experiment = await experimentApi.experiments.delete(req.params.id);
    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    res.json(experiment);
  } catch (error) {
    console.error('Error deleting experiment:', error);
    res.status(500).json({ error: 'Failed to delete experiment' });
  }
});

// Creative Scores endpoints
app.get('/api/creative-scores', async (req, res) => {
  try {
    const scores = await experimentApi.creativeScores.getAll(req.query);
    res.json(scores);
  } catch (error) {
    console.error('Error fetching creative scores:', error);
    res.status(500).json({ error: 'Failed to fetch creative scores' });
  }
});

app.post('/api/creative-scores', async (req, res) => {
  try {
    const score = await experimentApi.creativeScores.saveScore(req.body);
    res.status(201).json(score);
  } catch (error) {
    console.error('Error saving creative score:', error);
    res.status(500).json({ error: 'Failed to save creative score' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});