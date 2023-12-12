// HomeScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import ConversationItem from "./components/ConversationItem";
import { useAuth } from "../../AuthProvider/AuthProvider";
import CreateGroup from "./components/CreateGroup";
import SearchUser from "./components/SearchUser";
import { collection, getDocs, or, query, where } from "firebase/firestore";
import { db } from "../../firebase";

interface Message {
  text: string;
  sender: string;
  createdAt: Date;
}

interface Conversation {
  id: string;
  name: string;
  users: any[];
  dateCreated: Date;
  messages: Message[];
  creator: any;
}

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [converations, setConverations] = useState<Conversation[]>([]);
  console.log(
    "🚀 ~ file: Home.tsx:28 ~ HomeScreen ~ converations:",
    converations
  );

  const getCoversations = async () => {
    const groupsCollection = collection(db, "groups");

    // Check if a group with these users already exists
    const q = query(
      groupsCollection,
      or(
        where("creator.id", "==", user.id),
        where("users", "array-contains", user.id)
      )
    );

    const querySnapshot = await getDocs(q);

    const foundGroup = [];
    querySnapshot.forEach((doc) => {
      foundGroup.push({ id: doc.id, ...doc.data() });
    });
    setConverations(foundGroup);
  };

  useEffect(() => {
    getCoversations();
  }, []);

  // Sample Conversations
  // const sampleConversations: Conversation[] = Array.from(
  //   { length: 10 },
  //   (_, index) => {
  //     return {
  //       title: `Conversation ${index + 1}`,
  //       participants: [`Participant ${index + 1}`, "Another Participant"],
  //       dateCreated: new Date(),
  //       messages: [
  //         { text: "yooo", sender: user.displayName, timestamp: new Date() },
  //         { text: "hhhh", sender: "user2", timestamp: new Date() },
  //       ],
  //     };
  //   }
  // );
  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <SearchUser navigation={navigation} />
      </View>
      <View style={styles.add}>
        <CreateGroup />
      </View>
      <FlatList
        data={converations}
        keyExtractor={(converation) => converation.id}
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
