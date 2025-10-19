import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { parseFitFile, isFitFile, parseFitBuffer } from './parse-fit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Workout Viewer API Server' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Parse FIT file by server-side file path (existing)
app.post('/api/parse-fit', async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    if (!isFitFile(filePath)) {
      return res.status(400).json({ error: 'Invalid FIT file or file does not exist' });
    }
    
    const powerAnalysis = await parseFitFile(filePath);
    
    res.json({
      success: true,
      averagePower: powerAnalysis.averagePower,
      thresholdPower: powerAnalysis.thresholdPower,
      leftRightBalance: powerAnalysis.leftRightBalance,
      torqueEffectiveness: powerAnalysis.torqueEffectiveness,
      pedalSmoothness: powerAnalysis.pedalSmoothness,
      powerZoneBalances: powerAnalysis.powerZoneBalances,
      message: powerAnalysis.averagePower > 0 ? 'Power data found' : 'No power data in file'
    });
  } catch (error) {
    console.error('Error parsing FIT file:', error);
    res.status(500).json({ 
      error: 'Failed to parse FIT file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// New: Parse FIT file from raw binary upload
app.post(
  '/activity/parse',
  express.raw({ type: ['application/octet-stream', 'application/fit', 'application/vnd.ant.fit'], limit: '25mb' }),
  async (req, res) => {
    try {
      const body = req.body as Buffer;
      if (!body || !Buffer.isBuffer(body) || body.length < 100) {
        return res.status(400).json({ error: 'FIT file binary required in request body' });
      }

      const analysis = await parseFitBuffer(body);
      res.json({
        success: true,
        averagePower: analysis.averagePower,
        thresholdPower: analysis.thresholdPower,
        leftRightBalance: analysis.leftRightBalance,
        torqueEffectiveness: analysis.torqueEffectiveness,
        pedalSmoothness: analysis.pedalSmoothness,
        powerZoneBalances: analysis.powerZoneBalances,
      });
    } catch (error) {
      console.error('Error parsing uploaded FIT file:', error);
      res.status(500).json({ 
        error: 'Failed to parse uploaded FIT file',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
