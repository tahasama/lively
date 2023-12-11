// HomeScreen.js
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import ConversationItem from "../ConversationItem";

const HomeScreen = ({ navigation }) => {
  interface Message {
    text: string;
    sender: string;
    timestamp: Date;
  }

  interface Conversation {
    title: string;
    participants: string[];
    dateCreated: Date;
    messages: Message[];
  }

  // Sample Conversations
  const sampleConversations: Conversation[] = Array.from(
    { length: 10 },
    (_, index) => {
      return {
        title: `Conversation ${index + 1}`,
        participants: [`Participant ${index + 1}`, "Another Participant"],
        dateCreated: new Date(),
        messages: [
          { text: "yooo", sender: "user1", timestamp: new Date() },
          { text: "hhhh", sender: "user2", timestamp: new Date() },
        ],
      };
    }
  );
  return (
    <View style={styles.container}>
      <FlatList
        data={sampleConversations}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <ConversationItem conversation={item} navigation={navigation} />
        )}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default HomeScreen;
