import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import LoginScreen from "./screens/auth/Login";
import RegisterScreen from "./screens/auth/Register";
import HomeScreen from "./screens/home/Home";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import ConversationScreen from "./screens/conversation/Conversation";
import { AuthProvider, useAuth } from "./AuthProvider/AuthProvider";
import Index from "./Index";
import { ImageProvider } from "./AuthProvider/ImageProvider";
import * as Updates from "expo-updates";

export default function App() {
  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      // You can also add an alert() to see the error message in case of an error when fetching updates.
      console.log(`Error fetching latest Expo update: ${error}`);
    }
  }

  useEffect(() => {
    onFetchUpdateAsync();
  }, []);

  return (
    <AuthProvider>
      <ImageProvider>
        <Index />
      </ImageProvider>
    </AuthProvider>
  );
}
