import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LoginScreen from "./screens/auth/Login";
import RegisterScreen from "./screens/auth/Register";
import HomeScreen from "./screens/home/Home";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import ConversationScreen from "./screens/conversation/Conversation";
import { useAuth } from "./AuthProvider/AuthProvider";
import AddUsers from "./screens/conversation/component/AddUsers";
import LogOut from "./screens/auth/LogOut";
import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { doc, updateDoc } from "firebase/firestore";
import Profile from "./screens/Profile/Profile";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const Stack = createStackNavigator();

const Index = () => {
  const { user } = useAuth();
  const { setExpoPushToken, setNotification, setNotificationR } = useAuth();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification: any) => {
        console.log(
          "🚀 ~ file: Notifications.tsx:29 ~ Notifications.addNotificationReceivedListener ~ notification:",
          notification.request.content.data.conversationId
        );
        setNotificationR(notification.request.content.data);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
        setNotification(response.notification.request.content.data);
        setNotificationR(""); //to get back if remove not navigate
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
        })
      ).data;
      console.log(token);
      console.log(
        "🚀 ~ file: Index.tsx:101 ~ registerForPushNotificationsAsync ~ user && (!user.expoPushToken || user.expoPushToken !== token:",
        user && (!user.expoPushToken || user.expoPushToken !== token)
      );
      if (user && (!user.expoPushToken || user.expoPushToken !== token)) {
        const userDocRef = doc(db, "users", user.id);

        const xxx = await updateDoc(userDocRef, { expoPushToken: token });
        console.log(
          "🚀 ~ file: Index.tsx:108 ~ registerForPushNotificationsAsync ~ xxx:",
          xxx
        );
      }
    } else {
      alert("Must use physical device for Push Notifications");
    }

    return token;
  }

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
