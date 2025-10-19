import * as fs from 'fs';
const FitParser = require('fit-file-parser').default;
import * as path from 'path';

async function debugTorqueSmoothness() {
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

      console.log('=== TORQUE EFFECTIVENESS & PEDAL SMOOTHNESS DEBUG ===\n');

      // Check session data for torque/smoothness
      if (data.sessions && data.sessions.length > 0) {
        const session = data.sessions[0];
        console.log('📊 SESSION TORQUE/SMOOTHNESS DATA:');
        
        const torqueSmoothFields = Object.keys(session).filter(key => 
          key.toLowerCase().includes('torque') || 
          key.toLowerCase().includes('smoothness') ||
          key.toLowerCase().includes('effectiveness')
        );
        
        console.log('Torque/smoothness related session fields:', torqueSmoothFields);
        torqueSmoothFields.forEach(field => {
          console.log(`  ${field}:`, session[field]);
        });
        console.log('');
      }

      // Sample records to see torque/smoothness data
      if (data.records && data.records.length > 0) {
        console.log('📋 RECORD TORQUE/SMOOTHNESS DATA:');
        console.log(`Total records: ${data.records.length}`);
        
        // Find records with torque/smoothness data
        const recordsWithTorqueSmooth = data.records.filter((record: any) => 
          Object.keys(record).some(key => 
            key.toLowerCase().includes('torque') || 
            key.toLowerCase().includes('smoothness') ||
            key.toLowerCase().includes('effectiveness')
          )
        );
        
        console.log(`Records with torque/smoothness data: ${recordsWithTorqueSmooth.length}`);
        
        if (recordsWithTorqueSmooth.length > 0) {
          console.log('Available torque/smoothness fields in records:');
          const firstRecord = recordsWithTorqueSmooth[0];
          const torqueSmoothFields = Object.keys(firstRecord).filter(key => 
            key.toLowerCase().includes('torque') || 
            key.toLowerCase().includes('smoothness') ||
            key.toLowerCase().includes('effectiveness')
          );
          console.log('Fields:', torqueSmoothFields);
          
          console.log('\nSample data (first 10 records with torque/smoothness):');
          recordsWithTorqueSmooth.slice(0, 10).forEach((record: any, index: number) => {
            console.log(`Record ${index + 1} (${record.power || 'N/A'}W):`);
            torqueSmoothFields.forEach(field => {
              console.log(`  ${field}: ${record[field]}`);
            });
            console.log('');
          });
          
          // Calculate ranges
          console.log('Data ranges:');
          torqueSmoothFields.forEach(field => {
            const values = recordsWithTorqueSmooth
              .map((record: any) => record[field])
              .filter((val: any) => val !== undefined && val !== null && val > 0);
            
            if (values.length > 0) {
              const min = Math.min(...values);
              const max = Math.max(...values);
              const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length;
              console.log(`  ${field}: ${min.toFixed(1)}-${max.toFixed(1)} (avg: ${avg.toFixed(1)})`);
            }
          });
        }
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugTorqueSmoothness();