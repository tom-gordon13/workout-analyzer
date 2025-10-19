import * as fs from 'fs';
const FitParser = require('fit-file-parser').default;
import * as path from 'path';

async function debugFitFile() {
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

      console.log('=== FIT FILE STRUCTURE DEBUG ===\n');

      // Debug sessions
      if (data.sessions && data.sessions.length > 0) {
        console.log('📊 SESSION DATA:');
        console.log('Available session fields:', Object.keys(data.sessions[0]));
        
        const session = data.sessions[0];
        
        // Look for power balance related fields
        const powerFields = Object.keys(session).filter(key => 
          key.toLowerCase().includes('power') || 
          key.toLowerCase().includes('balance') ||
          key.toLowerCase().includes('left') ||
          key.toLowerCase().includes('right')
        );
        
        console.log('Power/balance related session fields:', powerFields);
        powerFields.forEach(field => {
          console.log(`  ${field}: ${session[field]}`);
        });
        console.log('');
      }

      // Debug records - sample first few records
      if (data.records && data.records.length > 0) {
        console.log('📋 RECORD DATA:');
        console.log(`Total records: ${data.records.length}`);
        console.log('Available fields in first record:', Object.keys(data.records[0]));
        
        // Look for power balance in records
        const sampleRecords = data.records.slice(0, 5);
        console.log('\nSample records (first 5):');
        
        sampleRecords.forEach((record: any, index: number) => {
          console.log(`Record ${index + 1}:`);
          
          const powerFields = Object.keys(record).filter(key => 
            key.toLowerCase().includes('power') || 
            key.toLowerCase().includes('balance') ||
            key.toLowerCase().includes('left') ||
            key.toLowerCase().includes('right')
          );
          
          powerFields.forEach(field => {
            console.log(`  ${field}: ${record[field]}`);
          });
          console.log('');
        });

        // Check if any records have balance data
        const recordsWithBalance = data.records.filter((record: any) => {
          return Object.keys(record).some(key => 
            key.toLowerCase().includes('balance') ||
            (key.toLowerCase().includes('left') && key.toLowerCase().includes('power')) ||
            (key.toLowerCase().includes('right') && key.toLowerCase().includes('power'))
          );
        });
        
        console.log(`Records with potential balance data: ${recordsWithBalance.length}`);
        if (recordsWithBalance.length > 0) {
          console.log('Example record with balance data:');
          const balanceFields = Object.keys(recordsWithBalance[0]).filter(key => 
            key.toLowerCase().includes('balance') ||
            key.toLowerCase().includes('left') ||
            key.toLowerCase().includes('right')
          );
          balanceFields.forEach(field => {
            console.log(`  ${field}: ${recordsWithBalance[0][field]}`);
          });
        }
      }

      // Debug other potential data structures
      console.log('\n🔍 OTHER DATA STRUCTURES:');
      const topLevelKeys = Object.keys(data);
      console.log('Top level keys in data:', topLevelKeys);
      
      topLevelKeys.forEach((key: string) => {
        if (key !== 'records' && key !== 'sessions') {
          console.log(`${key}:`, Array.isArray(data[key]) ? `Array(${data[key].length})` : typeof data[key]);
          if (Array.isArray(data[key]) && data[key].length > 0) {
            console.log(`  Sample ${key} keys:`, Object.keys(data[key][0] || {}));
          }
        }
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugFitFile();