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
import { Ionicons, Feather } from "@expo/vector-icons";

import MessageBubble from "./component/MessageBubble";

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
  console.log("🚀 ~ file: Conversation.tsx:56 ~ user:", user);
  const {
    text,
    setText,
    image,
    setImage,
    setLoadingImage,
    loadingImage,
    video,
    setVideo,
    audio,
    setAudio,
    file,
    setFile,
  } = useImage();

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
    // Your existing logic for sending messages

    // Check if the message contains a file (image, video, audio, etc.)
    if (image || video || audio || file || text) {
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
        Keyboard.dismiss();
      } catch (error) {
        console.error("Error updating Realtime Database:", error.message);
      }
    }
  };

  const handleImagePickerToggle = () => {
    setShowImagePicker(!showImagePicker);
  };

  const Types = ["file", "image", "audio", "video"];

  if (loading) {
    return (
      <View>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 2 }}>
      <FlatList
        ref={chatRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <MessageBubble message={item} isSender={item.user.id === user.id} />
        )}
        // Add any additional FlatList props or styling here
      />
      <View style={styles.inputContainer}>
        {/* Show the "Add" button on the far left */}
        <TouchableOpacity
          style={styles.addButton}
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
          Types.map((type, index) => (
            <View key={index} style={[styles.types]}>
              <ImagePickerC type={type} />
            </View>
          ))
        )}

        {/* Show the "Send Message" button on the far right */}
        <TouchableOpacity onPress={handleSendMessage}>
          <Ionicons name="send" size={20} color="black" />
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
  addButton: {
    marginRight: 10,
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
  types: {
    flex: 1,
    paddingVertical: 8,
  },
});

export default ConversationScreen;
