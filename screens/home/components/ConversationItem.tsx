import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
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

  const [senderName, setSenderName] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);

  const handlePress = () => {
    // Navigate to the ConversationScreen with the conversation details
    navigation.navigate("Conversation", {
      conversationId: conversation.id,
      title: conversation.name,
      participants: conversation.users,
    });
  };

  const getUser = async () => {
    if (
      conversation.messages &&
      conversation.messages[conversation.messages.length - 1]?.sender
    ) {
      try {
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
      } catch (error) {
        console.log(
          "🚀 ~ file: ConversationItem.tsx:54 ~ getUser ~ error:",
          error
        );
      }
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const removeDiscussion = async () => {
    const ref = doc(db, "groups", conversation.id);
    await deleteDoc(ref);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.conversationContainer}
      onLongPress={toggleModal}
    >
      <Text style={styles.title}>{conversation.name}</Text>
      <View style={styles.detailsContainer}>
        <MaterialIcons name="people" size={18} color="#555" />
        <FlatList
          data={conversation.users}
          keyExtractor={(index) => index}
          renderItem={({ item }) => <RenderUserInformation sender={item} />}
          horizontal
        />
      </View>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalBackground}
          onPress={() => {
            toggleModal();
          }}
        >
          <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" />

          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.barContainer}>
                <View style={styles.bar}></View>
              </View>
              {/* Input for group name */}

              {/* Button to create the group */}
              <TouchableOpacity
                style={styles.createButton}
                onPress={removeDiscussion}
              >
                <Text style={styles.buttonText}>Delete?</Text>
              </TouchableOpacity>

              {/* Button to close the modal */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={toggleModal}
              >
                <Text style={[styles.buttonText, { color: "#4e5a65" }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
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
    gap: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    width: "100%",
  },
  barContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  bar: {
    width: 80,
    height: 8,
    backgroundColor: "#708090",
    borderRadius: 10,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 8,
    alignItems: "center",
  },
});

export default ConversationItem;
