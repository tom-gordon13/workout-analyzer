import * as fs from 'fs';
const FitParser = require('fit-file-parser').default;

interface PowerRecord {
  power?: number;
  timestamp?: Date;
  left_right_balance?: {
    value: number;
    right: boolean;
  };
  left_pedal_smoothness?: number;
  right_pedal_smoothness?: number;
  left_torque_effectiveness?: number;
  right_torque_effectiveness?: number;
  left_power_phase?: number[];
  right_power_phase?: number[];
}

interface FitFileData {
  records: PowerRecord[];
  sessions: Array<{
    avg_power?: number;
    total_elapsed_time?: number;
    threshold_power?: number;
    left_right_balance?: {
      value: number;
      right: boolean;
    };
  }>;
}

interface PowerZoneBalance {
  zone: string;
  description: string;
  powerRange: string;
  sampleCount: number;
  leftRightBalance: {
    left: number;
    right: number;
  } | null;
  pedalSmoothness: {
    left: number;
    right: number;
  } | null;
  torqueEffectiveness: {
    left: number;
    right: number;
  } | null;
}

interface PowerAnalysis {
  averagePower: number;
  thresholdPower: number | null;
  leftRightBalance: {
    left: number;
    right: number;
  } | null;
  pedalSmoothness: {
    left: number;
    right: number;
  } | null;
  torqueEffectiveness: {
    left: number;
    right: number;
  } | null;
  powerZoneBalances: PowerZoneBalance[];
}

/**
 * Determines which power zone a given power value belongs to
 * @param power - Power value in watts
 * @param thresholdPower - FTP/threshold power in watts
 * @returns Object with zone info
 */
function getPowerZone(power: number, thresholdPower: number) {
  const percentage = (power / thresholdPower) * 100;
  
  if (percentage < 55) {
    return {
      zone: 'Z1',
      description: 'Active Recovery',
      range: '< 55%',
      minPower: 0,
      maxPower: Math.round(thresholdPower * 0.55)
    };
  } else if (percentage < 75) {
    return {
      zone: 'Z2',
      description: 'Endurance',
      range: '55-75%',
      minPower: Math.round(thresholdPower * 0.55),
      maxPower: Math.round(thresholdPower * 0.75)
    };
  } else if (percentage < 90) {
    return {
      zone: 'Z3',
      description: 'Tempo',
      range: '75-90%',
      minPower: Math.round(thresholdPower * 0.75),
      maxPower: Math.round(thresholdPower * 0.90)
    };
  } else if (percentage < 105) {
    return {
      zone: 'Z4',
      description: 'Lactate Threshold',
      range: '90-105%',
      minPower: Math.round(thresholdPower * 0.90),
      maxPower: Math.round(thresholdPower * 1.05)
    };
  } else if (percentage < 120) {
    return {
      zone: 'Z5',
      description: 'VO2 Max',
      range: '105-120%',
      minPower: Math.round(thresholdPower * 1.05),
      maxPower: Math.round(thresholdPower * 1.20)
    };
  } else {
    return {
      zone: 'Z6',
      description: 'Anaerobic/Neuromuscular',
      range: '> 120%',
      minPower: Math.round(thresholdPower * 1.20),
      maxPower: 9999
    };
  }
}

/**
 * Core FIT parsing given a Buffer
 */
async function parseFitData(fitFile: Buffer): Promise<PowerAnalysis> {
  // Create parser instance
  const fitParser = new FitParser({
    force: true,
    speedUnit: 'km/h',
    lengthUnit: 'm',
    temperatureUnit: 'celcius',
    elapsedRecordField: true,
    mode: 'list',
  });

  return new Promise((resolve, reject) => {
    fitParser.parse(fitFile, (error: Error, data: FitFileData) => {
      if (error) {
        console.error('Error parsing FIT file:', error);
        reject(error);
        return;
      }

      try {
        let averagePower = 0;
        let thresholdPower: number | null = null;
        let leftRightBalance: { left: number; right: number } | null = null;
        let pedalSmoothness: { left: number; right: number } | null = null;
        let torqueEffectiveness: { left: number; right: number } | null = null;
        let powerZoneBalances: PowerZoneBalance[] = [];

        // Method 1: Try to get data from session summary
        if (data.sessions && data.sessions.length > 0) {
          const session = data.sessions[0];
          if (session.avg_power && session.avg_power > 0) {
            averagePower = Math.round(session.avg_power);
            
            // Extract threshold power if available
            if (session.threshold_power && session.threshold_power > 0) {
              thresholdPower = session.threshold_power;
            }
            
            // Extract left/right balance from session if available
            if (session.left_right_balance) {
              const balanceObj = session.left_right_balance;
              if (balanceObj.right) {
                // Value represents right leg percentage
                leftRightBalance = {
                  right: Math.round(balanceObj.value),
                  left: Math.round(100 - balanceObj.value)
                };
              } else {
                // Value represents left leg percentage
                leftRightBalance = {
                  left: Math.round(balanceObj.value),
                  right: Math.round(100 - balanceObj.value)
                };
              }
            }
          }
        }

        // Method 2: Calculate from individual records if session data not available
        if (averagePower === 0 && data.records && data.records.length > 0) {
          const powerRecords = data.records.filter(
            (record: PowerRecord) => record.power && record.power > 0
          );

          if (powerRecords.length > 0) {
            // Calculate average power
            const totalPower = powerRecords.reduce(
              (sum: number, record: PowerRecord) => sum + (record.power || 0),
              0
            );
            averagePower = Math.round(totalPower / powerRecords.length);

            // Calculate average left/right balance from records
            const balanceRecords = powerRecords.filter(
              (record: PowerRecord) => record.left_right_balance !== undefined
            );
            
            if (balanceRecords.length > 0) {
              let leftTotal = 0;
              let rightTotal = 0;
              let leftCount = 0;
              let rightCount = 0;
              
              balanceRecords.forEach((record: PowerRecord) => {
                if (record.left_right_balance) {
                  const balanceObj = record.left_right_balance;
                  if (balanceObj.right) {
                    // Value represents right leg percentage
                    rightTotal += balanceObj.value;
                    leftTotal += (100 - balanceObj.value);
                  } else {
                    // Value represents left leg percentage
                    leftTotal += balanceObj.value;
                    rightTotal += (100 - balanceObj.value);
                  }
                  leftCount++;
                  rightCount++;
                }
              });
              
              if (leftCount > 0 && rightCount > 0) {
                leftRightBalance = {
                  left: Math.round(leftTotal / leftCount),
                  right: Math.round(rightTotal / rightCount)
                };
              }
            }
          }
        }

        // Calculate overall torque effectiveness and pedal smoothness from records
        if (data.records && data.records.length > 0) {
          const recordsWithTorqueSmooth = data.records.filter((record: any) => 
            record.left_torque_effectiveness !== undefined || 
            record.right_torque_effectiveness !== undefined ||
            record.left_pedal_smoothness !== undefined ||
            record.right_pedal_smoothness !== undefined
          );
          
          if (recordsWithTorqueSmooth.length > 0) {
            let leftTorqueTotal = 0, rightTorqueTotal = 0, torqueCount = 0;
            let leftSmoothTotal = 0, rightSmoothTotal = 0, smoothCount = 0;
            
            recordsWithTorqueSmooth.forEach((record: any) => {
              if (record.left_torque_effectiveness !== undefined && 
                  record.right_torque_effectiveness !== undefined &&
                  record.left_torque_effectiveness > 0 && record.right_torque_effectiveness > 0) {
                leftTorqueTotal += record.left_torque_effectiveness;
                rightTorqueTotal += record.right_torque_effectiveness;
                torqueCount++;
              }
              
              if (record.left_pedal_smoothness !== undefined && 
                  record.right_pedal_smoothness !== undefined &&
                  record.left_pedal_smoothness > 0 && record.right_pedal_smoothness > 0) {
                leftSmoothTotal += record.left_pedal_smoothness;
                rightSmoothTotal += record.right_pedal_smoothness;
                smoothCount++;
              }
            });
            
            if (torqueCount > 0) {
              torqueEffectiveness = {
                left: Math.round(leftTorqueTotal / torqueCount),
                right: Math.round(rightTorqueTotal / torqueCount)
              };
            }
            
            if (smoothCount > 0) {
              pedalSmoothness = {
                left: Math.round(leftSmoothTotal / smoothCount),
                right: Math.round(rightSmoothTotal / smoothCount)
              };
            }
          }
        }

        // Calculate power zone balances if threshold power is available
        if (thresholdPower && thresholdPower > 0 && data.records && data.records.length > 0) {
          const zoneData = new Map<string, {
            leftTotal: number;
            rightTotal: number;
            count: number;
            description: string;
            powerRange: string;
            leftTorqueTotal: number;
            rightTorqueTotal: number;
            torqueCount: number;
            leftSmoothTotal: number;
            rightSmoothTotal: number;
            smoothCount: number;
          }>();
          
          // Process records to calculate zone balances
          data.records.forEach((record: any) => {
            if (record.power && record.power > 0 && record.left_right_balance) {
              const zone = getPowerZone(record.power, thresholdPower);
              const balance = record.left_right_balance;
              const leftPct = balance.right ? (100 - balance.value) : balance.value;
              const rightPct = balance.right ? balance.value : (100 - balance.value);
              
              if (!zoneData.has(zone.zone)) {
                zoneData.set(zone.zone, {
                  leftTotal: 0,
                  rightTotal: 0,
                  count: 0,
                  description: zone.description,
                  powerRange: `${zone.minPower}-${zone.maxPower === 9999 ? zone.maxPower + '+' : zone.maxPower}W`,
                  leftTorqueTotal: 0,
                  rightTorqueTotal: 0,
                  torqueCount: 0,
                  leftSmoothTotal: 0,
                  rightSmoothTotal: 0,
                  smoothCount: 0
                });
              }
              
              const zoneInfo = zoneData.get(zone.zone)!;
              zoneInfo.leftTotal += leftPct;
              zoneInfo.rightTotal += rightPct;
              zoneInfo.count += 1;
              
              // Add torque effectiveness data if available
              if (record.left_torque_effectiveness !== undefined && 
                  record.right_torque_effectiveness !== undefined &&
                  record.left_torque_effectiveness > 0 && record.right_torque_effectiveness > 0) {
                zoneInfo.leftTorqueTotal += record.left_torque_effectiveness;
                zoneInfo.rightTorqueTotal += record.right_torque_effectiveness;
                zoneInfo.torqueCount += 1;
              }
              
              // Add pedal smoothness data if available
              if (record.left_pedal_smoothness !== undefined && 
                  record.right_pedal_smoothness !== undefined &&
                  record.left_pedal_smoothness > 0 && record.right_pedal_smoothness > 0) {
                zoneInfo.leftSmoothTotal += record.left_pedal_smoothness;
                zoneInfo.rightSmoothTotal += record.right_pedal_smoothness;
                zoneInfo.smoothCount += 1;
              }
            }
          });
          
          // Convert to PowerZoneBalance array
          powerZoneBalances = Array.from(zoneData.entries())
            .filter(([_, data]) => data.count > 0)
            .map(([zoneName, data]) => ({
              zone: zoneName,
              description: data.description,
              powerRange: data.powerRange,
              sampleCount: data.count,
              leftRightBalance: {
                left: Math.round(data.leftTotal / data.count),
                right: Math.round(data.rightTotal / data.count)
              },
              torqueEffectiveness: data.torqueCount > 0 ? {
                left: Math.round(data.leftTorqueTotal / data.torqueCount),
                right: Math.round(data.rightTorqueTotal / data.torqueCount)
              } : null,
              pedalSmoothness: data.smoothCount > 0 ? {
                left: Math.round(data.leftSmoothTotal / data.smoothCount),
                right: Math.round(data.rightSmoothTotal / data.smoothCount)
              } : null
            }))
            .sort((a, b) => a.zone.localeCompare(b.zone));
        }

        resolve({
          averagePower,
          thresholdPower,
          leftRightBalance,
          pedalSmoothness,
          torqueEffectiveness,
          powerZoneBalances
        });
      } catch (processingError) {
        console.error('Error processing FIT data:', processingError);
        reject(processingError);
      }
    });
  });
}

/**
 * Parses a FIT file and returns power analysis including average power and left/right balance
 * @param filePath - Path to the .fit file
 * @returns Promise<PowerAnalysis> - Power analysis data
 */
export async function parseFitFile(filePath: string): Promise<PowerAnalysis> {
  try {
    const fitFile = fs.readFileSync(filePath);
    return parseFitData(fitFile);
  } catch (error) {
    console.error('Error reading FIT file:', error);
    throw error;
  }
}

/**
 * Parses a FIT file provided as a Buffer
 */
export async function parseFitBuffer(buffer: Buffer): Promise<PowerAnalysis> {
  return parseFitData(buffer);
}

/**
 * Helper function to get just the average power (for backward compatibility)
 * @param filePath - Path to the .fit file
 * @returns Promise<number> - Average power in watts
 */
export async function getAveragePower(filePath: string): Promise<number> {
  const analysis = await parseFitFile(filePath);
  return analysis.averagePower;
}

/**
 * Helper function to validate if a file is a FIT file
 * @param filePath - Path to the file
 * @returns boolean - True if file appears to be a FIT file
 */
export function isFitFile(filePath: string): boolean {
  try {
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      return false;
    }

    // Check file extension
    if (!filePath.toLowerCase().endsWith('.fit')) {
      return false;
    }

    // Basic file size check (FIT files are typically > 100 bytes)
    return stats.size > 100;
  } catch {
    return false;
  }
}
