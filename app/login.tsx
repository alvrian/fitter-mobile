import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../FirebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { router } from "expo-router";

const index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const signIn = async () => {
    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      if (user) router.replace("/(tabs)");
    } catch (error: any) {
      console.log(error);
      alert("Sign in failed: " + error.message);
    }
  };
  const signUp = async () => {
    try {
      const user = await createUserWithEmailAndPassword(auth, email, password);
      if (user) router.replace("/(tabs)");
    } catch (error: any) {
      console.log(error);
      alert("Sign in failed: " + error.message);
    }
  };

  const guestEnter = async () => {
    try {
      router.replace("/(tabs)");
    } catch (error: any) {
      console.log(error);
      alert("Guest login failed: " + error.message);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        {!isRegister ? (
          <Text style={styles.title}>Login</Text>
        ) : (
          <Text style={styles.title}>Register</Text>
        )}
        <TextInput
          style={styles.textInput}
          placeholder="email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.textInput}
          placeholder="password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {isRegister ? (
          <TouchableOpacity style={styles.button} onPress={signUp}>
            <Text style={styles.text}>Register</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={signIn}>
            <Text style={styles.text}>Login</Text>
          </TouchableOpacity>
        )}

        {isRegister ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: "white", fontSize: 18 }}>
              have an account already?{" "}
            </Text>
            <TouchableOpacity onPress={() => setIsRegister(false)}>
              <Text style={styles.text}>Log in</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: "white", fontSize: 16 }}>
              don't have an account yet?{" "}
            </Text>
            <TouchableOpacity onPress={() => setIsRegister(true)}>
              <Text style={styles.text}>Make an Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={{ display: 'flex', paddingBottom: 50, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <View style={styles.separator} />
        <View>
          <TouchableOpacity onPress={guestEnter}>
            <Text style={{ color: "white", fontSize: 18 , fontWeight: "600" }}>
              Continue as Guest
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "black",
  },
  topContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 40,
    color: "white",
  },
  textInput: {
    height: 50,
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderColor: "#E8EAF6",
    borderWidth: 2,
    borderRadius: 12,
    marginVertical: 15,
    paddingHorizontal: 18,
    fontSize: 16,
    color: "#3C4858",
  },
  button: {
    width: "90%",
    height: 50,
    marginVertical: 15,
    backgroundColor: "#08214C",
    padding: 10,
    borderRadius: 12,
    marginTop: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "90%",
    backgroundColor: "white",
  },
});
