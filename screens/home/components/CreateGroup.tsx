import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Button,
  TextInput,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";
import { Ionicons } from "@expo/vector-icons";

const CreateGroup = () => {
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);
  const [groupName, setGroupName] = useState("");

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleCreateGroup = async () => {
    try {
      // Create a new group in Firestore
      const groupsCollection = collection(db, "groups");
      const newGroupRef = await addDoc(groupsCollection, {
        name: groupName,
        createdAt: serverTimestamp(),
        // Add more group data as needed
      });

      // Close the modal
      toggleModal();

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
      <TouchableOpacity onPress={toggleModal} style={styles.addButton}>
        <Ionicons
          name="add"
          size={44}
          color="white"
          style={{ marginLeft: 3 }}
        />
      </TouchableOpacity>

      {/* Modal for creating a group */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          {/* Input for group name */}
          <TextInput
            style={styles.input}
            placeholder="Group Name"
            value={groupName}
            onChangeText={setGroupName}
          />
          {/* Button to create the group */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateGroup}
          >
            <Text style={styles.buttonText}>Create Group</Text>
          </TouchableOpacity>
          {/* Button to close the modal */}
          <TouchableOpacity style={styles.cancelButton} onPress={toggleModal}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4285F4",
    borderRadius: 40,
    height: 80,
    width: 80,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    height: "auto",
    position: "absolute",
    bottom: 0,
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
  createButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 16,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ddd",
    paddingVertical: 12,
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
