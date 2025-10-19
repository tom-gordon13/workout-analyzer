import * as fs from 'fs';
const FitParser = require('fit-file-parser').default;
import * as path from 'path';

async function inspectBalance() {
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

      console.log('=== POWER BALANCE INSPECTION ===\n');

      // Inspect session balance
      if (data.sessions && data.sessions.length > 0) {
        const session = data.sessions[0];
        console.log('📊 SESSION BALANCE DATA:');
        console.log('Raw left_right_balance:', session.left_right_balance);
        console.log('Type:', typeof session.left_right_balance);
        console.log('Keys:', Object.keys(session.left_right_balance || {}));
        
        if (session.left_right_balance) {
          console.log('JSON representation:', JSON.stringify(session.left_right_balance, null, 2));
        }
        console.log('');
      }

      // Inspect record balance
      if (data.records && data.records.length > 0) {
        console.log('📋 RECORD BALANCE DATA:');
        
        // Find first record with balance data
        const recordWithBalance = data.records.find((record: any) => record.left_right_balance);
        
        if (recordWithBalance) {
          console.log('First record with balance:');
          console.log('Raw left_right_balance:', recordWithBalance.left_right_balance);
          console.log('Type:', typeof recordWithBalance.left_right_balance);
          console.log('Keys:', Object.keys(recordWithBalance.left_right_balance || {}));
          console.log('JSON representation:', JSON.stringify(recordWithBalance.left_right_balance, null, 2));
          
          // Show a few more examples
          console.log('\nSample of balance values from multiple records:');
          const recordsWithBalance = data.records.filter((record: any) => record.left_right_balance).slice(0, 10);
          recordsWithBalance.forEach((record: any, index: number) => {
            console.log(`Record ${index + 1}:`, JSON.stringify(record.left_right_balance));
          });
        }
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

inspectBalance();