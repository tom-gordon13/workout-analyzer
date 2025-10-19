import { parseFitFile, isFitFile } from './parse-fit';
import * as path from 'path';

async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Error: Please provide a file path');
    console.log('Usage: npm run parse-fit <file-path>');
    console.log('Example: npm run parse-fit ../test-data/sample_fit_file_10182025.fit');
    process.exit(1);
  }

  const inputFilePath = args[0];
  
  // Resolve the file path (handle relative paths)
  const resolvedPath = path.resolve(inputFilePath);
  
  console.log('🔍 Parsing FIT file...');
  console.log(`📁 File path: ${resolvedPath}`);
  
  // Check if file exists and is valid
  if (!isFitFile(resolvedPath)) {
    console.error('❌ File is not a valid FIT file or does not exist');
    console.log('   • Make sure the file exists');
    console.log('   • Check that it has a .fit extension');
    console.log('   • Verify the file is not corrupted');
    process.exit(1);
  }
  
  console.log('✅ File appears to be a valid FIT file');
  
  try {
    // Parse the FIT file and get power analysis
    const powerAnalysis = await parseFitFile(resolvedPath);
    
    console.log('\n📊 Results:');
    console.log('═══════════');
    
    if (powerAnalysis.averagePower > 0) {
      console.log(`🚴 Average Power: ${powerAnalysis.averagePower} watts`);
      
      if (powerAnalysis.thresholdPower) {
        console.log(`🎯 Threshold Power: ${powerAnalysis.thresholdPower} watts`);
      }
      
      if (powerAnalysis.leftRightBalance) {
        console.log(`⚖️  Overall Power Balance:`);
        console.log(`   Left:  ${powerAnalysis.leftRightBalance.left}%`);
        console.log(`   Right: ${powerAnalysis.leftRightBalance.right}%`);
      } else {
        console.log(`⚖️  Power Balance: Not available`);
      }
      
      if (powerAnalysis.torqueEffectiveness) {
        console.log(`🔧 Overall Torque Effectiveness:`);
        console.log(`   Left:  ${powerAnalysis.torqueEffectiveness.left}%`);
        console.log(`   Right: ${powerAnalysis.torqueEffectiveness.right}%`);
      } else {
        console.log(`🔧 Torque Effectiveness: Not available`);
      }
      
      if (powerAnalysis.pedalSmoothness) {
        console.log(`⚪ Overall Pedal Smoothness:`);
        console.log(`   Left:  ${powerAnalysis.pedalSmoothness.left}%`);
        console.log(`   Right: ${powerAnalysis.pedalSmoothness.right}%`);
      } else {
        console.log(`⚪ Pedal Smoothness: Not available`);
      }
      
      // Display power zone balances
      if (powerAnalysis.powerZoneBalances.length > 0) {
        console.log(`\n📊 Power Zone Balance Analysis:`);
        console.log('═══════════════════════════════════');
        
        powerAnalysis.powerZoneBalances.forEach(zone => {
          console.log(`\n${zone.zone} - ${zone.description} (${zone.powerRange})`);
          if (zone.leftRightBalance) {
            console.log(`   ⚖️  Balance:     L: ${zone.leftRightBalance.left}%  R: ${zone.leftRightBalance.right}%`);
          }
          if (zone.torqueEffectiveness) {
            console.log(`   🔧 Torque:      L: ${zone.torqueEffectiveness.left}%  R: ${zone.torqueEffectiveness.right}%`);
          }
          if (zone.pedalSmoothness) {
            console.log(`   ⚪ Smoothness:  L: ${zone.pedalSmoothness.left}%  R: ${zone.pedalSmoothness.right}%`);
          }
          console.log(`   📊 Samples: ${zone.sampleCount}`);
        });
      } else if (powerAnalysis.thresholdPower) {
        console.log(`\n⚠️  No power zone balance data available (no samples with balance data)`);
      } else {
        console.log(`\n⚠️  No threshold power available - cannot calculate power zones`);
      }
      
      console.log('\n✅ Parsing successful!');
    } else {
      console.log('⚠️  No power data found in the FIT file');
      console.log('   This file may not contain power meter data');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error parsing FIT file:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error('   Unknown error occurred');
    }
    process.exit(1);
  }
}

// Run the CLI
main();