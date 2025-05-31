import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { getAuth } from "firebase/auth";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function TabOneScreen() {
  const [currentUser, setCurrentUser] = useState(getAuth().currentUser);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe(); // cleanup
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Hello, {currentUser? currentUser.email:'Guest'}</Text>
      {currentUser && (
        <TouchableOpacity onPress={() => auth.signOut()} style={styles.button}>
          <Text style={styles.text}>Sign out</Text>
        </TouchableOpacity>
      )}
      {!currentUser && (
        <TouchableOpacity onPress={() => router.push('/login')} style={styles.button}>
          <Text style={styles.text}>Log in</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    // justifyContent: "center",
    backgroundColor: "#E8EAF6",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  button: {
    width: "90%",
    marginVertical: 10,
    backgroundColor: "#5C6BC0",
    padding: 10,
    borderRadius: 15,     
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5C6BC0", 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  text: {
    color: "#FFFFFF", // Maintained white for clear visibility
    fontSize: 18, // Slightly larger for emphasis
    fontWeight: "600", // Semi-bold for a balanced weight
  },
});
