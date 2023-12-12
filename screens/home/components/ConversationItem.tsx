import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

interface Message {
  text: string;
  sender: string;
  timestamp: Date;
}

interface Conversation {
  name: string;
  // users: string[];
  users: any;
  messages: Message[];
  creator: any;
}

const ConversationItem: React.FC<{
  conversation: Conversation;
  navigation: any;
}> = ({ conversation, navigation }) => {
  const latestMessage =
    conversation.messages.length > 0
      ? conversation.messages[conversation.messages.length - 1]
      : "";
  console.log(
    "🚀 ~ file: ConversationItem.tsx:21 ~ conversation:",
    conversation.name
  );

  const handlePress = () => {
    // Navigate to the ConversationScreen with the conversation details
    navigation.navigate("Conversation", { conversation });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.conversationContainer}
    >
      <Text style={styles.title}>{conversation.name}</Text>
      <View style={styles.detailsContainer}>
        <MaterialIcons name="people" size={18} color="#555" />
        <Text style={styles.participants}>
          {conversation.users[0].username}
        </Text>
      </View>
      {latestMessage && (
        <>
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{latestMessage.sender} :</Text>
            <Text style={styles.message}>{latestMessage.text}</Text>
          </View>
          <View style={styles.detailsContainer}>
            <MaterialIcons name="mail-outline" size={18} color="#555" />

            <Text
              style={styles.dateCreated}
            >{` ${latestMessage.timestamp.toDateString()}`}</Text>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  conversationContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  messageContainer: {
    flex: 1,
    flexDirection: "row",
    marginVertical: 3,
  },
  message: {
    fontSize: 16,
    textTransform: "capitalize",
    marginLeft: 3,
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  participants: {
    fontSize: 16,
    color: "#555",
    marginLeft: 4,
  },
  dateCreated: {
    fontSize: 14,
    color: "#777",
    marginLeft: 4,
  },
});

export default ConversationItem;
