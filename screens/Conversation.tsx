// ConversationScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import { View, FlatList, StyleSheet, Text, Animated } from "react-native";
import ChatInput from "../ChatInput";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../AuthProvider/AuthProvider";
interface Message {
  text: string;
  sender: string;
  timestamp: Date;
}

interface Conversation {
  title: string;
  participants: string[];
  messages: Message[];
}

interface ConversationScreenProps {
  route: { params: { conversation: Conversation } };
}

const ConversationScreen: React.FC<ConversationScreenProps> = ({ route }) => {
  const { conversation } = route.params;
  const navigation = useNavigation();
  const { user } = useAuth();
  console.log("🚀 ~ file: Conversation.tsx:27 ~ user:", user);

  const [messages, setMessages] = useState<Message[]>(conversation.messages);

  useEffect(() => {
    // Set the title dynamically based on the conversation
    navigation.setOptions({ title: conversation.title });
  }, [conversation, navigation]);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      text,
      sender: "CurrentUser", // Replace with actual user data or ID
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  useEffect(() => {
    // You may want to scroll to the bottom when new messages are added
    // This is a simple example, and you might need to adjust it based on your UI library or component
    // scrollViewRef.scrollToEnd();
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.sender === "user1";
    const alignStyle = isCurrentUser ? styles.alignRight : styles.alignLeft;
    const messageBubbleStyle = isCurrentUser
      ? styles.messageBubbleRight
      : styles.messageBubbleLeft;

    return (
      <View style={[styles.messageContainer, alignStyle]}>
        <Text style={[styles.messageSender, alignStyle]}>{item.sender}</Text>
        <View style={messageBubbleStyle}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
        <Text style={[styles.messageTimestamp, alignStyle]}>
          {item.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            day: "numeric",
            month: "short",
            year: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text>Hello {user.displayName} !</Text>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContentContainer}
        // ref={(ref) => (scrollViewRef = ref)} // Set up a ref for scrolling to the bottom
      />
      <ChatInput onSendMessage={handleSendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  messagesContentContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  messageContainer: {
    flexDirection: "column",
    marginBottom: 12,
    maxWidth: "80%", // Adjust the width of the message container
  },
  alignRight: {
    alignSelf: "flex-end",
  },
  alignLeft: {
    alignSelf: "flex-start",
  },
  messageBubbleRight: {
    backgroundColor: "#4285F4",
    borderRadius: 16,
    padding: 16,
  },
  messageBubbleLeft: {
    backgroundColor: "#708090",
    borderRadius: 16,
    padding: 16,
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  messageSender: {
    color: "#555",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 3,
    marginHorizontal: 8,
    textTransform: "capitalize",
  },
  messageTimestamp: {
    color: "#777",
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
});

export default ConversationScreen;
