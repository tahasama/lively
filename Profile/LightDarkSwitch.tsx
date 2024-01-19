import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Entypo, Feather } from "@expo/vector-icons";

const LightDarkSwitch = ({ setDarkMode, isDarkMode }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setDarkMode(false)}
        style={styles.button}
      >
        <LinearGradient colors={["#ffffff", "#f0f0f0"]} style={styles.gradient}>
          <Entypo name="light-up" size={24} color="black" />
          <Text>Light Mode</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setDarkMode(true)} style={styles.button}>
        <LinearGradient colors={["#4d4d4d", "#000000"]} style={styles.gradient}>
          <Feather name="moon" size={24} color="white" />
          <Text style={{ color: "white" }}>Dark Mode</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
  },
});

export default LightDarkSwitch;
