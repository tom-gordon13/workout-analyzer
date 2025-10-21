import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

interface PowerZoneChartsProps {
  powerZoneBalances: PowerZoneBalance[];
}

// Color scheme constants for consistency
const COLORS = {
  leftLeg: 'rgba(255, 59, 48, 1)', // Red
  leftLegTransparent: 'rgba(255, 59, 48, 0.8)',
  rightLeg: 'rgba(0, 122, 255, 1)', // Blue
  rightLegTransparent: 'rgba(0, 122, 255, 0.8)',
  background: 'rgba(248, 249, 250, 0.8)',
  grid: 'rgba(227, 227, 227, 1)',
  text: 'rgba(60, 60, 67, 1)',
};

export default function PowerZoneCharts({ powerZoneBalances }: PowerZoneChartsProps) {
  const { width } = useWindowDimensions();
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  // Update screen size detection
  useEffect(() => {
    setIsSmallScreen(width < 400);
  }, [width]);
  
  // Common chart options
  const getChartOptions = (title: string, yAxisLabel?: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll use custom legends
      },
      title: {
        display: false, // We'll use custom titles
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: COLORS.text,
        bodyColor: COLORS.text,
        borderColor: COLORS.grid,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: COLORS.grid,
          lineWidth: 1,
        },
        ticks: {
          color: COLORS.text,
          font: {
            size: isSmallScreen ? 10 : 12,
          },
          callback: function(value: any, index: number) {
            const label = this.getLabelForValue(value);
            // Shorten labels on small screens
            if (isSmallScreen && label.length > 3) {
              return label.substring(0, 3);
            }
            return label;
          },
        },
      },
      y: {
        grid: {
          color: COLORS.grid,
          lineWidth: 1,
        },
        ticks: {
          color: COLORS.text,
          font: {
            size: isSmallScreen ? 10 : 12,
          },
          callback: function(value: any) {
            return yAxisLabel ? `${value}${yAxisLabel}` : value;
          },
        },
      },
    },
    layout: {
      padding: {
        left: isSmallScreen ? 10 : 20,
        right: isSmallScreen ? 10 : 20,
        top: 10,
        bottom: 10,
      },
    },
  });

  if (!powerZoneBalances || powerZoneBalances.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.noDataText}>
          No power zone data available for visualization
        </ThemedText>
      </ThemedView>
    );
  }

  // Prepare data for charts
  const zones = powerZoneBalances.map(zone => zone.zone);

  // Balance data (Left vs Right)
  const leftBalanceData = powerZoneBalances.map(zone =>
    zone.leftRightBalance?.left || 0
  );
  const rightBalanceData = powerZoneBalances.map(zone =>
    zone.leftRightBalance?.right || 0
  );

  // Torque effectiveness data
  const leftTorqueData = powerZoneBalances.map(zone =>
    zone.torqueEffectiveness?.left || 0
  );
  const rightTorqueData = powerZoneBalances.map(zone =>
    zone.torqueEffectiveness?.right || 0
  );

  // Pedal smoothness data
  const leftSmoothnessData = powerZoneBalances.map(zone =>
    zone.pedalSmoothness?.left || 0
  );
  const rightSmoothnessData = powerZoneBalances.map(zone =>
    zone.pedalSmoothness?.right || 0
  );

  // Chart.js data structures
  const balanceChartData = {
    labels: zones,
    datasets: [
      {
        label: 'Left Leg',
        data: leftBalanceData.map(val => val - 50), // Center around 0 for balance
        borderColor: COLORS.leftLeg,
        backgroundColor: COLORS.leftLegTransparent,
        pointBackgroundColor: COLORS.leftLeg,
        pointBorderColor: COLORS.leftLeg,
        tension: 0.4,
        borderWidth: 2,
      },
      {
        label: 'Right Leg',
        data: rightBalanceData.map(val => val - 50), // Center around 0 for balance
        borderColor: COLORS.rightLeg,
        backgroundColor: COLORS.rightLegTransparent,
        pointBackgroundColor: COLORS.rightLeg,
        pointBorderColor: COLORS.rightLeg,
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  const torqueChartData = {
    labels: zones,
    datasets: [
      {
        label: 'Left Leg',
        data: leftTorqueData,
        borderColor: COLORS.leftLeg,
        backgroundColor: COLORS.leftLegTransparent,
        pointBackgroundColor: COLORS.leftLeg,
        pointBorderColor: COLORS.leftLeg,
        tension: 0.4,
        borderWidth: 2,
      },
      {
        label: 'Right Leg',
        data: rightTorqueData,
        borderColor: COLORS.rightLeg,
        backgroundColor: COLORS.rightLegTransparent,
        pointBackgroundColor: COLORS.rightLeg,
        pointBorderColor: COLORS.rightLeg,
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  const smoothnessChartData = {
    labels: zones,
    datasets: [
      {
        label: 'Left Leg',
        data: leftSmoothnessData,
        borderColor: COLORS.leftLeg,
        backgroundColor: COLORS.leftLegTransparent,
        pointBackgroundColor: COLORS.leftLeg,
        pointBorderColor: COLORS.leftLeg,
        tension: 0.4,
        borderWidth: 2,
      },
      {
        label: 'Right Leg',
        data: rightSmoothnessData,
        borderColor: COLORS.rightLeg,
        backgroundColor: COLORS.rightLegTransparent,
        pointBackgroundColor: COLORS.rightLeg,
        pointBorderColor: COLORS.rightLeg,
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  const torqueBarChartData = {
    labels: zones,
    datasets: [
      {
        label: 'Left Leg',
        data: leftTorqueData,
        backgroundColor: COLORS.leftLeg,
        borderColor: COLORS.leftLeg,
        borderWidth: 1,
      },
      {
        label: 'Right Leg',
        data: rightTorqueData,
        backgroundColor: COLORS.rightLeg,
        borderColor: COLORS.rightLeg,
        borderWidth: 1,
      },
    ],
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={[styles.section, isSmallScreen && styles.sectionSmall]}>
        <ThemedText type="title" style={[styles.sectionTitle, isSmallScreen && styles.titleSmall]}>
          📊 Power Zone Analysis Charts
        </ThemedText>
      </ThemedView>

      {/* Power Balance Chart */}
      <ThemedView style={[styles.chartContainer, isSmallScreen && styles.chartContainerSmall]}>
        <ThemedText type="subtitle" style={[styles.chartTitle, isSmallScreen && styles.chartTitleSmall]}>
          ⚖️ Left/Right Power Balance by Zone
        </ThemedText>
        <ThemedText style={[styles.chartSubtitle, isSmallScreen && styles.chartSubtitleSmall]}>
          Deviation from 50/50 balance (Red = Left bias, Blue = Right bias)
        </ThemedText>

        <ThemedView style={[styles.chartWrapper, isSmallScreen && styles.chartWrapperSmall]}>
          <Line 
            data={balanceChartData}
            options={{
              ...getChartOptions('Power Balance', '%'),
              scales: {
                ...getChartOptions('Power Balance', '%').scales,
                y: {
                  ...getChartOptions('Power Balance', '%').scales.y,
                  ticks: {
                    ...getChartOptions('Power Balance', '%').scales.y.ticks,
                    callback: function(value: any) {
                      return `${(parseFloat(value) + 50).toFixed(0)}%`;
                    },
                  },
                },
              },
            }}
          />
        </ThemedView>

        <ThemedView style={styles.legend}>
          <ThemedView style={styles.legendItem}>
            <ThemedView style={[styles.legendDot, { backgroundColor: 'rgba(255, 59, 48, 1)' }]} />
            <ThemedText style={styles.legendText}>Left Leg</ThemedText>
          </ThemedView>
          <ThemedView style={styles.legendItem}>
            <ThemedView style={[styles.legendDot, { backgroundColor: 'rgba(0, 122, 255, 1)' }]} />
            <ThemedText style={styles.legendText}>Right Leg</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Torque Effectiveness Chart */}
      <ThemedView style={[styles.chartContainer, isSmallScreen && styles.chartContainerSmall]}>
        <ThemedText type="subtitle" style={[styles.chartTitle, isSmallScreen && styles.chartTitleSmall]}>
          🔧 Torque Effectiveness by Zone
        </ThemedText>
        <ThemedText style={[styles.chartSubtitle, isSmallScreen && styles.chartSubtitleSmall]}>
          How effectively you apply power through the pedal stroke (higher is better)
        </ThemedText>

        <ThemedView style={[styles.chartWrapper, isSmallScreen && styles.chartWrapperSmall]}>
          <Line 
            data={torqueChartData}
            options={getChartOptions('Torque Effectiveness', '%')}
          />
        </ThemedView>

        <ThemedView style={styles.legend}>
          <ThemedView style={styles.legendItem}>
            <ThemedView style={[styles.legendDot, { backgroundColor: 'rgba(255, 59, 48, 1)' }]} />
            <ThemedText style={styles.legendText}>Left Leg</ThemedText>
          </ThemedView>
          <ThemedView style={styles.legendItem}>
            <ThemedView style={[styles.legendDot, { backgroundColor: 'rgba(0, 122, 255, 1)' }]} />
            <ThemedText style={styles.legendText}>Right Leg</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Pedal Smoothness Chart */}
      <ThemedView style={[styles.chartContainer, isSmallScreen && styles.chartContainerSmall]}>
        <ThemedText type="subtitle" style={[styles.chartTitle, isSmallScreen && styles.chartTitleSmall]}>
          ⚪ Pedal Smoothness by Zone
        </ThemedText>
        <ThemedText style={[styles.chartSubtitle, isSmallScreen && styles.chartSubtitleSmall]}>
          How smooth your power delivery is throughout the pedal stroke
        </ThemedText>

        <ThemedView style={[styles.chartWrapper, isSmallScreen && styles.chartWrapperSmall]}>
          <Line 
            data={smoothnessChartData}
            options={getChartOptions('Pedal Smoothness', '%')}
          />
        </ThemedView>

        <ThemedView style={styles.legend}>
          <ThemedView style={styles.legendItem}>
            <ThemedView style={[styles.legendDot, { backgroundColor: 'rgba(255, 59, 48, 1)' }]} />
            <ThemedText style={styles.legendText}>Left Leg</ThemedText>
          </ThemedView>
          <ThemedView style={styles.legendItem}>
            <ThemedView style={[styles.legendDot, { backgroundColor: 'rgba(0, 122, 255, 1)' }]} />
            <ThemedText style={styles.legendText}>Right Leg</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Comparison Bar Chart */}
      <ThemedView style={[styles.chartContainer, isSmallScreen && styles.chartContainerSmall]}>
        <ThemedText type="subtitle" style={[styles.chartTitle, isSmallScreen && styles.chartTitleSmall]}>
          📊 Left vs Right Comparison
        </ThemedText>
        <ThemedText style={[styles.chartSubtitle, isSmallScreen && styles.chartSubtitleSmall]}>
          Direct comparison of torque effectiveness between left and right legs (Red = Left, Blue = Right)
        </ThemedText>

        <ThemedView style={[styles.chartWrapper, isSmallScreen && styles.chartWrapperSmall]}>
          <Bar 
            data={torqueBarChartData}
            options={{
              ...getChartOptions('Torque Comparison', '%'),
              plugins: {
                ...getChartOptions('Torque Comparison', '%').plugins,
                legend: {
                  display: false, // We use custom legend
                },
              },
              scales: {
                ...getChartOptions('Torque Comparison', '%').scales,
                y: {
                  ...getChartOptions('Torque Comparison', '%').scales.y,
                  beginAtZero: true,
                },
              },
            }}
          />
        </ThemedView>

        <ThemedView style={styles.legend}>
          <ThemedView style={styles.legendItem}>
            <ThemedView style={[styles.legendDot, { backgroundColor: 'rgba(255, 59, 48, 1)' }]} />
            <ThemedText style={styles.legendText}>Left Leg</ThemedText>
          </ThemedView>
          <ThemedView style={styles.legendItem}>
            <ThemedView style={[styles.legendDot, { backgroundColor: 'rgba(0, 122, 255, 1)' }]} />
            <ThemedText style={styles.legendText}>Right Leg</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Performance Insights */}
      <ThemedView style={[styles.insightsContainer, isSmallScreen && styles.insightsContainerSmall]}>
        <ThemedText type="subtitle" style={[styles.chartTitle, isSmallScreen && styles.chartTitleSmall]}>
          💡 Performance Insights
        </ThemedText>

        {(() => {
          const avgTorqueLeft = leftTorqueData.reduce((a, b) => a + b, 0) / leftTorqueData.length;
          const avgTorqueRight = rightTorqueData.reduce((a, b) => a + b, 0) / rightTorqueData.length;
          const avgSmoothLeft = leftSmoothnessData.reduce((a, b) => a + b, 0) / leftSmoothnessData.length;
          const avgSmoothRight = rightSmoothnessData.reduce((a, b) => a + b, 0) / rightSmoothnessData.length;

          const torqueDiff = Math.abs(avgTorqueLeft - avgTorqueRight);
          const smoothDiff = Math.abs(avgSmoothLeft - avgSmoothRight);

          return (
            <ThemedView style={styles.insightsGrid}>
              <ThemedView style={styles.insightCard}>
                <ThemedText style={styles.insightTitle}>🎯 Torque Balance</ThemedText>
                <ThemedText style={styles.insightValue}>
                  {torqueDiff < 3 ? 'Excellent' : torqueDiff < 7 ? 'Good' : 'Needs Work'}
                </ThemedText>
                <ThemedText style={styles.insightDesc}>
                  {torqueDiff.toFixed(1)}% difference between legs
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.insightCard}>
                <ThemedText style={styles.insightTitle}>⚪ Smoothness</ThemedText>
                <ThemedText style={styles.insightValue}>
                  {avgSmoothLeft > 25 && avgSmoothRight > 25 ? 'Excellent' : 'Good'}
                </ThemedText>
                <ThemedText style={styles.insightDesc}>
                  Avg: L:{avgSmoothLeft.toFixed(1)}% R:{avgSmoothRight.toFixed(1)}%
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.insightCard}>
                <ThemedText style={styles.insightTitle}>📊 Consistency</ThemedText>
                <ThemedText style={styles.insightValue}>
                  {Math.max(...leftTorqueData) - Math.min(...leftTorqueData) < 15 ? 'Stable' : 'Variable'}
                </ThemedText>
                <ThemedText style={styles.insightDesc}>
                  Performance across zones
                </ThemedText>
              </ThemedView>
            </ThemedView>
          );
        })()}
      </ThemedView>

      {/* Summary Table */}
      <ThemedView style={[styles.summaryContainer, isSmallScreen && styles.summaryContainerSmall]}>
        <ThemedText type="subtitle" style={[styles.chartTitle, isSmallScreen && styles.chartTitleSmall]}>
          📋 Zone Summary
        </ThemedText>

        {powerZoneBalances.map((zone, index) => (
          <ThemedView key={zone.zone} style={styles.summaryRow}>
            <ThemedView style={styles.zoneInfo}>
              <ThemedText style={styles.zoneName}>{zone.zone}</ThemedText>
              <ThemedText style={styles.zoneDesc}>{zone.description}</ThemedText>
              <ThemedText style={styles.zonePower}>{zone.powerRange}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.metricsGrid}>
              {zone.leftRightBalance && (
                <ThemedView style={styles.metricCell}>
                  <ThemedText style={styles.metricLabel}>Balance</ThemedText>
                  <ThemedText style={styles.metricValue}>
                    {zone.leftRightBalance.left}% / {zone.leftRightBalance.right}%
                  </ThemedText>
                </ThemedView>
              )}

              {zone.torqueEffectiveness && (
                <ThemedView style={styles.metricCell}>
                  <ThemedText style={styles.metricLabel}>Torque</ThemedText>
                  <ThemedText style={styles.metricValue}>
                    {zone.torqueEffectiveness.left}% / {zone.torqueEffectiveness.right}%
                  </ThemedText>
                </ThemedView>
              )}

              {zone.pedalSmoothness && (
                <ThemedView style={styles.metricCell}>
                  <ThemedText style={styles.metricLabel}>Smoothness</ThemedText>
                  <ThemedText style={styles.metricValue}>
                    {zone.pedalSmoothness.left}% / {zone.pedalSmoothness.right}%
                  </ThemedText>
                </ThemedView>
              )}

              <ThemedView style={styles.metricCell}>
                <ThemedText style={styles.metricLabel}>Samples</ThemedText>
                <ThemedText style={styles.metricValue}>{zone.sampleCount}</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        ))}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 20,
    alignItems: 'center',
  },
  sectionSmall: {
    padding: 5,
  },
  sectionTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  titleSmall: {
    fontSize: 18,
    marginBottom: 4,
  },
  chartContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartContainerSmall: {
    margin: 5,
    marginHorizontal: 8,
    padding: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  chartTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  chartTitleSmall: {
    fontSize: 14,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  chartSubtitleSmall: {
    fontSize: 11,
    marginBottom: 10,
    lineHeight: 14,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  chartSmall: {
    marginVertical: 4,
    marginHorizontal: -4,
    borderRadius: 8,
  },
  chartWrapper: {
    height: 220,
    width: '100%',
    marginVertical: 8,
  },
  chartWrapperSmall: {
    height: 180,
    marginVertical: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.7,
    padding: 40,
  },
  insightsContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c3e6c3',
  },
  insightsContainerSmall: {
    margin: 5,
    marginHorizontal: 8,
    padding: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  insightCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  insightValue: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    color: '#006400',
    textAlign: 'center',
  },
  insightDesc: {
    fontSize: 10,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 12,
  },
  summaryContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  summaryContainerSmall: {
    margin: 5,
    marginHorizontal: 8,
    padding: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  zoneInfo: {
    flex: 1,
    marginRight: 12,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  zoneDesc: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  zonePower: {
    fontSize: 11,
    opacity: 0.6,
  },
  metricsGrid: {
    flex: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCell: {
    flex: 1,
    minWidth: '45%',
  },
  metricLabel: {
    fontSize: 10,
    opacity: 0.6,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '500',
  },
});