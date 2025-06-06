import { SafeAreaView, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

export default function TabTwoScreen() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  const isFocused = useIsFocused();

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
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <MaterialIcons name="flip-camera-ios" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
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
});