// HomeScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import ConversationItem from "./components/ConversationItem";
import { useAuth } from "../../AuthProvider/AuthProvider";
import CreateGroup from "./components/CreateGroup";
import SearchUser from "./components/SearchUser";
import { collection, getDocs, or, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import RecordingSounds from "../conversation/component/RecordingSounds";
import CameraUsage from "../conversation/component/CameraUsage";
import VideoRecorder from "../conversation/component/VideoRecorder";

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

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [converations, setConverations] = useState<Conversation[]>([]);

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

  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <SearchUser navigation={navigation} icon={""} conversationId={""} />
      </View>
      <View style={styles.add}>
        <CreateGroup />
      </View>
      {converations ? (
        <FlatList
          data={converations}
          keyExtractor={(converation) => converation.id}
          renderItem={({ item }) => (
            <ConversationItem conversation={item} navigation={navigation} />
          )}
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Look for you friends or create a group and add them!
          </Text>
        </View>
      )}
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
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 22,
    // fontStyle: "italic",
    fontWeight: "700",
    textAlign: "center",
  },
});

export default HomeScreen;
