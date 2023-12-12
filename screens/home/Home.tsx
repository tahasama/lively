// HomeScreen.js
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import ConversationItem from "./components/ConversationItem";
import { useAuth } from "../../AuthProvider/AuthProvider";
import CreateGroup from "./components/CreateGroup";
import SearchUser from "./components/SearchUser";

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

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  console.log("🚀 ~ file: Home.tsx:22 ~ HomeScreen ~ user:", user.displayName);

  // Sample Conversations
  const sampleConversations: Conversation[] = Array.from(
    { length: 10 },
    (_, index) => {
      return {
        title: `Conversation ${index + 1}`,
        participants: [`Participant ${index + 1}`, "Another Participant"],
        dateCreated: new Date(),
        messages: [
          { text: "yooo", sender: user.displayName, timestamp: new Date() },
          { text: "hhhh", sender: "user2", timestamp: new Date() },
        ],
      };
    }
  );
  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <SearchUser navigation={navigation} />
      </View>
      <View style={styles.add}>
        <CreateGroup />
      </View>
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
  search: {
    position: "absolute",
    bottom: 10,
    left: 10,
    zIndex: 2,
  },
  add: {
    position: "absolute",
    bottom: 10,
    right: 10,
    zIndex: 2,
  },
});

export default HomeScreen;
