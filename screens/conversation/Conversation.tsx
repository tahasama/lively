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
} from "firebase/database";
import { useNavigation } from "@react-navigation/native";
import { dbr } from "../../firebase";
import { useAuth } from "../../AuthProvider/AuthProvider";
import ImagePickerC from "./component/ImagePickerC";
import { useImage } from "../../AuthProvider/ImageProvider";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

import MessageBubble from "./component/MessageBubble";
import RecordingSounds from "./component/RecordingSounds";

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
}

interface Conversation {
  id: string;
  name: string;
  participants: string[];
  messages: Message[];
}

interface ConversationScreenProps {
  route: { params: { conversationId: string; title: string; index: any } };
}

const ConversationScreen: React.FC<ConversationScreenProps> = ({ route }) => {
  const { conversationId, title } = route.params;

  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
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
  const navigation = useNavigation<any>();
  const chatRef = useRef<FlatList<IMessage> | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isRefreshing, setRefreshing] = useState(false);
  const [goDowns, setGoDown] = useState(true);
  const [showPullUpMessage, setShowPullUpMessage] = useState(false);

  const conversationRef = ref(dbr, `groups/${conversationId}/messages/`);
  useEffect(() => {
    const handleChildAdded = (snapshot) => {
      const newMessage = snapshot.val();
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    // Subscribe to real-time updates using onChildAdded
    onChildAdded(conversationRef, handleChildAdded);

    // Fetch initial messages

    fetchMessages();

    // Unsubscribe when component unmounts
    return () => {
      off(conversationRef, "child_added", handleChildAdded);
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const snapshot = await get(query(conversationRef, limitToLast(2)));

      const newMessages = snapshot.val() || [];

      setMessages(Object.values(newMessages));
      setLoading(false);
      setGoDown(true);
    } catch (error) {
      console.error("Error fetching messages:", error.message);
      setLoading(false);
    }
  };

  const fetchMoreMessages = async () => {
    const currentMessagesCount = messages.length;
    const newLimit = 3; // Fetch a fixed number of new messages

    try {
      const lastMessage = messages[0];
      const snapshot = await get(
        query(
          conversationRef,
          orderByChild("_id"),
          endAt(lastMessage ? lastMessage._id : ""), // Start at the last known _id
          limitToLast(newLimit)
        )
      );

      const newMessages = snapshot.val() || [];
      const newMessagesArray = Object.values(newMessages);

      // Filter out messages that are already present in the current messages array
      const filteredNewMessages = newMessagesArray.filter(
        (message: any) =>
          !messages.some(
            (existingMessage: any) => existingMessage._id === message?._id
          )
      );

      // Update the state with the filtered messages
      setMessages((prevMessages: any) => [
        ...filteredNewMessages,
        ...prevMessages,
      ]);
    } catch (error) {
      console.error("Error fetching more messages:", error.message);
    }
  };

  const handleSendMessage = async () => {
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
        const snapshot = await get(conversationRef);
        const currentMessages = snapshot.val()?.messages || [];
        const currentMessagesArray = Array.isArray(currentMessages)
          ? currentMessages
          : Object.values(currentMessages);

        const updatedMessages = [
          ...currentMessagesArray,
          {
            _id: `${new Date().getTime()}-${Math.random()}`,
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
          },
        ];

        await set(conversationRef, {
          messages: updatedMessages,
        });

        setImage("");
        setVideo("");
        setAudio("");
        setFile("");
        setText("");
        setAudioRecord("");
        setImageRecord("");
        setRecordedVideo("");
        setGoDown(true);

        Keyboard.dismiss();
      } catch (error) {
        console.error("Error updating Realtime Database:", error.message);
      }
    }
  };

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

  if (loading && messages.length === 0) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size={60} />
      </View>
    );
  }

  let previousOffset = 0;

  return (
    <View style={{ flex: 1, padding: 2 }}>
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
        onStartReached={() => setShowPullUpMessage(true)}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        onScroll={(event) => {
          const currentOffset = event.nativeEvent.contentOffset.y;
          const isScrollingUp =
            currentOffset > 0 && currentOffset < previousOffset;
          previousOffset = currentOffset;

          if (isScrollingUp) {
            setShowPullUpMessage(true);
          } else {
            setShowPullUpMessage(false);
          }
        }}
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
            image ||
            video ||
            audio ||
            file ||
            text ||
            audioRecord ||
            imageRecord ||
            recordedVideo
              ? false
              : true
          }
        >
          <Ionicons
            name="send"
            size={22}
            color={
              image ||
              video ||
              audio ||
              file ||
              text ||
              audioRecord ||
              imageRecord ||
              recordedVideo
                ? "#00A1C9"
                : "black"
            }
          />
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
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    color: "#333",
    marginRight: 20,
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
});

export default ConversationScreen;
