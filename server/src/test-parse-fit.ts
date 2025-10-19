import { parseFitFile, isFitFile } from './parse-fit';
import * as path from 'path';

async function testFitParser() {
  const fitFilePath = path.join(__dirname, '../../test-data/sample_fit_file_10182025.fit');
  
  console.log('Testing FIT file parser...');
  console.log(`File path: ${fitFilePath}`);
  
  // Check if file exists and is valid
  if (!isFitFile(fitFilePath)) {
    console.error('❌ File is not a valid FIT file or does not exist');
    return;
  }
  
  console.log('✅ File appears to be a valid FIT file');
  
  try {
    // Parse the FIT file and get power analysis
    const powerAnalysis = await parseFitFile(fitFilePath);
    
    if (powerAnalysis.averagePower > 0) {
      console.log(`✅ Success! Average power: ${powerAnalysis.averagePower} watts`);
      if (powerAnalysis.thresholdPower) {
        console.log(`Threshold power: ${powerAnalysis.thresholdPower} watts`);
      }
      if (powerAnalysis.leftRightBalance) {
        console.log(`Power balance - Left: ${powerAnalysis.leftRightBalance.left}%, Right: ${powerAnalysis.leftRightBalance.right}%`);
      } else {
        console.log('Power balance data not available');
      }
      if (powerAnalysis.torqueEffectiveness) {
        console.log(`Torque effectiveness - Left: ${powerAnalysis.torqueEffectiveness.left}%, Right: ${powerAnalysis.torqueEffectiveness.right}%`);
      }
      if (powerAnalysis.pedalSmoothness) {
        console.log(`Pedal smoothness - Left: ${powerAnalysis.pedalSmoothness.left}%, Right: ${powerAnalysis.pedalSmoothness.right}%`);
      }
      if (powerAnalysis.powerZoneBalances.length > 0) {
        console.log(`Power zone balances available for ${powerAnalysis.powerZoneBalances.length} zones`);
      }
    } else {
      console.log('⚠️  No power data found in the FIT file');
    }
  } catch (error) {
    console.error('❌ Error parsing FIT file:', error);
  }
}

// Run the test
testFitParser();