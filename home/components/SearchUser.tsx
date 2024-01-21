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
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { EvilIcons, AntDesign } from "@expo/vector-icons";
import { useAuth } from "../../AuthProvider/AuthProvider";
import { useImage } from "../../AuthProvider/ImageProvider";
import { LinearGradient } from "expo-linear-gradient";

const SearchUser = ({ navigation, icon, conversationId, title }) => {
  const route = useRoute();
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [canShowNotFound, setCanShowNotFound] = useState(false);

  const { user, darkMode } = useAuth();
  const { setGetHome } = useImage();

  // const navigation = useNavigation();

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    !searchTerm && setCanShowNotFound(false);
  }, [searchTerm]);

  const handleLookForUser = async () => {
    try {
      setLoading(true);
      setError("");

      // Create a new group in Firestore
      const usersCollection = collection(db, "users");
      const q = query(
        usersCollection,
        where("username", "==", searchTerm.toLocaleLowerCase())
      );

      const querySnapshot = await getDocs(q);

      const foundUsers = [];
      querySnapshot.forEach((doc) => {
        foundUsers.push({ id: doc.id, ...doc.data() });
      });

      setUsers(foundUsers);

      setLoading(false);
      Keyboard.dismiss();
      setCanShowNotFound(true);
    } catch (error) {
      setError("Error searching for user");
      setLoading(false);
      console.error("Error searching for user:", error.message);
    }
  };

  const handleCreateGroup = async (item: any) => {
    if (conversationId === "") {
      try {
        // Create a new group in Firestore
        const groupsCollection = collection(db, "groups");

        // Ensure consistent order of users in the array
        const usersArray = [user.id, item.id].sort();

        // Check if a group with these users already exists
        const q = query(groupsCollection, where("users", "==", usersArray));
        const querySnapshot = await getDocs(q);

        const foundGroup = [];
        querySnapshot.forEach((doc) => {
          foundGroup.push({ id: doc.id, ...doc.data() });
        });

        if (foundGroup.length === 0) {
          if (user.id !== item.id) {
            // Use doc with a specific ID instead of addDoc
            const newGroupRef = await addDoc(groupsCollection, {
              name: item.username + "-" + user.username,
              creator: user,
              users: usersArray,
              messages: [],
              createdAt: serverTimestamp(),
              // Add more group data as needed
            });

            // Close the modal
            toggleModal();

            // Navigate to the screen for conversation
            navigation.navigate("Conversation", {
              conversationId: newGroupRef.id,
              title: item.username + "-" + user.username,
              participants: usersArray,
            });
            schedulePushNotification(item, newGroupRef.id);
            setGetHome(true);
          } else {
            setError("You can't talk with yourself!");
          }
        } else {
          console.log("Group already exists", foundGroup[0].id);
          navigation.navigate("Conversation", {
            conversationId: foundGroup[0].id,
            title: foundGroup[0].name,
          });
        }
      } catch (error) {
        console.error("Error creating group:", error.message);
      }
    } else {
      // Check if the user is already in the group
      const existingGroup = await getDoc(doc(db, "groups", conversationId));
      if (existingGroup.exists()) {
        const groupData = existingGroup.data();
        if (groupData.users && !groupData.users.includes(item.id)) {
          await updateDoc(doc(db, "groups", conversationId), {
            users: arrayUnion(item.id),
          });
          setGetHome(true);
          toggleModal();
          schedulePushNotification(item, conversationId);
        } else {
          // User is already in the group, do nothing
          setError(`${item.username} is already in this group`);
        }
      }
    }
  };

  function schedulePushNotification(item: any, newGroupRefId: any) {
    let response = fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: item.expoPushToken,
        title: `${user.username} added you ${
          title !== user.username ? `to a Conversation ${title}` : ""
        }`,
        body: "Please check your conversation list",

        data: { conversationId: newGroupRefId, title: title, type: "create" },
        // channelId: "vvv",
      }),
    });
  }

  return (
    <View style={styles.container}>
      {/* Button to open the modal for creating a group */}
      <TouchableOpacity
        onPress={toggleModal}
        style={[
          icon !== "adduser" ? styles.addButton : styles.addUsers,
          {
            backgroundColor:
              route.name !== "Conversation"
                ? !darkMode
                  ? "#7272e5"
                  : "#5b5bb7"
                : darkMode
                ? "#262626"
                : "#f2f2f2",
          },
        ]}
      >
        {icon !== "adduser" ? (
          <EvilIcons
            name="search"
            size={46}
            color="white"
            style={{ marginBottom: 7 }}
          />
        ) : (
          <AntDesign
            name="adduser"
            size={26}
            color={darkMode ? "#7272e5" : "black"}
          />
        )}
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
          <StatusBar
            backgroundColor={
              darkMode ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 0.5)"
            }
          />
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
                  {
                    backgroundColor: darkMode ? "#666666" : "#f6f6f6",
                    color: darkMode ? "#efefef" : "#333",
                    borderColor: darkMode ? "#333333" : "#ccc",
                  },
                ]}
                placeholder=" Search by username..."
                placeholderTextColor={darkMode ? "#efefef" : "#333"}
                value={searchTerm}
                onChangeText={(text) => {
                  setSearchTerm(text);
                  setError("");
                }}
              />
              {/* Button to create the group */}
              <TouchableOpacity
                onPress={handleLookForUser}
                disabled={loading} // Disable the button during loading
              >
                <LinearGradient
                  colors={[
                    darkMode ? "#274f92" : "#4285F4",
                    darkMode ? "#1f3f74" : "#346ac3",
                  ]}
                  style={[styles.cancelButton]}
                >
                  <Text style={styles.buttonText}>
                    {loading ? "Searching..." : "Look for a friend"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : users.length !== 0 ? (
                <FlatList
                  data={users}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleCreateGroup(item)}>
                      <View style={styles.userItem}>
                        <Text style={styles.usernameText}>{item.username}</Text>
                        <Text style={styles.startConversationText}>
                          Tap to start a conversation
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.id}
                />
              ) : (
                canShowNotFound &&
                searchTerm !== "" && (
                  <Text style={{ color: "#7f0000", marginTop: 3 }}>
                    User not found, try a different name.
                  </Text>
                )
              )}

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
                      { color: !darkMode ? "#626262" : "white" },
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
    left: 20,
  },
  addUsers: {
    height: "100%",
    justifyContent: "center",
    marginRight: 10,
  },
  modalContainer: {
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
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginTop: 10,
  },
  userItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 12,
  },
  usernameText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#3c0068",
  },
  startConversationText: {
    color: "#555",
    fontSize: 14,
  },
});

export default SearchUser;
