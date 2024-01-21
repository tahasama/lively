// HomeScreen.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TouchableHighlight,
  Platform,
} from "react-native";
import ConversationItem from "./components/ConversationItem";
import { useAuth } from "../AuthProvider/AuthProvider";
import CreateGroup from "./components/CreateGroup";
import SearchUser from "./components/SearchUser";
import { collection, getDocs, or, query, where } from "firebase/firestore";
import { db } from "../firebase";
import RecordingSounds from "../conversation/component/RecordingSounds";
import CameraUsage from "../conversation/component/CameraUsage";
import VideoRecorder from "../conversation/component/VideoRecorder";
import { useImage } from "../AuthProvider/ImageProvider";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

interface Message {
  text: string;
  sender: string;
  createdAt: Date;
}

interface Conversation {
  id: string;
  name: string;
  users: any[];
  dateCreated: Date;
  messages: Message[];
  creator: any;
}

interface HomeScreenProps {
  navigation: any;
  route: any;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Can use this function below or use Expo's Push Notification Tool from: https://expo.dev/notifications
async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "Original Title",
    body: "And here is the body!",
    data: { someData: "goes here" },
  };
  console.log("🚀 ~ sendPushNotification ~ message:", message);

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
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
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
    console.log(token.data);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token.data;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const {
    user,
    converations,
    setConverations,
    notification,
    notificationR,
    setNotification,
    setNotificationR,
    expoPushToken,
    setExpoPushToken,
    darkMode,
  } = useAuth();

  const { getHome, setGetHome } = useImage();
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setRefreshing] = useState(false);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const getCoversations = async () => {
    setLoading(true);
    const groupsCollection = collection(db, "groups");

    // Check if a group with these users already exists

    const q = query(
      groupsCollection,
      or(
        where("creator.id", "==", user?.id),
        where("users", "array-contains", user?.id)
      )
    );

    const querySnapshot = await getDocs(q);

    const foundGroup = [];
    querySnapshot.forEach((doc) => {
      foundGroup.push({ id: doc.id, ...doc.data() });
    });
    setConverations(foundGroup);
    setLoading(false);
  };

  useEffect(() => {
    user && getCoversations();
    setTimeout(() => {
      setLoading(false);
      setGetHome(false);
    }, 1200);
  }, [getHome, user]);

  useEffect(() => {
    (notification.type === "message" || notification.type === "create") &&
      navigation.navigate("Conversation", {
        conversationId: notification.conversationId,
        title: notification.title,
      });
    (notificationR.type === "remove" ||
      notification.type === "remove" ||
      notification.type === "create" ||
      notificationR.type === "create") &&
      route.name === "Home" &&
      getCoversations().then(() => setNotificationR(""));
    //

    return () => {
      setNotification("");
    };
  }, [notification, notificationR]);

  const onRefresh = async () => {
    setRefreshing(true);

    await getCoversations();

    setRefreshing(false);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loading,
          {
            backgroundColor: darkMode ? "#212121" : "#ececec",
          },
        ]}
      >
        <ActivityIndicator size={60} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: darkMode ? "#212121" : "#ececec",
        },
      ]}
    >
      <View style={styles.search}>
        <SearchUser
          navigation={navigation}
          icon={""}
          conversationId={""}
          title={""}
        />
      </View>
      <View style={styles.add}>
        <CreateGroup />
      </View>
      {converations.length !== 0 ? (
        <FlatList
          style={{ marginTop: 4 }}
          data={converations}
          keyExtractor={(converation) => converation.id}
          renderItem={({ item }) => (
            <ConversationItem conversation={item} navigation={navigation} />
          )}
          // horizontal
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.empty}>
          <Text
            style={[styles.emptyText, { color: !darkMode ? "black" : "white" }]}
          >
            Look for you friends or create a group and add them!
          </Text>
        </View>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 6,
  },
  search: {
    position: "absolute",
    bottom: 10,
    left: 10,
    zIndex: 2,
  },
  add: {
    position: "absolute",
    bottom: 10,
    right: 10,
    zIndex: 2,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 22,
    // fontStyle: "italic",
    fontWeight: "700",
    textAlign: "center",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;
