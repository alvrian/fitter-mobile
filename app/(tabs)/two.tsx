import { SafeAreaView, StyleSheet, TouchableOpacity, Text, View, Image, Alert } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'; // Import for image manipulation

// The 'react-native-fast-tflite' import is commented out as its usage for
// processing the image into a tensor is beyond the scope of this request,
// which focuses on taking and saving the picture URI.
// import { loadTensorflowModel } from 'react-native-fast-tflite';

export default function TabTwoScreen() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [takenImageUri, setTakenImageUri] = useState<string | null>(null);

  const isFocused = useIsFocused();
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        console.log('Original photo URI:', photo.uri);

        const manipulatedImage = await manipulateAsync(
          photo.uri,
          [{ resize: { width: 255, height: 255 } }],
          { compress: 1, format: SaveFormat.JPEG }
        );
        console.log('Manipulated image URI:', manipulatedImage.uri);
        setTakenImageUri(manipulatedImage.uri);

      } catch (error) {
        console.error('Failed to take or manipulate picture:', error);
        Alert.alert('Error', 'Failed to take or process picture. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Camera reference is not available.');
    }
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
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <MaterialIcons name="camera-alt" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
      {takenImageUri && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewText}>Taken Image (255x255):</Text>
          <Image source={{ uri: takenImageUri }} style={styles.previewImage} />
        </View>
      )}
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
  },
  previewImage: {
    width: 255,
    height: 255,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
});
