import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LoginScreen from "./screens/auth/Login";
import RegisterScreen from "./screens/auth/Register";
import HomeScreen from "./screens/home/Home";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import ConversationScreen from "./screens/conversation/Conversation";
import { useAuth } from "./AuthProvider/AuthProvider";
import AddUsers from "./screens/conversation/component/AddUsers";
import LogOut from "./screens/auth/LogOut";

const Stack = createStackNavigator();

const Index = () => {
  const { user } = useAuth();
  console.log("🚀 ~ file: Index.tsx:20 ~ Index ~ user:", user);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? "Home" : "Login"}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={({ route }) => ({
                headerRight: () => <LogOut />,
              })}
            />
            <Stack.Screen
              name="Conversation"
              component={ConversationScreen}
              options={({ route }) => ({
                headerRight: () => <AddUsers route={route} />,
              })}
            />
            <Stack.Screen name="Logout" component={LogOut} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Index;
