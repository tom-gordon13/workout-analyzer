import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { parseFitFile, isFitFile } from './parse-fit';

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

// Parse FIT file endpoint
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});