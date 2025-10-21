import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import PowerZoneCharts from './power-zone-charts';

interface PowerZoneBalance {
  zone: string;
  description: string;
  powerRange: string;
  sampleCount: number;
  leftRightBalance: {
    left: number;
    right: number;
  } | null;
  torqueEffectiveness: {
    left: number;
    right: number;
  } | null;
  pedalSmoothness: {
    left: number;
    right: number;
  } | null;
}

interface WorkoutData {
  averagePower: number;
  thresholdPower: number | null;
  leftRightBalance: {
    left: number;
    right: number;
  } | null;
  torqueEffectiveness: {
    left: number;
    right: number;
  } | null;
  pedalSmoothness: {
    left: number;
    right: number;
  } | null;
  powerZoneBalances: PowerZoneBalance[];
}

interface WorkoutAnalysisProps {
  workoutData: WorkoutData;
}

export default function WorkoutAnalysis({ workoutData }: WorkoutAnalysisProps) {
  const [showCharts, setShowCharts] = useState(false);

  const {
    averagePower,
    thresholdPower,
    leftRightBalance,
    torqueEffectiveness,
    pedalSmoothness,
    powerZoneBalances,
  } = workoutData;

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.section}>
        <ThemedText type="title" style={styles.title}>
          Workout Analysis Results
        </ThemedText>
      </ThemedView>

      {/* Overall Metrics */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Overall Performance
        </ThemedText>

        <ThemedView style={styles.metricRow}>
          <ThemedText style={styles.metricLabel}>🚴 Average Power:</ThemedText>
          <ThemedText style={styles.metricValue}>{averagePower}W</ThemedText>
        </ThemedView>

        {thresholdPower && (
          <ThemedView style={styles.metricRow}>
            <ThemedText style={styles.metricLabel}>🎯 Threshold Power:</ThemedText>
            <ThemedText style={styles.metricValue}>{thresholdPower}W</ThemedText>
          </ThemedView>
        )}

        {leftRightBalance && (
          <ThemedView style={styles.metricRow}>
            <ThemedText style={styles.metricLabel}>⚖️ Power Balance:</ThemedText>
            <ThemedText style={styles.metricValue}>
              L: {leftRightBalance.left}% | R: {leftRightBalance.right}%
            </ThemedText>
          </ThemedView>
        )}

        {torqueEffectiveness && (
          <ThemedView style={styles.metricRow}>
            <ThemedText style={styles.metricLabel}>🔧 Torque Effectiveness:</ThemedText>
            <ThemedText style={styles.metricValue}>
              L: {torqueEffectiveness.left}% | R: {torqueEffectiveness.right}%
            </ThemedText>
          </ThemedView>
        )}

        {pedalSmoothness && (
          <ThemedView style={styles.metricRow}>
            <ThemedText style={styles.metricLabel}>⚪ Pedal Smoothness:</ThemedText>
            <ThemedText style={styles.metricValue}>
              L: {pedalSmoothness.left}% | R: {pedalSmoothness.right}%
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* Power Zone Analysis Toggle */}
      {powerZoneBalances.length > 0 && (
        <ThemedView style={styles.section}>
          <ThemedView style={styles.toggleContainer}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Power Zone Analysis
            </ThemedText>

            <ThemedView style={styles.toggleButtons}>
              <TouchableOpacity
                style={[styles.toggleButton, !showCharts && styles.toggleButtonActive]}
                onPress={() => setShowCharts(false)}
              >
                <ThemedText style={[styles.toggleButtonText, !showCharts && styles.toggleButtonTextActive]}>
                  📋 Table View
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleButton, showCharts && styles.toggleButtonActive]}
                onPress={() => setShowCharts(true)}
              >
                <ThemedText style={[styles.toggleButtonText, showCharts && styles.toggleButtonTextActive]}>
                  📊 Chart View
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          {showCharts ? (
            <PowerZoneCharts powerZoneBalances={powerZoneBalances} />
          ) : (
            <ThemedView>
              {powerZoneBalances.map((zone, index) => (
                <ThemedView key={zone.zone} style={styles.zoneCard}>
                  <ThemedView style={styles.zoneHeader}>
                    <ThemedText type="defaultSemiBold" style={styles.zoneName}>
                      {zone.zone} - {zone.description}
                    </ThemedText>
                    <ThemedText style={styles.zonePower}>
                      {zone.powerRange}
                    </ThemedText>
                  </ThemedView>

                  <ThemedView style={styles.zoneMetrics}>
                    {zone.leftRightBalance && (
                      <ThemedView style={styles.zoneMetric}>
                        <ThemedText style={styles.zoneMetricLabel}>⚖️ Balance:</ThemedText>
                        <ThemedText style={styles.zoneMetricValue}>
                          L: {zone.leftRightBalance.left}% | R: {zone.leftRightBalance.right}%
                        </ThemedText>
                      </ThemedView>
                    )}

                    {zone.torqueEffectiveness && (
                      <ThemedView style={styles.zoneMetric}>
                        <ThemedText style={styles.zoneMetricLabel}>🔧 Torque:</ThemedText>
                        <ThemedText style={styles.zoneMetricValue}>
                          L: {zone.torqueEffectiveness.left}% | R: {zone.torqueEffectiveness.right}%
                        </ThemedText>
                      </ThemedView>
                    )}

                    {zone.pedalSmoothness && (
                      <ThemedView style={styles.zoneMetric}>
                        <ThemedText style={styles.zoneMetricLabel}>⚪ Smoothness:</ThemedText>
                        <ThemedText style={styles.zoneMetricValue}>
                          L: {zone.pedalSmoothness.left}% | R: {zone.pedalSmoothness.right}%
                        </ThemedText>
                      </ThemedView>
                    )}

                    <ThemedView style={styles.zoneMetric}>
                      <ThemedText style={styles.zoneMetricLabel}>📊 Samples:</ThemedText>
                      <ThemedText style={styles.zoneMetricValue}>
                        {zone.sampleCount}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                </ThemedView>
              ))}
            </ThemedView>
          )}
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    width: '100%',
  },
  section: {
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  toggleContainer: {
    alignItems: 'center',
  },
  toggleButtons: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  toggleButtonTextActive: {
    color: '#ffffff',
    opacity: 1,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  metricLabel: {
    fontSize: 16,
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  zoneCard: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  zoneHeader: {
    marginBottom: 12,
  },
  zoneName: {
    fontSize: 16,
    marginBottom: 4,
  },
  zonePower: {
    fontSize: 14,
    opacity: 0.7,
  },
  zoneMetrics: {
    gap: 8,
  },
  zoneMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoneMetricLabel: {
    fontSize: 14,
    flex: 1,
  },
  zoneMetricValue: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
});