import React, { useState, useEffect, useRef } from "react";
import { Text, View, Button, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "./AuthProvider/AuthProvider";
import RegisterScreen from "./auth/Register";
import LoginScreen from "./auth/Login";
import { createStackNavigator as createStackNav } from "@react-navigation/stack";
import LogOut from "./auth/LogOut";
import Profile from "./Profile/Profile";
import HomeScreen from "./home/Home";
import ConversationScreen from "./conversation/Conversation";
import AddUsers from "./conversation/component/AddUsers";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createStackNav();

const Index = () => {
  const { user, darkMode, setDarkMode } = useAuth();
  useEffect(() => {
    const getMode = async () => {
      const storedUserData: any = await AsyncStorage.getItem("modeData");
      console.log("🚀 ~ getMode ~ storedUserData:", storedUserData);
      setDarkMode(JSON.parse(storedUserData));
    };
    getMode();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? "Home" : "Login"}>
        {!user || user === null ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={({ route }) => ({
                headerStyle: {
                  backgroundColor: darkMode ? "#262626" : "#f2f2f2",
                },
                headerTintColor: !darkMode ? "#262626" : "#f2f2f2",
              })}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={({ route }) => ({
                headerStyle: {
                  backgroundColor: darkMode ? "#262626" : "#f2f2f2",
                },
                headerTintColor: !darkMode ? "#262626" : "#f2f2f2",
              })}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={({ route }) => ({
                headerStyle: {
                  backgroundColor: darkMode ? "#262626" : "#f2f2f2",
                },
                headerTintColor: !darkMode ? "#262626" : "#f2f2f2",
                headerRight: () => (
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 20,
                      alignItems: "center",
                    }}
                  >
                    <Profile />
                    <LogOut />
                  </View>
                ),
              })}
            />
            <Stack.Screen
              name="Conversation"
              component={ConversationScreen}
              initialParams={{
                conversationId: "",
                title: "",
                participants: [],
              }}
              options={({ route }) => ({
                headerStyle: {
                  backgroundColor: darkMode ? "#262626" : "#f2f2f2",
                },
                headerTintColor: !darkMode ? "#262626" : "#f2f2f2",
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
function createStackNavigator() {
  throw new Error("Function not implemented.");
}
