import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import LoginScreen from "./screens/Login";
import RegisterScreen from "./screens/Register";
import HomeScreen from "./screens/Home";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import ConversationScreen from "./screens/Conversation";
import { AuthProvider, useAuth } from "./AuthProvider/AuthProvider";
import Index from "./Index";

export default function App() {
  return (
    <AuthProvider>
      <Index />
    </AuthProvider>
  );
}
