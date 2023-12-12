// ConversationScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Animated,
  ActivityIndicator,
} from "react-native";
import ChatInput from "./component/ChatInput";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../AuthProvider/AuthProvider";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import RenderUserInformation from "./component/renderUserInformation";

interface Message {
  text: string;
  sender: string;
  createdAt: any;
}

interface Conversation {
  id: string;
  name: string;
  participants: string[];
  messages: Message[];
}

interface ConversationScreenProps {
  route: { params: { conversationId: string } };
}

const ConversationScreen: React.FC<ConversationScreenProps> = ({ route }) => {
  const { conversationId } = route.params;
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getConversation = async () => {
      try {
        const docSnap = await getDoc(doc(db, "groups", conversationId));
        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data());
          setConversation(docSnap.data());

          // Check if messages property exists before accessing it
          setMessages(docSnap.data().messages || []);
        } else {
          console.log("No such document!");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error getting conversation:", error.message);
        setLoading(false);
      }
    };

    getConversation();
  }, [conversationId]);

  const navigation = useNavigation();
  const { user } = useAuth();

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      text,
      sender: user.id,
      createdAt: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const updateFirestore = async () => {
    try {
      if (conversation) {
        await updateDoc(doc(db, "groups", conversationId), {
          messages: messages,
        });
        console.log("Firestore updated successfully");
      }
    } catch (error) {
      console.error("Error updating Firestore:", error.message);
    }
  };

  useEffect(() => {
    if (conversation) {
      navigation.setOptions({ title: conversation.name });
    }

    // Call the Firestore update only if both conversation and messages are available
    if (conversation && messages.length > 0) {
      updateFirestore();
    }
  }, [messages, conversation, conversationId]);

  const getMessageDate = (item: any) => {
    if (item && item.createdAt instanceof Date) {
      // Message created on the client side
      return item.createdAt.toLocaleString();
    } else if (item && item.createdAt && item.createdAt.toDate) {
      // Message fetched from Firestore
      return item.createdAt.toDate().toLocaleString();
    }
    return ""; // Handle the case where createdAt is not defined
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.sender === user.id;
    const alignStyle = isCurrentUser ? styles.alignRight : styles.alignLeft;
    const messageBubbleStyle = isCurrentUser
      ? styles.messageBubbleRight
      : styles.messageBubbleLeft;

    return (
      <View style={[styles.messageContainer, alignStyle]}>
        {/* <Text style={[styles.messageSender, alignStyle]}>{item.sender}</Text> */}
        <RenderUserInformation sender={item.sender} />

        <View style={messageBubbleStyle}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
        <Text style={[styles.messageTimestamp, alignStyle]}>
          {getMessageDate(item) || item.createdAt.toLocaleString()}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size={80} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Hello {user.username}!</Text>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContentContainer}
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
    marginBottom: 0,
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
  loading: {
    flex: 1,
    justifyContent: "center",
  },
});

export default ConversationScreen;
