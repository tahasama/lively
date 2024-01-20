import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Button,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../AuthProvider/AuthProvider";
import { LinearGradient } from "expo-linear-gradient";

const CreateGroup = () => {
  const { user, setNotification, setNotificationR, darkMode } = useAuth();
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState("");

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleCreateGroup = async () => {
    try {
      // Create a new group in Firestore
      const groupsCollection = collection(db, "groups");
      const newGroupRef = await addDoc(groupsCollection, {
        name: groupName,
        creator: user.id,
        users: [user.id],
        messages: [],
        createdAt: serverTimestamp(),
        // Add more group data as needed
      });

      // Close the modal
      toggleModal();
      setNotification({
        conversationId: newGroupRef.id,
        title: groupName,
        type: "create",
      });
      setNotificationR({
        conversationId: newGroupRef.id,
        title: groupName,
        type: "create",
      });
      // Navigate to the screen for adding users to the group
      // Pass the new group's ID to the next screen
      //   navigation.navigate("AddUsersToGroup", { groupId: newGroupRef.id });
    } catch (error) {
      console.error("Error creating group:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Button to open the modal for creating a group */}
      <TouchableOpacity
        onPress={toggleModal}
        style={[
          styles.addButton,
          { backgroundColor: !darkMode ? "#4285F4" : "#346ac3" },
        ]}
      >
        <Ionicons
          name="add"
          size={44}
          color="white"
          style={{ marginLeft: 3 }}
        />
      </TouchableOpacity>

      {/* Modal for creating a group */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalBackground}
          onPress={() => {
            Keyboard.dismiss();
            toggleModal();
          }}
        >
          <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" />

          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContainer,
                {
                  backgroundColor: darkMode ? "#282828" : "white",
                  borderColor: darkMode ? "#515151" : "white",
                  borderWidth: 2,
                },
              ]}
            >
              <View style={styles.barContainer}>
                <View style={styles.bar}></View>
              </View>
              {/* Input for group name */}
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: darkMode ? "#666666" : "#f6f6f6" },
                ]}
                placeholder=" Add Group Name..."
                value={groupName}
                onChangeText={(text) => {
                  setGroupName(text);
                  setError("");
                }}
              />
              {/* Button to create the group */}
              <TouchableOpacity onPress={handleCreateGroup}>
                <LinearGradient
                  colors={[
                    darkMode ? "#274f92" : "#4285F4",
                    darkMode ? "#1f3f74" : "#346ac3",
                  ]}
                  style={[styles.cancelButton]}
                >
                  <Text style={styles.buttonText}>Create Group</Text>
                </LinearGradient>
              </TouchableOpacity>
              {/* Button to close the modal */}
              <TouchableOpacity onPress={toggleModal}>
                <LinearGradient
                  colors={[
                    darkMode ? "#666666" : "#f6f6f6",
                    darkMode ? "#515151" : "#c4c4c4",
                  ]}
                  style={[styles.cancelButton]}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: !darkMode ? "#666666" : "#f6f6f6" },
                    ]}
                  >
                    Cancel
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    flex: 1,
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
  addButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
    height: 80,
    width: 80,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    width: "100%",
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 8,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: "#ddd",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CreateGroup;
