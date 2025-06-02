import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator, // For loading state
} from "react-native";
import { auth, db } from "../FirebaseConfig"; // Assuming this path is correct and Firebase is initialized
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged, // Added for listening to auth state
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // For adding user data
import { router } from "expo-router"; // Assuming expo-router is set up

// Main component
const AuthScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState(""); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setTimeout(() => router.replace("/(tabs)"), 0);
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []); 

  const addUserToDatabase = async (userId: string, userName: string, userEmail: string) => {
    if (!userId) {
      console.error("User ID is not available for addUserToDatabase");
      setError("Failed to register user details: No user ID.");
      return;
    }
    try {
      await setDoc(doc(db, "users", userId), {
        email: userEmail,
        name: userName,
        createdAt: serverTimestamp(), 
      });
    } catch (dbError: any) {
      console.error("Error adding user to database: ", dbError);
      setError("Failed to save user details: " + dbError.message);
    }
  };

  const signIn = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setIsSubmitting(true);
    setError(""); 
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch (signInError: any) {
      console.error("Sign in failed: ", signInError);
      setError("Sign in failed: " + signInError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const signUp = async () => {
    if (!email || !password || (isRegister && !name)) {
        setError("Please fill in all fields.");
        return;
    }
    setIsSubmitting(true);
    setError(""); 
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await addUserToDatabase(userCredential.user.uid, name, email);
        // onAuthStateChanged will handle navigation
        // if (userCredential.user) router.replace("/(tabs)");
      }
    } catch (signUpError: any) {
      console.error("Sign up failed: ", signUpError);
      setError("Sign up failed: " + signUpError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guest entry function
  const guestEnter = () => {
    setError("");
    router.replace("/(tabs)");
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={{ color: "white", marginTop: 10 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        <Text style={styles.title}>{isRegister ? "Register" : "Login"}</Text>

        {/* Email Input */}
        <TextInput
          style={styles.textInput}
          placeholder="Email"
          placeholderTextColor="#A0A0A0"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Name Input (only for registration) */}
        {isRegister && (
          <TextInput
            style={styles.textInput}
            placeholder="Name"
            placeholderTextColor="#A0A0A0"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        )}

        {/* Password Input */}
        <TextInput
          style={styles.textInput}
          placeholder="Password"
          placeholderTextColor="#A0A0A0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Error Message Display */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Action Button (Login/Register) */}
        <TouchableOpacity
          style={styles.button}
          onPress={isRegister ? signUp : signIn}
          disabled={isSubmitting} 
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>{isRegister ? "Register" : "Login"}</Text>
          )}
        </TouchableOpacity>

        {/* Toggle between Login and Register */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>
            {isRegister ? "Already have an account? " : "Don't have an account yet? "}
          </Text>
          <TouchableOpacity onPress={() => { setIsRegister(!isRegister); setError(""); }}>
            <Text style={styles.toggleLinkText}>
              {isRegister ? "Log in" : "Make an Account"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Guest Entry Section */}
      <View style={styles.guestContainer}>
        <View style={styles.separator} />
        <TouchableOpacity onPress={guestEnter} disabled={isSubmitting}>
          <Text style={styles.guestText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AuthScreen; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black", 
  },
  centered: { 
    justifyContent: "center",
    alignItems: "center",
  },
  topContainer: {
    flex: 1, 
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: "5%", 
  },
  title: {
    fontSize: 32, 
    fontWeight: "800",
    marginBottom: 40,
    color: "white",
  },
  textInput: {
    height: 50,
    width: "100%", // Use full width of parent
    backgroundColor: "#2C2C2E", // Darker input background
    borderColor: "#4A4A4A", // Subtle border
    borderWidth: 1,
    borderRadius: 12,
    marginVertical: 10, // Adjusted margin
    paddingHorizontal: 18,
    fontSize: 16,
    color: "white", // White text for dark input
  },
  button: {
    width: "100%",
    height: 50,
    marginVertical: 20, // Adjusted margin
    backgroundColor: "#0A84FF", // iOS blue, for example
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { // Renamed from 'text' for clarity
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  errorText: {
    color: "#FF3B30", // iOS error red
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
    width: '90%',
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  toggleText: {
    color: "rgba(255, 255, 255, 0.7)", // Lighter white
    fontSize: 16,
  },
  toggleLinkText: {
    color: "#0A84FF", // iOS blue
    fontSize: 16,
    fontWeight: "600",
  },
  guestContainer: {
    paddingBottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  separator: {
    marginBottom: 20, // Space before guest button
    height: 1,
    width: "90%",
    backgroundColor: "#4A4A4A", // Subtle separator
  },
  guestText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
