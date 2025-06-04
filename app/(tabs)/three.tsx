import { StyleSheet, TouchableOpacity, Image, TextInput, Alert } from "react-native";
import { Text, View } from "@/components/Themed";
import { getAuth } from "firebase/auth";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { db } from "../../FirebaseConfig";
import { query, collection, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";


export default function TabOneScreen() {
  const [currentUser, setCurrentUser] = useState(getAuth().currentUser);
  const [name, setName] = useState("");
  const auth = getAuth();
  const usersCollectionRef = collection(db, "user");
  const [height, setHeight] = useState(0);
  const [age, setAge] = useState(0);
  const [userDocId, setUserDocId] = useState<string | null>(null);


  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState("");
  const [editableHeight, setEditableHeight] = useState(""); 
  const [editableAge, setEditableAge] = useState("");       

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (!user) { 
        setName("");
        setAge(0);
        setHeight(0);
        setUserDocId(null);
        setIsEditing(false); 
      }
    });
    return () => unsubscribe();
  }, [auth]); 

  const fetchData = useCallback(async (userid: string) => {
    if (userid) {
      const q = query(usersCollectionRef, where("userid", "==", userid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDocument = querySnapshot.docs[0]; 
        setUserDocId(userDocument.id); 
        const data = userDocument.data();
        setName(data.name || "N/A");
        setHeight(data.height || 0);
        setAge(data.age || 0); 
      } else {
        console.log("No profile document found for userid:", userid);
        setName("Profile not set up"); 
        setHeight(0);
        setAge(0);
        setUserDocId(null);
      }
    } else {
      setName(""); setHeight(0); setAge(0); setUserDocId(null);
    }
  }, [usersCollectionRef]);
  useFocusEffect(
    useCallback(() => {
      if (currentUser?.uid) {
        fetchData(currentUser.uid);
      } else {
        setName("");
        setAge(0);
        setHeight(0);
        setUserDocId(null);
        setIsEditing(false); 
      }
    }, [currentUser, fetchData]) 
  );

  const handleEdit = () => {
    setEditableName(name === "Profile not set up" || name === "N/A" ? "" : name);
    setEditableHeight(height ? String(height) : "");
    setEditableAge(age ? String(age) : "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveChanges = async () => {
    if (!currentUser || !userDocId) {
      Alert.alert("Error", "Cannot save profile. User session or profile document ID not found.");
      return;
    }

    if (!editableName.trim()) {
        Alert.alert("Validation Error", "Name cannot be empty.");
        return;
    }
    const numHeight = parseFloat(editableHeight);
    const numAge = parseInt(editableAge, 10);

    if (editableHeight.trim() && (isNaN(numHeight) || numHeight <= 0)) {
        Alert.alert("Validation Error", "Please enter a valid height (must be a positive number).");
        return;
    }
    if (editableAge.trim() && (isNaN(numAge) || numAge <= 0)) {
        Alert.alert("Validation Error", "Please enter a valid age (must be a positive number).");
        return;
    }

    try {
      const userProfileRef = doc(db, "user", userDocId);
      await updateDoc(userProfileRef, {
        name: editableName.trim(),
        height: editableHeight.trim() ? numHeight : 0, 
        age: editableAge.trim() ? numAge : 0, 
      });

      setName(editableName.trim());
      setHeight(editableHeight.trim() ? numHeight : 0);
      setAge(editableAge.trim() ? numAge : 0);

      setIsEditing(false); 
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile: ", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {currentUser ? (
          <>
            {isEditing ? (
              <View style={styles.editContainer}>
                <Text style={styles.editTitle}>Edit Profile</Text>
                <TextInput
                  style={styles.input}
                  value={editableName}
                  onChangeText={setEditableName}
                  placeholder="Full Name"
                  autoCapitalize="words"
                />
                <TextInput
                  style={styles.input}
                  value={editableHeight}
                  onChangeText={setEditableHeight}
                  placeholder="Height (cm)"
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  value={editableAge}
                  onChangeText={setEditableAge}
                  placeholder="Age (years)"
                  keyboardType="numeric"
                />
                <View style={styles.editActions}>
                  <TouchableOpacity
                    onPress={handleSaveChanges}
                    style={[styles.button, styles.saveButton]}
                  >
                    <Text style={styles.buttonText}>Save Changes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCancelEdit}
                    style={[styles.button, styles.cancelButton]}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.profileHeader}>
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {(name && name !== "Profile not set up" && name !== "N/A" ? name.charAt(0) : (currentUser.email || "U").charAt(0)).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.userName}>{name || "Loading..."}</Text>
                  <Text style={styles.userEmail}>{currentUser.email}</Text>
                  <Text style={styles.userInfo}>
                    Height: {height ? `${height} cm` : "Not set"}
                  </Text>
                  <Text style={styles.userInfo}>
                    Age: {age ? `${age} years` : "Not set"}
                  </Text>
                </View>

                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    onPress={handleEdit}
                    style={[styles.button, styles.editButton]}
                  >
                    <Text style={styles.buttonText}>Edit Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                        auth.signOut().catch(error => {
                            console.error("Sign out error", error);
                            Alert.alert("Error", "Failed to sign out.");
                        });
                    }}
                    style={[styles.button, styles.signOutButton]}
                  >
                    <Text style={styles.buttonText}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </>
        ) : (
          <View style={styles.guestContainer}>
            <Text style={styles.guestText}>
              Welcome! Please log in to see your profile.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/login")} 
              style={[styles.button, styles.logInButton]}
            >
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

//for future dev, its 50% vibe coded, so good luck

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2F5", 
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
    width: '100%',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60, 
    backgroundColor: "#A0A0A0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  avatarText: {
    fontSize: 48,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  userName: {
    fontSize: 26,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 16,
    color: "#7F8C8D",
    marginBottom: 10,
  },
  userInfo: { 
    fontSize: 16,
    color: "#555555",
    marginTop: 5,    
  },
  actionsContainer: {
    width: "95%",
    marginTop: 40, 
  },
  button: {
    width: "100%",
    marginVertical: 10,
    paddingVertical: 15, 
    paddingHorizontal: 25,
    borderRadius: 25, 
    alignItems: "center",
    justifyContent: "center",
    flexDirection: 'row',
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, 
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17, 
    fontWeight: "500",
    marginLeft: 8, 
  },
  editButton: { 
    backgroundColor: "#3498DB", 
    shadowColor: "#3498DB",
  },
  signOutButton: { 
    backgroundColor: "darkred", 
  },
  logInButton: { 
    backgroundColor: "#2ECC71",
  },
  guestContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: '100%',
    paddingHorizontal: 20,
  },
  guestText: {
    fontSize: 18, 
    color: "#34495E",
    marginBottom: 25, 
    textAlign: "center",
    lineHeight: 28, 
  },

  //edit mode
  editContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 25, 
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 55, 
    backgroundColor: '#F8F9FA', 
    borderRadius: 8,
    paddingHorizontal: 18,
    marginBottom: 18, 
    fontSize: 16,
    color: '#333333', 
    borderWidth: 1,
    borderColor: '#CED4DA',
  },
  editActions: { 
    marginTop: 15, 
  },
  saveButton: { 
    backgroundColor: '#28A745', 
    shadowColor: '#28A745',
  },
  cancelButton: { 
    backgroundColor: '#6C757D', 
    shadowColor: '#6C757D',
  },
});