import React from 'react';
import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import FitFilePicker from '@/components/fit-file-picker-simple';
import WorkoutAnalysis from '@/components/workout-analysis';
import { Link } from 'expo-router';

export default function HomeScreen() {
  const [workoutData, setWorkoutData] = React.useState<any>(null);
  const [showAnalysis, setShowAnalysis] = React.useState(false);

  const handleFileSelected = (file: DocumentPicker.DocumentPickerResult) => {
    console.log('File selected:', file);
  };

  const handleAnalysisComplete = (analysisData: any) => {
    console.log('Analysis complete:', analysisData);
    setWorkoutData(analysisData);
    setShowAnalysis(true);
  };

  const handleBackToUpload = () => {
    setShowAnalysis(false);
    setWorkoutData(null);
  };

  if (showAnalysis && workoutData) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.reactLogo}
          />
        }>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Workout Analysis</ThemedText>
          <HelloWave />
        </ThemedView>

        <ThemedView style={styles.buttonContainer}>
          <ThemedText
            style={styles.backButton}
            onPress={handleBackToUpload}
          >
            ← Upload Another File
          </ThemedText>
        </ThemedView>

        <WorkoutAnalysis workoutData={workoutData} />
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Workout Viewer</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Analyze Your Cycling Data</ThemedText>
        <ThemedText style={styles.description}>
          Upload .fit files (only) from your cycling computer to analyze power, balance,
          torque effectiveness, and pedal smoothness across different power zones.
        </ThemedText>
        <ThemedText style={[styles.description, styles.warningText]}>
          ⚠️ Note: Only .fit files are supported (not .gpx, .tcx, or .csv files)
        </ThemedText>
      </ThemedView>

      <FitFilePicker
        onFileSelected={handleFileSelected}
        onAnalysisComplete={handleAnalysisComplete}
        serverUrl="http://localhost:3000"
      />

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">What You'll Get</ThemedText>
        <ThemedView style={styles.featureList}>
          <ThemedText style={styles.feature}>⚖️ Left/Right Power Balance</ThemedText>
          <ThemedText style={styles.feature}>🔧 Torque Effectiveness Analysis</ThemedText>
          <ThemedText style={styles.feature}>⚪ Pedal Smoothness Metrics</ThemedText>
          <ThemedText style={styles.feature}>📊 Power Zone Breakdown</ThemedText>
          <ThemedText style={styles.feature}>🎯 Performance Insights</ThemedText>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
  description: {
    lineHeight: 20,
    opacity: 0.8,
  },
  warningText: {
    color: '#FF8C00',
    fontWeight: '500',
    marginTop: 8,
    fontSize: 14,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  featureList: {
    gap: 8,
    marginTop: 8,
  },
  feature: {
    fontSize: 16,
    lineHeight: 22,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
