import React from 'react';
import { StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

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

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 40; // Account for padding

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#f8f9fa',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(60, 60, 67, ${opacity})`,
  style: {
    borderRadius: 12,
  },
  propsForBackgroundLines: {
    strokeDasharray: '',
    stroke: '#e3e3e3',
    strokeWidth: 1,
  },
  propsForLabels: {
    fontSize: 12,
  },
};

const balanceChartConfig = {
  ...chartConfig,
  color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`, // Orange for balance
};

const torqueChartConfig = {
  ...chartConfig,
  color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`, // Green for torque
};

const smoothnessChartConfig = {
  ...chartConfig,
  color: (opacity = 1) => `rgba(88, 86, 214, ${opacity})`, // Purple for smoothness
};

export default function PowerZoneCharts({ powerZoneBalances }: PowerZoneChartsProps) {
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

  // Combined line chart data for comparison
  const combinedData = {
    labels: zones,
    datasets: [
      {
        data: leftTorqueData,
        color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`, // Green
        strokeWidth: 3,
      },
      {
        data: rightTorqueData,
        color: (opacity = 1) => `rgba(52, 199, 89, 0.6)`, // Light green
        strokeWidth: 2,
        withDots: false,
      },
    ],
  };

  const balanceData = {
    labels: zones,
    datasets: [
      {
        data: leftBalanceData.map(val => val - 50), // Center around 0 for balance
        color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`, // Red for left
        strokeWidth: 3,
      },
      {
        data: rightBalanceData.map(val => val - 50), // Center around 0 for balance  
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, // Blue for right
        strokeWidth: 3,
      },
    ],
  };

  const smoothnessData = {
    labels: zones,
    datasets: [
      {
        data: leftSmoothnessData,
        color: (opacity = 1) => `rgba(88, 86, 214, ${opacity})`, // Purple for left
        strokeWidth: 3,
      },
      {
        data: rightSmoothnessData,
        color: (opacity = 1) => `rgba(88, 86, 214, 0.6)`, // Light purple for right
        strokeWidth: 2,
        withDots: false,
      },
    ],
  };

  // Bar chart data for comparison view
  const torqueBarData = {
    labels: zones,
    datasets: [
      {
        data: leftTorqueData,
        color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`, // Red for left
      },
      {
        data: rightTorqueData, 
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, // Blue for right
      },
    ],
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.section}>
        <ThemedText type="title" style={styles.sectionTitle}>
          📊 Power Zone Analysis Charts
        </ThemedText>
      </ThemedView>

      {/* Power Balance Chart */}
      <ThemedView style={styles.chartContainer}>
        <ThemedText type="subtitle" style={styles.chartTitle}>
          ⚖️ Left/Right Power Balance by Zone
        </ThemedText>
        <ThemedText style={styles.chartSubtitle}>
          Deviation from 50/50 balance (Red = Left bias, Blue = Right bias)
        </ThemedText>
        
        <LineChart
          data={balanceData}
          width={chartWidth}
          height={220}
          chartConfig={{
            ...balanceChartConfig,
            formatYLabel: (value) => `${(parseFloat(value) + 50).toFixed(0)}%`,
          }}
          bezier
          style={styles.chart}
          withVerticalLines={false}
          withHorizontalLines={true}
          fromZero={false}
        />

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
      <ThemedView style={styles.chartContainer}>
        <ThemedText type="subtitle" style={styles.chartTitle}>
          🔧 Torque Effectiveness by Zone
        </ThemedText>
        <ThemedText style={styles.chartSubtitle}>
          How effectively you apply power through the pedal stroke (higher is better)
        </ThemedText>
        
        <LineChart
          data={combinedData}
          width={chartWidth}
          height={220}
          chartConfig={torqueChartConfig}
          bezier
          style={styles.chart}
          withVerticalLines={false}
          withHorizontalLines={true}
          yAxisSuffix="%"
        />

        <ThemedView style={styles.legend}>
          <ThemedView style={styles.legendItem}>
            <ThemedView style={[styles.legendDot, { backgroundColor: 'rgba(52, 199, 89, 1)' }]} />
            <ThemedText style={styles.legendText}>Left Leg</ThemedText>
          </ThemedView>
          <ThemedView style={styles.legendItem}>
            <ThemedView style={[styles.legendDot, { backgroundColor: 'rgba(52, 199, 89, 0.6)' }]} />
            <ThemedText style={styles.legendText}>Right Leg</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Pedal Smoothness Chart */}
      <ThemedView style={styles.chartContainer}>
        <ThemedText type="subtitle" style={styles.chartTitle}>
          ⚪ Pedal Smoothness by Zone
        </ThemedText>
        <ThemedText style={styles.chartSubtitle}>
          How smooth your power delivery is throughout the pedal stroke
        </ThemedText>
        
        <LineChart
          data={smoothnessData}
          width={chartWidth}
          height={220}
          chartConfig={smoothnessChartConfig}
          bezier
          style={styles.chart}
          withVerticalLines={false}
          withHorizontalLines={true}
          yAxisSuffix="%"
        />

        <ThemedView style={styles.legend}>
          <ThemedView style={styles.legendItem}>
            <ThemedView style={[styles.legendDot, { backgroundColor: 'rgba(88, 86, 214, 1)' }]} />
            <ThemedText style={styles.legendText}>Left Leg</ThemedText>
          </ThemedView>
          <ThemedView style={styles.legendItem}>
            <ThemedView style={[styles.legendDot, { backgroundColor: 'rgba(88, 86, 214, 0.6)' }]} />
            <ThemedText style={styles.legendText}>Right Leg</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Comparison Bar Chart */}
      <ThemedView style={styles.chartContainer}>
        <ThemedText type="subtitle" style={styles.chartTitle}>
          📊 Left vs Right Comparison
        </ThemedText>
        <ThemedText style={styles.chartSubtitle}>
          Direct comparison of torque effectiveness between left and right legs
        </ThemedText>
        
        <BarChart
          data={torqueBarData}
          width={chartWidth}
          height={220}
          chartConfig={{
            ...torqueChartConfig,
            barPercentage: 0.7,
          }}
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix="%"
          xAxisLabel=""
          showValuesOnTopOfBars={true}
        />

        <ThemedView style={styles.legend}>
          <ThemedView style={styles.legendItem}>
            <ThemedView style={[styles.legendDot, { backgroundColor: 'rgba(255, 59, 48, 1)' }]} />
            <ThemedText style={styles.legendText}>Left Leg Torque</ThemedText>
          </ThemedView>
          <ThemedView style={styles.legendItem}>
            <ThemedView style={[styles.legendDot, { backgroundColor: 'rgba(0, 122, 255, 1)' }]} />
            <ThemedText style={styles.legendText}>Right Leg Torque</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Performance Insights */}
      <ThemedView style={styles.insightsContainer}>
        <ThemedText type="subtitle" style={styles.chartTitle}>
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
      <ThemedView style={styles.summaryContainer}>
        <ThemedText type="subtitle" style={styles.chartTitle}>
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
  sectionTitle: {
    textAlign: 'center',
    marginBottom: 8,
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
  chartTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  chartSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
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