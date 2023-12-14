import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import RenderUserInformation from "../../conversation/component/renderUserInformation";

interface Message {
  text: string;
  sender: string;
  createdAt: any;
}

interface Conversation {
  id: string;
  name: string;
  users: any[];
  dateCreated: Date;
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
    "🚀 ~ file: ConversationItem.tsx:26 ~ conversation:",
    conversation
  );

  const [senderName, setSenderName] = useState("");

  const handlePress = () => {
    // Navigate to the ConversationScreen with the conversation details
    navigation.navigate("Conversation", {
      conversationId: conversation.id,
      title: conversation.name,
    });
  };

  const getUser = async () => {
    const docSnap = await getDoc(
      doc(
        db,
        "users",
        conversation.messages[conversation.messages.length - 1].sender
      )
    );
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      setSenderName(docSnap.data().username);
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.conversationContainer}
    >
      <Text style={styles.title}>{conversation.name}</Text>
      <View style={styles.detailsContainer}>
        <MaterialIcons name="people" size={18} color="#555" />
        <FlatList
          data={conversation.users}
          keyExtractor={(index) => index}
          renderItem={({ item }) => <RenderUserInformation sender={item} />}
          style={styles.usersList}
        />
      </View>
      {latestMessage && (
        <>
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{senderName} :</Text>
            <Text style={styles.message}>{latestMessage.text}</Text>
          </View>
          <View style={styles.detailsContainer}>
            <MaterialIcons name="mail-outline" size={18} color="#555" />

            <Text style={styles.dateCreated}>{` ${latestMessage.createdAt
              .toDate()
              .toLocaleString()}`}</Text>
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
    marginBottom: 7,
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
  usersList: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 0,
  },
});

export default ConversationItem;
