import React, { useState } from 'react';
import { StyleSheet, Alert, ActivityIndicator, View, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface FitFilePickerProps {
  onFileSelected?: (file: DocumentPicker.DocumentPickerResult) => void;
}

export default function FitFilePicker({ onFileSelected }: FitFilePickerProps) {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Additional validation: Check FIT file binary signature
  const validateFitFileSignature = async (fileUri: string): Promise<boolean> => {
    try {
      // Note: In a real implementation, you'd read the file header bytes
      // For now, we'll rely on extension and size validation
      // FIT files start with specific header bytes, but reading them in React Native
      // requires additional file system access
      return true;
    } catch (error) {
      console.error('Error validating FIT file signature:', error);
      return false;
    }
  };

  // Comprehensive FIT file validation function
  const validateFitFile = (file: DocumentPicker.DocumentPickerAsset): { isValid: boolean; errorMessage?: string } => {
    // Debug logging
    console.log('Validating file:', {
      name: file.name,
      size: file.size,
      mimeType: file.mimeType,
      uri: file.uri
    });

    // Check file extension (case-insensitive)
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.fit')) {
      console.log('File extension validation failed:', fileName);
      return {
        isValid: false,
        errorMessage: 'Invalid file type. Only .fit files are allowed.\n\nSupported devices:\n• Garmin Edge series\n• Wahoo BOLT/ROAM\n• Polar cycling computers\n• SRM, Quarq, Stages power meters'
      };
    }

    // Check file size (FIT files can range from very small to large)
    const fileSizeKB = (file.size || 0) / 1024;
    console.log('File size validation:', fileSizeKB + 'KB');
    
    if (fileSizeKB < 0.1) { // 100 bytes minimum - very permissive
      console.log('File size too small:', fileSizeKB);
      return {
        isValid: false,
        errorMessage: 'File appears to be empty. Please select a valid .fit file from your workout.'
      };
    }

    if (fileSizeKB > 50000) { // 50MB limit
      console.log('File size too large:', fileSizeKB);
      return {
        isValid: false,
        errorMessage: 'File is too large. FIT files are typically under 50MB. Please check if this is a valid workout file.'
      };
    }

    // Check MIME type if available (relaxed check)
    // Note: .fit files can have various MIME types depending on the system
    // We'll mainly rely on file extension since MIME types are unreliable for .fit files
    if (file.mimeType && (file.mimeType.startsWith('image/') || 
        file.mimeType.startsWith('video/') ||
        file.mimeType.startsWith('audio/'))) {
      console.log('MIME type validation failed:', file.mimeType);
      return {
        isValid: false,
        errorMessage: `This appears to be a ${file.mimeType.split('/')[0]} file, not a .fit file.\n\nPlease select a .fit file from your cycling computer or power meter.`
      };
    }

    console.log('File validation passed successfully!');
    return { isValid: true };
  };

  const pickFitFile = async () => {
    try {
      setIsLoading(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/octet-stream', // Most common MIME type for .fit files
          'application/fit',
          'application/x-fit',
          '*/*' // Fallback since .fit files might not have standard MIME types
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Comprehensive validation
        const validation = validateFitFile(file);
        
        if (!validation.isValid) {
          Alert.alert(
            'Invalid File Selected',
            validation.errorMessage,
            [
              { text: 'Try Again', style: 'default' },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
          return;
        }

        setSelectedFile(file);
        onFileSelected?.(result);
        
        Alert.alert(
          'FIT File Selected ✅',
          `Successfully selected: ${file.name}\nSize: ${(file.size! / 1024).toFixed(1)} KB\n\nReady for analysis!`,
          [{ text: 'Continue', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert(
        'File Selection Failed',
        'Unable to access the file picker. Please check your device permissions and try again.',
        [{ text: 'OK', style: 'default' }]
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
        Select a .fit file from your cycling computer, power meter, or training app to analyze your workout data.
      </ThemedText>

      <ThemedView style={styles.requirementBox}>
        <ThemedText style={styles.requirementTitle}>
          📋 File Requirements:
        </ThemedText>
        <ThemedText style={styles.requirementText}>
          • Must be a .fit file (not .gpx, .tcx, or .csv)
        </ThemedText>
        <ThemedText style={styles.requirementText}>
          • From cycling computer or power meter
        </ThemedText>
        <ThemedText style={styles.requirementText}>
          • Contains power and pedaling data
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <ThemedText style={styles.loadingText}>Selecting file...</ThemedText>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={pickFitFile}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.buttonText}>
              📁 Select .fit File Only
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
            Size: {(selectedFile.size! / 1024).toFixed(1)} KB
          </ThemedText>
          <ThemedText style={styles.fileType}>
            Type: {selectedFile.mimeType || 'application/octet-stream'}
          </ThemedText>
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
  requirementBox: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  requirementTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#B8860B',
  },
  requirementText: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.9,
    marginBottom: 4,
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
    fontFamily: 'monospace',
    opacity: 0.9,
  },
  fileSize: {
    fontSize: 12,
    opacity: 0.7,
  },
  fileType: {
    fontSize: 12,
    opacity: 0.7,
  },
});