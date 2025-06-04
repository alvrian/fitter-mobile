import { StyleSheet, TouchableOpacity, Dimensions, TextInput , ScrollView } from "react-native"; 
import { Text, View } from "@/components/Themed";
import { getAuth } from "firebase/auth";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../FirebaseConfig"; 
import { query, collection, where, getDocs, orderBy, addDoc } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit";

export default function TabOneScreen() {
  const [currentUser, setCurrentUser] = useState(getAuth().currentUser);
  const [name, setName] = useState("");
  const [age, setAge] = useState(0);
  const [height, setHeight] = useState(0);
  const [userDataList, setUserDataList] = useState<any[]>([]);
  const [currentBmi, setCurrentBmi] = useState<string>("N/A");
  const [newWeight, setNewWeight] = useState("");

  const [weightChartData, setWeightChartData] = useState<{
    labels: string[];
    datasets: {
      data: number[];
      color?: (opacity: number) => string;
      strokeWidth?: number;
    }[];
  } | null>(null);

  const auth = getAuth();
  const ref = collection(db, "user");
  const ref2 = collection(db, "weight");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setName("");
      setAge(0);
      setHeight(0);
      setUserDataList([]); 
      setWeightChartData(null);
      setCurrentBmi("N/A"); 
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async (userid: string) => {
    if (userid) {
      try {
        const q = query(ref, where("userid", "==", userid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            setName(doc.data().name);
            setAge(doc.data().age || 0);
            setHeight(doc.data().height || 0);
          });
        } else {
          setName("");
          setAge(0);
          setHeight(0);
        }

        const q2 = query(
          ref2,
          where("userid", "==", userid),
          orderBy("date", "desc") 
        );
        const querySnapshot2 = await getDocs(q2);
        const items: any[] = [];
        querySnapshot2.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setUserDataList(items);
        
      } catch (error) {
        console.error("Error fetching data: ", error);
        setName("");
        setAge(0);
        setHeight(0);
        setUserDataList([]);
      }
    } else {
      setName("");
      setAge(0);
      setHeight(0);
      setUserDataList([]);
      setCurrentBmi("N/A");
    }
  };

  const handleScreenFocus = useCallback(() => {
    if (currentUser) {
      fetchData(currentUser.uid);
    } else {
      setName("");
      setAge(0);
      setHeight(0);
      setUserDataList([]);
      setWeightChartData(null);
    }
  }, [currentUser]); 

  useEffect(() => {
    if (height > 0 && userDataList.length > 0) {
      const latestWeightData = userDataList[0]; 
      if (latestWeightData && typeof latestWeightData.weight === 'number') {
        const weightInKg = latestWeightData.weight;
        const heightInMeters = height / 100; 

        if (heightInMeters > 0) { 
          const bmi = weightInKg / (heightInMeters * heightInMeters);
          setCurrentBmi(bmi.toFixed(1)); 
        } else {
          setCurrentBmi("N/A");
        }
      } else {
        setCurrentBmi("N/A"); 
      }
    } else {
      setCurrentBmi("N/A"); 
    }
  }, [userDataList]);

  useFocusEffect(handleScreenFocus);
  useEffect(() => {
    if (currentUser && userDataList && userDataList.length > 0) {
      const reversedData = [...userDataList].reverse();

      const chartPoints: { label: string; weight: number }[] = [];
      reversedData.forEach(item => {
        if (item.date && typeof item.weight === 'number') {
          let dateObj;
          if (item.date.toDate) {
            dateObj = item.date.toDate();
          } else {
            dateObj = new Date(item.date);
          }

          if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
            chartPoints.push({
              label: `${dateObj.getMonth() + 1}/${dateObj.getDate()}`, 
              weight: item.weight
            });
          }
        }
      });

      if (chartPoints.length > 0) {
        const displayPoints = chartPoints.slice(-10);

        setWeightChartData({
          labels: displayPoints.map(p => p.label),
          datasets: [
            {
              data: displayPoints.map(p => p.weight),
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, 
              strokeWidth: 2
            }
          ]
        });
      } else {
        setWeightChartData(null);
      }
    } else {
      setWeightChartData(null); 
    }
  }, [userDataList, currentUser]); 

  const chartConfigMinimal = {
    backgroundColor: "#FFFFFF", 
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",  
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, 
    labelColor: (opacity = 1) => `rgba(50, 50, 50, ${opacity})`, 
    style: {
      borderRadius: 10,
    },
    propsForDots: {
      r: "4", 
      strokeWidth: "2",
      stroke: "#007AFF", 
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "#EFEFEF", 
    }
  };

  const addTodayWeight = async (userid: string) => {
    if (newWeight && !isNaN(parseFloat(newWeight))) {
      const weight = parseFloat(newWeight);
      const date = new Date();
      try {
        await addDoc(ref2, {
          userid: userid,
          weight: weight,
          date: date
        });
        setNewWeight("");
        fetchData(userid);
      } catch (error) {
        console.error("Error adding weight data: ", error);
      }
    }
  }


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40}} showsVerticalScrollIndicator={false} style = {{width: '100%'}}>
      <Text style={{width: "90%",fontSize: 20,fontWeight: "bold", marginBottom: 40, textAlign: 'left'}}>
        Hello, {currentUser ? `${name}` : "Guest"}
      </Text>
      {!currentUser && (
        <View style={styles.userInfoCard}>
          <Text style={styles.infoText}>
            Please log in to see your profile.
          </Text>
        </View>
      )}
      {currentUser && (
        <View style={styles.userInfoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Age:</Text>
            <Text style={styles.infoValue}>
              {age !== 0 ? `${age} years` : "N/A"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Height:</Text>
            <Text style={styles.infoValue}>
              {height !== 0 ? `${height} cm` : "N/A"}
            </Text>
          </View>
          <View style={[styles.infoRow, styles.lastInfoRow]}>
            <Text style={styles.infoLabel}>Current BMI:</Text>
            <Text style={styles.infoValue}>{currentBmi}</Text> 
          </View>
        </View>
        
      )}
      {currentUser && (
      <View style={styles.inputWrapper}>
        <TextInput placeholder="Input Current Weight" value={newWeight} keyboardType="numeric" onChangeText={setNewWeight}
          style={{flex: 1,fontSize: 16,paddingVertical: 6,paddingHorizontal: 10}}/>
        <Text style={{fontSize: 16, marginLeft: 8,color: '#555'}}>
          Kg
        </Text>
        {newWeight != "" && (
          <TouchableOpacity onPress={() => addTodayWeight(currentUser.uid)} style={{marginLeft: 10, padding: 10, backgroundColor: '#007AFF', borderRadius: 8}}>
            <Text style={{fontSize: 16, color: 'white'}}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    )}


      <View style = {styles.userInfoCard}>
      {!currentUser && (
        <Text style={styles.infoText}>
            Please log in to see your weight history.
        </Text>
      )}
      {currentUser && weightChartData && weightChartData.datasets[0].data.length > 0 && (
        <>
          <Text style={styles.chartTitle}>
            Weight History 
          </Text>
          <LineChart
            data={weightChartData}
            width={Dimensions.get("window").width * 0.82}
            height={220}
            yAxisSuffix=" kg"
            yAxisInterval={1} 
            chartConfig= {chartConfigMinimal}
          />
        </>
      )}
      {currentUser && (!weightChartData || (weightChartData && weightChartData.datasets[0].data.length === 0)) && (
        <Text style={styles.infoText}>
          No weight data recorded yet to display a chart.
        </Text>
      )}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
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
  text: { 
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14, 
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  lastInfoRow: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333", 
  },
  infoValue: {
    fontSize: 16,
    textAlign: "right",
    color: "#555555", 
  },
  userInfoCard: {
    width: "90%",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2, 
    },
    shadowOpacity: 0.1, 
    shadowRadius: 3.0,  
    elevation: 3, 
  },
  infoText: {
    fontSize: 16,
    textAlign: "center",
    color: "#777777", 
    marginVertical: 20, 
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
    color: "#333333",
  },
  inputWrapper:{
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
    padding: 20,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#ffffff", 
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2, 
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.0, 
    elevation: 3,
  }
});
