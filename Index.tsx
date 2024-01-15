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

const Stack = createStackNav();

const Index = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? "Home" : "Login"}>
        {!user || user === null ? (
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
