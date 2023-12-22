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
} from "react-native";
import { ref, onValue, set, off, get } from "firebase/database";
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
  route: { params: { conversationId: string; title: string } };
}

const ConversationScreen: React.FC<ConversationScreenProps> = ({ route }) => {
  const { conversationId, title } = route.params;
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const {
    text,
    setText,
    image,
    setImage,
    video,
    setVideo,
    audio,
    setAudio,
    file,
    setFile,
    audioRecord,
    setAudioRecord,
    imageRecord,
    setImageRecord,
    recordedVideo,
    setRecordedVideo,
  } = useImage();
  console.log("🚀 ~ file: Conversation.tsx:75 ~ recordedVideo:", recordedVideo);

  const [showImagePicker, setShowImagePicker] = useState(false);
  const navigation = useNavigation<any>();
  const chatRef = useRef<FlatList<IMessage> | null>(null);

  useEffect(() => {
    const conversationRef = ref(dbr, `groups/${conversationId}`);
    navigation.setOptions({ title: title });

    const handleData = (snapshot) => {
      const conversationData = snapshot.val();

      if (conversationData) {
        setMessages([
          ...(conversationData.messages
            ? Object.values(conversationData.messages).map((msg: any) => ({
                _id: msg._id,
                text: msg.text,
                createdAt: new Date(msg.createdAt),
                user: msg.user,
                image: msg.image,
                video: msg.video,
                audio: msg.audio,
                file: msg.file,
                audioRecord: msg.audioRecord,
                imageRecord: msg.imageRecord,
                recordedVideo: msg.recordedVideo,
              }))
            : []),
          // { _id: "0", text: "", createdAt: "", user: "", image: "" },
          // { _id: "1", text: "", createdAt: "", user: "", image: "" },
        ]);

        // Scroll to the bottom after setting messages
        setTimeout(() => {
          chatRef.current?.scrollToEnd();
        }, 1000);
      }
      setLoading(false);
    };

    // Subscribe to real-time updates
    onValue(conversationRef, handleData);

    return () => {
      // Unsubscribe when component unmounts
      // Cleanup subscriptions to avoid memory leaks
      off(conversationRef, "value", handleData);
    };
  }, [conversationId, navigation]);

  const handleSendMessage = async () => {
    console.log("clicked");
    // Your existing logic for sending messages
    console.log(
      "🚀 ~ file: Conversation.tsx:141 ~ handleSendMessage ~ recordedVideo:",
      recordedVideo
    );
    // Check if the message contains a file (image, video, audio, etc.)
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
        const conversationRef = ref(dbr, `groups/${conversationId}`);

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

        // Clear the selected file after sending
        setImage("");
        setVideo("");
        setAudio("");
        setFile("");
        setText("");
        setAudioRecord("");
        setImageRecord("");
        setRecordedVideo("");
        Keyboard.dismiss();
      } catch (error) {
        console.error("Error updating Realtime Database:", error.message);
      }
    }
  };

  const handleImagePickerToggle = () => {
    setShowImagePicker(!showImagePicker);
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
      <FlatList
        ref={chatRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <MessageBubble message={item} isSender={item.user.id === user.id} />
        )}
        // Add any additional FlatList props or styling here
      />
      <View style={styles.inputContainer}>
        {/* Show the "Add" button on the far left */}
        <TouchableOpacity
          // style={styles.addButton}
          onPress={handleImagePickerToggle}
        >
          <Ionicons name="add" size={32} color="black" />
        </TouchableOpacity>

        {/* Show the TextInput in the middle */}
        {!showImagePicker ? (
          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={setText}
            placeholder="Type your message..."
            multiline={true}
          />
        ) : (
          // <ImagePickerC />
          <View style={[styles.type]}>
            {Types.map((type, index) => (
              <View key={index} style={[styles.types]}>
                <ImagePickerC type={type} />
              </View>
            ))}
            {/* <RecordingSounds type={"audioRecord"} /> */}
          </View>
        )}

        {/* Show the "Send Message" button on the far right */}
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
