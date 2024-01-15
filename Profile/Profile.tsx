import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  StatusBar,
  Image,
  FlatList,
  TextInput,
  Button,
} from "react-native";
import { Feather } from "@expo/vector-icons"; // Assuming you're using expo vector icons
import { useImage } from "../AuthProvider/ImageProvider";
import { useAuth } from "../AuthProvider/AuthProvider";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import RenderUserAvatar from "./RenderUserAvatar";
import RenderUserInformation from "./RenderUserInformation";

const Profile: React.FC = () => {
  const { user, setUser, converations, expoPushToken } = useAuth();
  const { image, setImage } = useImage();
  const [isModalVisible, setModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    const updateToken = async () => {
      const userDocRef = doc(db, "users", user.id);
      await updateDoc(userDocRef, { expoPushToken: expoPushToken });
    };
    expoPushToken !== "" &&
      user.expoPushToken !== expoPushToken &&
      updateToken();
  }, [expoPushToken]);

  const handleUpdate = async () => {
    try {
      // Check if image is not empty and update it
      const updatedData: any = {};

      if (newUsername.trim()) {
        updatedData.username = newUsername;
      }

      if (image && image.trim()) {
        updatedData.image = image;
      }

      if (Object.keys(updatedData).length > 0) {
        await updateDoc(doc(db, "users", user.id), updatedData);
      }

      const updatedUserData = await getDoc(doc(db, "users", user.id));

      setUser({ id: updatedUserData.id, ...updatedUserData.data() });

      // Clear input fields and close modal
      setImage("");
      setNewUsername("");
      setModalVisible(false);
    } catch (error) {
      console.error("Error updating user data:", error.message);
    }
  };

  return (
    <View>
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" />

        <TouchableOpacity style={styles.modalBackground} onPress={toggleModal}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              {user && RenderUserAvatar(user, 70)}
              <View style={styles.userInfoContainer}>
                <Text style={styles.username}>Hello, {user?.username}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <Text style={styles.joinDate}>
                  Member since: {formatJoinDate(user?.timestamp)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Text>{isEditing ? "Cancel" : "Edit Profile"}</Text>
            </TouchableOpacity>

            {isEditing ? (
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="New Username"
                  value={newUsername}
                  onChangeText={(text) => setNewUsername(text)}
                />
                <Text style={{ fontSize: 16, color: "#333", marginTop: 10 }}>
                  Click on the icon to update your profile image:
                </Text>
                {/* <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    height: 40,
                    marginVertical: 10,
                  }}
                >
                  <ImagePickerC type={"image"} size={36} color={"#4682B4"} />
                </View> */}
                <Button title="Update" onPress={handleUpdate} />
              </View>
            ) : (
              <View>
                <Text style={styles.discussionCount}>
                  Participated in {converations.length} discussions.
                </Text>
                <Text style={styles.discussionTitle}>Discussions:</Text>
                <FlatList
                  data={converations}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.participantsContainer}>
                      <Text style={styles.discussionItem}>{item.name}</Text>
                      <View style={styles.participantsContainer}>
                        <Text style={styles.textContainer}>with :</Text>
                        <FlatList
                          data={item.users}
                          keyExtractor={(index) => index}
                          renderItem={({ item }) => (
                            <RenderUserInformation sender={item} />
                          )}
                          horizontal // Arrange items horizontally
                        />
                      </View>
                    </View>
                  )}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
      <TouchableOpacity onPress={toggleModal}>
        <Feather name="user" size={26} color="#333" />
      </TouchableOpacity>
    </View>
  );
};

const formatJoinDate = (timestamp: {
  seconds: number;
  nanoseconds: number;
}) => {
  const joinDate = new Date(timestamp?.seconds * 1000); // Convert seconds to milliseconds
  return joinDate.toDateString();
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: "100%",
    height: "60%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 20,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 0,
  },
  userInfoContainer: {
    flex: 1,
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  email: {
    fontSize: 18,
    color: "#555",
  },
  joinDate: {
    fontSize: 16,
    color: "#777",
    marginTop: 5,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
  },
  editButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginBottom: 10,
  },
  discussionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  discussionItem: {
    fontSize: 16,
    color: "purple",
    fontWeight: "600",
    marginLeft: 10,
  },
  usersList: {
    fontSize: 14,
    color: "#777",
    marginLeft: 25,
  },
  discussionCount: {
    fontSize: 16,
    color: "black",
    marginBottom: 5,
  },
  participantsContainer: {
    flexDirection: "row",
    alignItems: "center", // Align items vertically in the center
  },

  textContainer: {
    flexShrink: 0, // Avoid text shrinking
    marginHorizontal: 5, // Add margin if needed
  },
});

export default Profile;
