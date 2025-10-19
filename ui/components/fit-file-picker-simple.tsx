import React, { useState } from 'react';
import { StyleSheet, Alert, ActivityIndicator, View, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface FitFilePickerProps {
  onFileSelected?: (file: DocumentPicker.DocumentPickerResult) => void;
  onAnalysisComplete?: (analysis: any) => void;
  serverUrl?: string;
}

export default function FitFilePickerSimple({ 
  onFileSelected, 
  onAnalysisComplete, 
  serverUrl = 'http://localhost:3000' 
}: FitFilePickerProps) {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const uploadFileToServer = async (file: DocumentPicker.DocumentPickerAsset) => {
    try {
      setIsUploading(true);
      console.log('Starting file upload to server...');
      
      // Read the file as binary data
      const response = await fetch(file.uri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      console.log('File read successfully, size:', uint8Array.length);
      
      // Upload to server
      const uploadResponse = await fetch(`${serverUrl}/activity/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: uint8Array,
      });
      
      console.log('Upload response status:', uploadResponse.status);
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(`Server error: ${errorData.error || 'Unknown error'}`);
      }
      
      const analysisData = await uploadResponse.json();
      console.log('Analysis received:', analysisData);
      
      setAnalysisResult(analysisData);
      onAnalysisComplete?.(analysisData);
      
      Alert.alert(
        'Analysis Complete! ✅',
        `Your workout has been analyzed!\n\nAverage Power: ${analysisData.averagePower}W\nThreshold Power: ${analysisData.thresholdPower || 'N/A'}W`,
        [{ text: 'View Results', style: 'default' }]
      );
      
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed',
        `Failed to analyze your workout file.\n\nError: ${error}\n\nPlease make sure the server is running on ${serverUrl}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsUploading(false);
    }
  };

  const pickFitFile = async () => {
    try {
      setIsLoading(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Accept all files for maximum compatibility
        copyToCacheDirectory: true,
        multiple: false,
      });

      console.log('Document picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        console.log('Selected file:', {
          name: file.name,
          size: file.size,
          mimeType: file.mimeType,
          uri: file.uri
        });
        
        // Only check file extension - very simple validation
        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.fit')) {
          Alert.alert(
            'Wrong File Type',
            `Selected: ${file.name}\n\nThis doesn't appear to be a .fit file. Please select a file with .fit extension.`,
            [
              { text: 'Try Again', style: 'default' },
              { text: 'Select Anyway', onPress: async () => {
                setSelectedFile(file);
                onFileSelected?.(result);
                console.log('File selected despite validation warning');
                await uploadFileToServer(file);
              }},
              { text: 'Cancel', style: 'cancel' }
            ]
          );
          return;
        }

        setSelectedFile(file);
        onFileSelected?.(result);
        
        Alert.alert(
          'File Selected Successfully! ✅',
          `File: ${file.name}\nSize: ${((file.size || 0) / 1024).toFixed(1)} KB\n\nUploading to server for analysis...`,
          [{ text: 'Continue' }]
        );
        
        // Automatically upload the file to the server
        await uploadFileToServer(file);
      } else {
        console.log('File selection was canceled or failed');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert(
        'Selection Error',
        `Error details: ${error}\n\nPlease try again.`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Upload Workout Data
      </ThemedText>
      
      <ThemedText style={styles.description}>
        Select a .fit file from your cycling computer, power meter, or training app.
      </ThemedText>

      <ThemedView style={styles.buttonContainer}>
        {(isLoading || isUploading) ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <ThemedText style={styles.loadingText}>
              {isLoading ? 'Opening file picker...' : 'Analyzing workout...'}
            </ThemedText>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={pickFitFile}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.buttonText}>
              📁 Select FIT File
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      {selectedFile && (
        <ThemedView style={styles.fileInfo}>
          <ThemedText type="defaultSemiBold" style={styles.fileTitle}>
            Selected File:
          </ThemedText>
          <ThemedText style={styles.fileName}>
            {selectedFile.name}
          </ThemedText>
          <ThemedText style={styles.fileSize}>
            Size: {((selectedFile.size || 0) / 1024).toFixed(1)} KB
          </ThemedText>
          <ThemedText style={styles.fileType}>
            MIME Type: {selectedFile.mimeType || 'Unknown'}
          </ThemedText>
          <ThemedText style={styles.filePath}>
            Path: {selectedFile.uri}
          </ThemedText>
          
          {analysisResult && (
            <ThemedView style={styles.analysisPreview}>
              <ThemedText style={styles.analysisTitle}>
                📊 Quick Analysis Preview:
              </ThemedText>
              <ThemedText style={styles.analysisText}>
                🚴 Average Power: {analysisResult.averagePower}W
              </ThemedText>
              {analysisResult.thresholdPower && (
                <ThemedText style={styles.analysisText}>
                  🎯 Threshold: {analysisResult.thresholdPower}W
                </ThemedText>
              )}
              {analysisResult.leftRightBalance && (
                <ThemedText style={styles.analysisText}>
                  ⚖️ Balance: L:{analysisResult.leftRightBalance.left}% R:{analysisResult.leftRightBalance.right}%
                </ThemedText>
              )}
              <ThemedText style={styles.analysisText}>
                📈 Zones: {analysisResult.powerZoneBalances?.length || 0} analyzed
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  fileInfo: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  fileTitle: {
    fontSize: 16,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
  },
  fileSize: {
    fontSize: 12,
    opacity: 0.7,
  },
  fileType: {
    fontSize: 12,
    opacity: 0.7,
  },
  filePath: {
    fontSize: 10,
    opacity: 0.6,
    fontFamily: 'monospace',
  },
  analysisPreview: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0, 200, 0, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 0, 0.3)',
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#006400',
  },
  analysisText: {
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
});
