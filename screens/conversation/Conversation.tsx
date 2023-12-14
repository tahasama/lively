import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  Button,
  Keyboard,
} from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import { ref, onValue, set, off, get } from "firebase/database";
import { useNavigation } from "@react-navigation/native";
import { dbr } from "../../firebase";
import { useAuth } from "../../AuthProvider/AuthProvider";
import renderAvatar from "./component/renderAvatar";

interface Message {
  text: string;
  sender: string;
  createdAt: any;
}

interface IMessage {
  _id: string;
  text: string;
  createdAt: Date;
  user: any;
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
  const navigation = useNavigation();
  const chatRef = useRef<FlatList<IMessage> | null>(null);
  chatRef.current?.scrollToEnd();

  useEffect(() => {
    const conversationRef = ref(dbr, `groups/${conversationId}`);
    navigation.setOptions({ title: title });

    const handleData = (snapshot) => {
      const conversationData = snapshot.val();

      if (conversationData) {
        setMessages(
          conversationData.messages
            ? Object.values(conversationData.messages).map((msg: any) => ({
                _id: msg._id,
                text: msg.text,
                createdAt: new Date(msg.createdAt),
                user: msg.user,
              }))
            : []
        );
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

  const handleSendMessage = async (newMessages: IMessage[]) => {
    try {
      const conversationRef = ref(dbr, `groups/${conversationId}`);

      // Fetch the current messages from the database
      const snapshot = await get(conversationRef);
      const currentMessages = snapshot.val()?.messages || [];

      // Convert the currentMessages to an array
      const currentMessagesArray = Array.isArray(currentMessages)
        ? currentMessages
        : Object.values(currentMessages);

      // Append new messages to the existing array
      const updatedMessages = [
        ...currentMessagesArray,
        ...newMessages.map((msg) => ({
          _id: msg._id,
          text: msg.text,
          createdAt: msg.createdAt.toISOString(),
          user: msg.user,
        })),
      ];

      // Update the Realtime Database with the updated messages array
      await set(conversationRef, {
        messages: updatedMessages,
      });
      Keyboard.dismiss();
    } catch (error) {
      console.error("Error updating Realtime Database:", error.message);
    }
  };

  if (loading) {
    return (
      <View>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GiftedChat
      messages={messages}
      onSend={(newMessages: any) => handleSendMessage(newMessages)}
      user={{
        _id: user.id,
        name: user.username,
      }}
      renderAvatar={(props) => renderAvatar(props)}
      showAvatarForEveryMessage={true}
      // alwaysShowSend
      inverted={false}
      renderUsernameOnMessage
      messageContainerRef={chatRef}
    />
  );
};

export default ConversationScreen;
