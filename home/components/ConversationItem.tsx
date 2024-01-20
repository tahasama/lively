import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { db, dbr } from "../../firebase";
import RenderUserInformation from "../../conversation/component/renderUserInformation";
import { useAuth } from "../../AuthProvider/AuthProvider";
import {
  get,
  off,
  onChildAdded,
  onChildChanged,
  onValue,
  push,
  ref,
  remove,
  set,
} from "firebase/database";
import {
  FontAwesome5,
  MaterialCommunityIcons,
  FontAwesome,
  Ionicons,
  Entypo,
  Foundation,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface Message {
  text: string;
  sender: string;
  createdAt: any;
}

interface Conversation {
  id: string;
  name: string;
  users: any[];
  dateCreated: Date;
  messages: Message[];
  creator: any;
}

const ConversationItem: React.FC<{
  conversation: Conversation;
  navigation: any;
}> = ({ conversation, navigation }) => {
  const [senderName, setSenderName] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const { user, setNotification, setNotificationR, darkMode } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState([]);
  const [lastMessage, setLatMessage] = useState<any>("");

  useEffect(() => {
    const conversationRef = ref(dbr, `groups/${conversation?.id}/messages`);

    onChildAdded(conversationRef, fetchLastMessage);
    onChildChanged(conversationRef, fetchLastMessage);
    return () => {
      off(conversationRef, "child_added", fetchLastMessage);
      off(conversationRef, "child_changed", fetchLastMessage);
    };
  }, []);

  const fetchLastMessage = async () => {
    const rtdbPath = `groups/${conversation?.id}`;
    const conversationRef = ref(dbr, rtdbPath);
    const conversationSnapshot = await get(conversationRef);

    if (conversationSnapshot.exists()) {
      // const { messages } = conversationSnapshot.val();
      const { messages } = conversationSnapshot.val();
      const messagesArray = Object.values(messages);
      const lastMessage: any = messagesArray[messagesArray.length - 1];

      setLatMessage(lastMessage);
    }
  };

  useEffect(() => {
    getParticipantsExpoPushToken();
    fetchLastMessage();
  }, []);

  const getParticipantsExpoPushToken = async () => {
    const tokens: any = await Promise.all(
      conversation.users?.map(async (participant: any) => {
        try {
          const docSnap = await getDoc(doc(db, "users", participant));
          if (docSnap.exists()) {
            return docSnap.data().expoPushToken;
          }
        } catch (error) {
          console.error("Error fetching user data:", error.message);
          return null;
        }
      })
    );

    setExpoPushToken(tokens);
  };

  const handlePress = () => {
    // Navigate to the ConversationScreen with the conversation details

    navigation.navigate("Conversation", {
      conversationId: conversation?.id,
      title: conversation.name,
      participants: conversation.users,
    });
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const removeDiscussion = async () => {
    // Delete from Firestore

    const firestoreRef = doc(db, "groups", conversation?.id);
    await deleteDoc(firestoreRef);

    // Delete from Realtime Database
    const rtdb = `groups/${conversation?.id}`;
    const conversationRef = ref(dbr, rtdb);

    await remove(conversationRef);

    schedulePushNotification();
    setModalVisible(false);
    setNotification({ type: "remove" });
    // setNotificationR({ type: "remove" }); // to get back if remove not navigate
  };

  function schedulePushNotification() {
    let response = fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: expoPushToken.filter((t) => t !== user.expoPushToken),
        title: `There has been an update in your list`,
        body: `Press notification or pull down in your conversations list to update`,

        data: { conversationId: conversation?.id, type: "remove" },
        // channelId: "vvv",
      }),
    });
  }

  const getMessageContent = (lastMessage: any) => {
    const {
      user,
      file,
      audio,
      image,
      video,
      audioRecord,
      imageRecord,
      recordedVideo,
      text,
    } = lastMessage;

    if (file) return <Ionicons name="attach" size={20} color="skyblue" />;
    if (audio)
      return <MaterialIcons name="audiotrack" size={20} color="skyblue" />;
    if (image) return <Entypo name="image" size={20} color={"skyblue"} />;
    if (video)
      return <Foundation name="play-video" size={22} color="skyblue" />;
    if (audioRecord)
      return (
        <MaterialCommunityIcons name="microphone" size={20} color="skyblue" />
      );
    if (imageRecord)
      return <MaterialCommunityIcons name="camera" size={20} color="skyblue" />;
    if (recordedVideo)
      return <FontAwesome5 name="video" size={16} color="skyblue" />;
    if (text) return text.substring(0, 30); // Display the first 30 characters of text messages

    return "";
  };

  const formattedDate =
    lastMessage && lastMessage.createdAt
      ? new Date(lastMessage.createdAt)
      : new Date();

  const formattedTime = formattedDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour12: false,
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.conversationContainer,
        {
          backgroundColor:
            user &&
            lastMessage &&
            lastMessage.user &&
            lastMessage.user?.id !== user?.id &&
            lastMessage.status !== "read"
              ? darkMode
                ? "#0d3643"
                : "#D1E0F0"
              : darkMode
              ? "#333333"
              : "#f4f4f4",
          borderColor: darkMode ? "#555" : "#ddd",
        },
      ]}
      onLongPress={toggleModal}
    >
      <Text
        style={[styles.title, { color: !darkMode ? "#262626" : "#f2f2f2" }]}
      >
        {conversation.name}
      </Text>
      {/* <Text style={styles.title}>{lastMessage.createdAt}</Text> */}
      {lastMessage && lastMessage.user ? (
        <Text
          style={[
            styles.message,
            {
              fontWeight:
                user &&
                lastMessage &&
                lastMessage.user &&
                lastMessage.user.id !== user?.id &&
                lastMessage.status !== "read"
                  ? "700"
                  : "400",
              color: !darkMode ? "#262626" : "#c1c1c1",
            },
          ]}
        >
          {lastMessage.user.username} sent : {getMessageContent(lastMessage)}
        </Text>
      ) : (
        <Text style={styles.message}></Text>
      )}
      <View style={styles.detailsContainer}>
        <MaterialIcons
          name="people"
          size={18}
          color={!darkMode ? "#262626" : "#c1c1c1"}
        />
        <FlatList
          data={conversation.users}
          keyExtractor={(index) => index}
          renderItem={({ item }) => <RenderUserInformation sender={item} />}
          horizontal
        />
      </View>
      <Text style={[styles.date, { color: !darkMode ? "#262626" : "#c1c1c1" }]}>
        Last Message : {formattedTime}
      </Text>
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.modalBackground]}
          onPress={() => {
            toggleModal();
          }}
        >
          <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" />

          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContainer,
                {
                  backgroundColor: darkMode ? "#282828" : "white",
                  borderColor: darkMode ? "#515151" : "white",
                  borderWidth: 2,
                },
              ]}
            >
              <View style={styles.barContainer}>
                <View style={styles.bar}></View>
              </View>
              {/* Content of the modal */}
              <View>
                {/* Button to delete the item */}
                <TouchableOpacity onPress={removeDiscussion}>
                  <LinearGradient
                    colors={[
                      darkMode ? "#A30000" : "#FF4545",
                      darkMode ? "#770000" : "#cc3737",
                    ]}
                    style={[styles.cancelButton]}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        { color: !darkMode ? "#f7f7f7" : "#cccccc" },
                      ]}
                    >
                      Delete
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Button to close the modal */}
                <TouchableOpacity onPress={toggleModal}>
                  <LinearGradient
                    colors={[
                      darkMode ? "#666666" : "#f6f6f6",
                      darkMode ? "#515151" : "#c4c4c4",
                    ]}
                    style={[styles.cancelButton]}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        { color: !darkMode ? "#4c4c4c" : "#e5e5e5" },
                      ]}
                    >
                      Cancel
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  conversationContainer: {
    marginBottom: 8,
    borderWidth: 1,
    // borderColor: "#ddd",
    padding: 16,
    borderRadius: 8,
    // backgroundColor: "#fff",
    // elevation: 3,
    // shadowColor: "#aaa",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  message: {
    fontSize: 16,
    color: "#555",
    marginTop: 0,
    marginBottom: 12,
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
  },
  userInformationContainer: {
    flexDirection: "row",
    gap: 8,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  userName: {
    fontSize: 14,
    color: "#777",
  },
  date: {
    color: "#888",
    fontSize: 12,
    textAlign: "right",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    padding: 16,
    borderRadius: 8,
    width: "100%",
  },
  barContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  bar: {
    width: 80,
    height: 8,
    backgroundColor: "#708090",
    borderRadius: 10,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 8,
    alignItems: "center",
  },
  deleteButton: {
    marginBottom: 16,
  },
  gradientButton: {
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});

export default ConversationItem;
