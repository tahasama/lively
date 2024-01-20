import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Entypo, Feather } from "@expo/vector-icons";

const LightDarkSwitch = ({ setDarkMode, isDarkMode }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setDarkMode(!isDarkMode)}
        style={styles.button}
      >
        <LinearGradient
          colors={["#ffffff", "#f0f0f0"]}
          style={[styles.gradient, styles.leftButton]}
        >
          <Entypo name="light-up" size={24} color="black" />
          <Text>Light Mode</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setDarkMode(true)} style={styles.button}>
        <LinearGradient
          colors={["#4d4d4d", "#000000"]}
          style={[styles.gradient, styles.rightButton]}
        >
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
    justifyContent: "center",
    marginVertical: 10,
    width: "100%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    padding: 10,
    flex: 1,
    borderBottomStartRadius: 20,
  },
  leftButton: {
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  rightButton: {
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
});

export default LightDarkSwitch;
