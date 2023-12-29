import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  Button,
  Keyboard,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import {
  ref,
  onValue,
  set,
  off,
  get,
  query,
  limitToLast,
  orderByChild,
  orderByValue,
  getDatabase,
  orderByKey,
  limitToFirst,
  onChildAdded,
  startAt,
  endAt,
  push,
  child,
} from "firebase/database";
import { useNavigation } from "@react-navigation/native";
import { db, dbr, storage } from "../../firebase";

import { useAuth } from "../../AuthProvider/AuthProvider";
import ImagePickerC from "./component/ImagePickerC";
import { useImage } from "../../AuthProvider/ImageProvider";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

import MessageBubble from "./component/MessageBubble";
import RecordingSounds from "./component/RecordingSounds";
import * as VideoThumbnails from "expo-video-thumbnails";
import { getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { generateThumbnail } from "./thumbnails";
import { doc, getDoc } from "firebase/firestore";

interface Message {
  text: string;
  sender: string;
  createdAt: any;
}

interface IMessage {
  _id: string;
  text: string;
  createdAt: any;
  user: any;
  image: string;
  video: string;
  audio: string;
  file: string;
  expoPushToken: string;
}

interface Conversation {
  id: string;
  name: string;
  participants: string[];
  messages: Message[];
}

interface ConversationScreenProps {
  route: {
    params: {
      conversationId: string;
      title: string;
      index: any;
      participants: string[];
    };
  };
}

const ConversationScreen: React.FC<ConversationScreenProps> = ({ route }) => {
  const { conversationId, title, participants } = route.params;
  const navigation = useNavigation();
  const { user } = useAuth();
  console.log("🚀 ~ file: Conversation.tsx:79 ~ user:", user);
  const {
    text,
    image,
    video,
    audio,
    file,
    audioRecord,
    imageRecord,
    recordedVideo,
    uploadProgress,
    setImage,
    setVideo,
    setAudio,
    setFile,
    setText,
    setAudioRecord,
    setImageRecord,
    setRecordedVideo,
  } = useImage();

  const [showImagePicker, setShowImagePicker] = useState(false);
  const chatRef = useRef<FlatList<IMessage> | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  console.log("🚀 ~ file: Conversation.tsx:102 ~ messages:", messages);
  const [isRefreshing, setRefreshing] = useState(false);
  const [goDowns, setGoDown] = useState(true);
  const [loading, setLoading] = useState(true);
  const [disableButton, setDisableButton] = useState(false);
  const [showPullMessage, setShowPullMessage] = useState(true);
  const [usersPushToken, setUsersPushToken] = useState<string[]>([]);

  console.log(
    "🚀 ~ file: Conversation.tsx:107 ~ disableButton:",
    disableButton
  );

  const conversationRef = ref(dbr, `groups/${conversationId}/messages`);

  useEffect(() => {
    navigation.setOptions({ title: title });
    getParticipantsExpoPushToken();
    const handleChildAdded = (snapshot) => {
      const newMessage = snapshot.val();

      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    // Subscribe to real-time updates using onChildAdded
    const conversationQuery = query(conversationRef, limitToLast(4));
    if (messages.length !== 0) {
      onChildAdded(conversationRef, handleChildAdded);
    } else {
      onChildAdded(conversationQuery, handleChildAdded);
    }
    // messages.length < 6 && setShowPullMessage(true);
    setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => {
      off(conversationRef, "child_added", handleChildAdded);
    };
  }, []);

  const getParticipantsExpoPushToken = () => {
    const restOfParticipants = participants.filter(
      (participant) => participant !== user.id
    );
    restOfParticipants.map(async (participant: any) => {
      try {
        const docSnap = await getDoc(doc(db, "users", participant));
        if (docSnap.exists()) {
          setUsersPushToken(docSnap.data().expoPushToken);
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    });
  };

  const fetchMoreMessages = async () => {
    try {
      const conversationRef2 = ref(dbr, `groups/${conversationId}/messages`);
      const currentMessagesCount = messages.length;
      const newLimit = 3;

      const lastMessage = messages[0];

      const snapshot = await get(
        query(
          conversationRef2,
          orderByChild("_id"),
          endAt(lastMessage ? lastMessage._id : ""),
          limitToLast(newLimit)
        )
      );

      const newMessages = snapshot.val() || [];

      const newMessagesArray = Object.values(newMessages);

      const filteredNewMessages = newMessagesArray.filter(
        (message: any) =>
          !messages.some(
            (existingMessage: any) => existingMessage._id === message?._id
          )
      );

      setMessages((prevMessages: any) => [
        ...filteredNewMessages,
        ...prevMessages,
      ]);
    } catch (error) {
      console.error("Error fetching more messages:", error.message);
    }
  };

  const handleSendMessage = async () => {
    setDisableButton(true);
    const conversationRef2 = ref(dbr, `groups/${conversationId}/messages`); // Correct path

    let thumbnail = null;

    if (video || recordedVideo) {
      thumbnail = await generateThumbnail(video || recordedVideo);
    }
    if (
      image ||
      video ||
      audio ||
      file ||
      text ||
      audioRecord ||
      imageRecord ||
      recordedVideo
    ) {
      try {
        const newMessageRef = push(conversationRef2); // Use the correct reference
        const newMessageId = newMessageRef.key;

        const updatedMessage = {
          _id: newMessageId,
          createdAt: new Date().toISOString(),
          user: user,
          text: text ? text : "",
          image: image ? image : "",
          video: video ? video : "",
          audio: audio ? audio : "",
          file: file ? file : "",
          audioRecord: audioRecord ? audioRecord : "",
          imageRecord: imageRecord ? imageRecord : "",
          recordedVideo: recordedVideo ? recordedVideo : "",
          thumnail: thumbnail,
        };

        await set(newMessageRef, updatedMessage);

        // Optionally, you can fetch the messages after adding a new one
        // to keep your local state updated. Uncomment the line below if needed.
        // fetchMessages();

        setImage("");
        setVideo("");
        setAudio("");
        setFile("");
        setText("");
        setAudioRecord("");
        setImageRecord("");
        setRecordedVideo("");
        setGoDown(true);
        schedulePushNotification();
        Keyboard.dismiss();
        setDisableButton(false);
      } catch (error) {
        console.error("Error updating Realtime Database:", error.message);
      }
    }
  };

  function schedulePushNotification() {
    let response = fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: usersPushToken,
        title: `${user.username} sent you a message`,
        body: `In your Conversation ${title}`,

        data: {},
        // channelId: "vvv",
      }),
    });
  }

  const handleImagePickerToggle = () => {
    setShowImagePicker(!showImagePicker);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setGoDown(false);

    await fetchMoreMessages();

    setRefreshing(false);
  };

  const Types = [
    "file",
    "image",
    "audio",
    "video",
    "audioRecord",
    "imageRecord",
    "recordedVideo",
  ];

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size={60} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 2 }}>
      {showPullMessage && (
        <View style={styles.tipContainer}>
          <Text style={styles.tipText}>
            Tips: From this point, pull down to load older messages
          </Text>
        </View>
      )}
      <FlatList
        ref={chatRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <MessageBubble message={item} isSender={item.user.id === user.id} />
        )}
        onContentSizeChange={() =>
          goDowns && chatRef.current?.scrollToEnd({ animated: true })
        }
        onScroll={() => setShowPullMessage(false)}
        // onStartReached={() => setShowPullMessage(true)}
        // onEndReached={() => setShowPullMessage(false)}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handleImagePickerToggle}>
          <Ionicons name="add" size={32} color="black" />
        </TouchableOpacity>
        {!showImagePicker ? (
          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={setText}
            placeholder="Type your message..."
            multiline={true}
          />
        ) : uploadProgress <= 1 || uploadProgress >= 99 ? (
          <View style={[styles.type]}>
            {Types.map((type, index) => (
              <View key={index} style={[styles.types]}>
                <ImagePickerC type={type} />
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ fontSize: 12 }}>
            You can add a message after upload is finished{" "}
            <Text style={{ color: "#2ecc71" }}>
              {uploadProgress.toFixed(0)}%
            </Text>
          </Text>
        )}
        <TouchableOpacity
          onPress={handleSendMessage}
          style={styles.sendButton}
          disabled={
            (image ||
              video ||
              audio ||
              file ||
              text ||
              audioRecord ||
              imageRecord ||
              recordedVideo) &&
            !disableButton
              ? false
              : true
          }
        >
          {!disableButton ? (
            <Ionicons
              name="send"
              size={22}
              color={
                (image ||
                  video ||
                  audio ||
                  file ||
                  text ||
                  audioRecord ||
                  imageRecord ||
                  recordedVideo) &&
                !disableButton
                  ? "#00A1C9"
                  : "black"
              }
            />
          ) : (
            <ActivityIndicator style={{ marginRight: 5 }} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sendButton: {
    // marginHorizontal: 10,
    marginLeft: 10,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    color: "#333",
    marginRight: 2,
  },
  type: {
    flex: 1,
    // backgroundColor: "red",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginLeft: -6,
  },
  types: {
    // flex: 1,
    paddingVertical: 8,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tipContainer: {
    backgroundColor: "#ececec", // Background color
    padding: 10,
    alignItems: "center",
  },
  tipText: {
    color: "#333", // Text color
    fontSize: 14,
    fontStyle: "italic",
  },
});

export default ConversationScreen;
