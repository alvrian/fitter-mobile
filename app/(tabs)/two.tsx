import { SafeAreaView, StyleSheet, TouchableOpacity, Text, View, Image, Alert, ActivityIndicator, Modal } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { firebaseMLService, RecognitionResult } from '../../FirebaseMLService';

export default function TabTwoScreen() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [takenImageUri, setTakenImageUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const isFocused = useIsFocused();
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Initialize Firebase ML Service
  useEffect(() => {
    firebaseMLService.initialize();
  }, []);

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const recognizeFood = async (imageUri: string) => {
    try {
      setIsProcessing(true);
      setRecognitionResult(null);

      const result = await firebaseMLService.recognizeFood(imageUri);
      setRecognitionResult(result);
      setShowResultModal(true);
      
      console.log(`Recognized: ${result.label} with confidence: ${result.confidence}`);
    } catch (error) {
      console.error('Error during food recognition:', error);
      Alert.alert('Error', 'Failed to recognize food. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        console.log('Original photo URI:', photo.uri);

        // Resize to 192x192 for TensorFlow Lite model
        const manipulatedImage = await manipulateAsync(
          photo.uri,
          [{ resize: { width: 192, height: 192 } }],
          { compress: 1, format: SaveFormat.JPEG }
        );
        console.log('Manipulated image URI:', manipulatedImage.uri);
        setTakenImageUri(manipulatedImage.uri);

        // Automatically recognize food after taking picture
        await recognizeFood(manipulatedImage.uri);

      } catch (error) {
        console.error('Failed to take or manipulate picture:', error);
        Alert.alert('Error', 'Failed to take or process picture. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Camera reference is not available.');
    }
  };

  const retakePicture = () => {
    setTakenImageUri(null);
    setRecognitionResult(null);
    setShowResultModal(false);
  };

  const closeModal = () => {
    setShowResultModal(false);
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isFocused) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <MaterialIcons name="flip-camera-ios" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePicture} disabled={isProcessing}>
            <MaterialIcons name="camera-alt" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
      
      {takenImageUri && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewText}>Food Recognition Results:</Text>
          <Image source={{ uri: takenImageUri }} style={styles.previewImage} />
          
          {isProcessing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.processingText}>Analyzing food...</Text>
            </View>
          )}
          
          <TouchableOpacity style={styles.retakeButton} onPress={retakePicture}>
            <Text style={styles.retakeButtonText}>Take Another Photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Result Modal */}
      <Modal
        visible={showResultModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Food Recognition Result</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {recognitionResult && (
              <View style={styles.resultContent}>
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>{recognitionResult.label}</Text>
                  <Text style={styles.confidenceText}>
                    Confidence: {(recognitionResult.confidence * 100).toFixed(1)}%
                  </Text>
                </View>
                
                {recognitionResult.calories !== undefined && (
                  <View style={styles.nutritionContainer}>
                    <Text style={styles.nutritionTitle}>Nutritional Information</Text>
                    <View style={styles.nutritionGrid}>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{recognitionResult.calories}</Text>
                        <Text style={styles.nutritionLabel}>Calories</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{recognitionResult.protein}g</Text>
                        <Text style={styles.nutritionLabel}>Protein</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{recognitionResult.carbs}g</Text>
                        <Text style={styles.nutritionLabel}>Carbs</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{recognitionResult.fat}g</Text>
                        <Text style={styles.nutritionLabel}>Fat</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingBottom: 40,
  },
  button: {
    alignSelf: 'flex-end',
    padding: 10,
    marginHorizontal: 20, 
  },
  permissionText: {
    textAlign: 'center',
    color: 'white',
    paddingHorizontal: 20,
  },
  permissionButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  previewContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#333',
  },
  previewText: {
    color: 'white',
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewImage: {
    width: 224,
    height: 224,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginBottom: 15,
  },
  processingContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  processingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  retakeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 15,
  },
  retakeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  resultContent: {
    alignItems: 'center',
  },
  foodInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  confidenceText: {
    fontSize: 16,
    color: '#666',
  },
  nutritionContainer: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalActions: {
    marginTop: 20,
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
