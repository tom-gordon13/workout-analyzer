import * as fs from 'fs';
const FitParser = require('fit-file-parser').default;
import * as path from 'path';

async function debugPowerZones() {
  const fitFilePath = path.join(__dirname, '../../test-data/sample_fit_file_10182025.fit');
  
  try {
    const fitFile = fs.readFileSync(fitFilePath);
    const fitParser = new FitParser({
      force: true,
      speedUnit: 'km/h',
      lengthUnit: 'm',
      temperatureUnit: 'celcius',
      elapsedRecordField: true,
      mode: 'list',
    });

    fitParser.parse(fitFile, (error: any, data: any) => {
      if (error) {
        console.error('Error:', error);
        return;
      }

      console.log('=== POWER ZONES DEBUG ===\n');

      // Check power zone definitions
      if (data.power_zone) {
        console.log('🏋️ POWER ZONE DEFINITIONS:');
        console.log('Power zone data:', JSON.stringify(data.power_zone, null, 2));
        console.log('');
      }

      // Check session power zone data
      if (data.sessions && data.sessions.length > 0) {
        const session = data.sessions[0];
        console.log('📊 SESSION POWER ZONE DATA:');
        
        const zoneFields = Object.keys(session).filter(key => 
          key.toLowerCase().includes('zone') || key.toLowerCase().includes('power')
        );
        
        console.log('Zone-related session fields:', zoneFields);
        zoneFields.forEach(field => {
          console.log(`  ${field}:`, session[field]);
        });
        console.log('');
      }

      // Sample records to see power values and zones
      if (data.records && data.records.length > 0) {
        console.log('📋 POWER DATA IN RECORDS:');
        console.log(`Total records: ${data.records.length}`);
        
        // Get power range
        const powerValues = data.records
          .filter((record: any) => record.power && record.power > 0)
          .map((record: any) => record.power);
          
        if (powerValues.length > 0) {
          console.log(`Power range: ${Math.min(...powerValues)} - ${Math.max(...powerValues)} watts`);
          console.log(`Average power: ${Math.round(powerValues.reduce((a: number, b: number) => a + b, 0) / powerValues.length)} watts`);
        }
        
        // Check if records have zone information
        const recordsWithZones = data.records.filter((record: any) => 
          Object.keys(record).some(key => key.toLowerCase().includes('zone'))
        );
        console.log(`Records with zone data: ${recordsWithZones.length}`);
        
        if (recordsWithZones.length > 0) {
          console.log('Sample record with zone data:');
          const zoneFields = Object.keys(recordsWithZones[0]).filter(key => 
            key.toLowerCase().includes('zone')
          );
          zoneFields.forEach(field => {
            console.log(`  ${field}:`, recordsWithZones[0][field]);
          });
        }
        
        // Show power distribution sample
        console.log('\nSample power values with balance data:');
        const samplesWithBalance = data.records
          .filter((record: any) => record.power && record.left_right_balance)
          .slice(0, 10);
          
        samplesWithBalance.forEach((record: any, index: number) => {
          const balance = record.left_right_balance;
          const leftPct = balance.right ? (100 - balance.value) : balance.value;
          const rightPct = balance.right ? balance.value : (100 - balance.value);
          console.log(`  ${index + 1}: ${record.power}W -> L:${leftPct}% R:${rightPct}%`);
        });
      }

      // Check for threshold power
      if (data.sessions && data.sessions[0].threshold_power) {
        console.log(`\n🎯 THRESHOLD POWER: ${data.sessions[0].threshold_power}W`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugPowerZones();