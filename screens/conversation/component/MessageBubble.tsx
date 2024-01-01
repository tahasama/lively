import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { collection, doc, getDoc } from "firebase/firestore"; // Import Firebase Firestore functions
import { db, dbr } from "../../../firebase";
import VideoPlayer from "./VideoPlayer";
import AudioPlayer from "./AudioPlayer";
import FileLink from "./FilePlayer";
import { useImage } from "../../../AuthProvider/ImageProvider";
import FilePlayer from "./FilePlayer";
import EnlargedImage from "./EnlargedImage";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useAuth } from "../../../AuthProvider/AuthProvider";
import { ref, remove, update } from "firebase/database";

const MessageBubble = ({ message, isSender, conversationId }: any) => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [reaction, setReaction] = useState<boolean>(false);

  const fetchUserData = async () => {
    if (message.user.id) {
      const userDocRef = doc(db, "users", message.user.id);

      try {
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const user = userDocSnapshot.data();
          setUserData(user);
        } else {
          console.error("User not found in Firestore");
        }
      } catch (error) {
        console.error("Error fetching user data from Firestore:", error);
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [message.userId]);

  const formatTimestamp = (timestamp) => {
    // Implement your timestamp formatting logic here
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleImageClick = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleMessage = () => {
    setReaction(true);
  };

  const removeMessage = async () => {
    const rtdb = `groups/${conversationId}/messages/${message._id}`;
    const conversationRef = ref(dbr, rtdb);

    await update(conversationRef, { alert: "This message was removed" });
    setReaction(false);
  };

  const reactionMenu = (
    <View>
      {/* Common JSX for both sender and receiver */}
      {/* <Text>Common Content</Text> */}

      {message.user.id !== user.id ? (
        // JSX for sender
        <Text>Sender Content</Text>
      ) : (
        // JSX for receiver
        <TouchableOpacity onPress={removeMessage}>
          <Text>Remove</Text>
        </TouchableOpacity>
      )}

      {/* More common JSX for both sender and receiver */}
      {/* <Text>More Common Content</Text> */}
    </View>
  );

  return (
    <View style={{ position: "relative" }}>
      <View
        style={[
          styles.messageContainer,
          isSender ? styles.senderMessage : styles.receiverMessage,
        ]}
      >
        {message?.alert === "" ? (
          <TouchableOpacity
            style={styles.messageContent}
            onLongPress={handleMessage}
          >
            <TouchableOpacity onPress={handleImageClick}>
              {(message.image || message.imageRecord) && (
                <Image
                  style={{
                    width: Dimensions.get("window").width * 0.5, // Set width to full screen width
                    height: Dimensions.get("window").width * 0.5, // Maintain aspect ratio
                    // aspectRatio: 1,
                    resizeMode: "contain",
                    // Add other styles as needed
                  }}
                  source={{ uri: message.image || message.imageRecord }}
                />
              )}
              {isModalVisible && (
                <EnlargedImage
                  imageUri={message.image || message.imageRecord}
                  onClose={handleCloseModal}
                />
              )}
            </TouchableOpacity>

            {(message.video || message.recordedVideo) && (
              // Render your video component (e.g., using Video or other components)
              <VideoPlayer
                source={message.video || message.recordedVideo}
                thumbnail={message.thumnail}
              />
            )}

            {(message.audio || message.audioRecord) && (
              <AudioPlayer audioUri={message.audio || message.audioRecord} />
            )}
            {message.file && <FilePlayer fileUrl={message.file} />}
            <View
              style={{
                marginTop: 5,
              }}
            >
              {message.text && (
                <Text
                  style={[
                    styles.messageText,
                    { color: "black", marginLeft: !isSender ? 36 : 0 },
                  ]}
                >
                  {message.text}
                </Text>
              )}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {userData && !isSender && (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={styles.userAvatarContainer}>
                      {renderUserAvatar(userData, 30)}
                    </View>
                    <Text style={styles.messageText}>
                      ~ {userData.username}
                    </Text>
                  </View>
                )}

                <Text
                  style={[
                    styles.timestamp,
                    { color: isSender ? "#444" : "gray" },
                  ]}
                >
                  {formatTimestamp(message.createdAt)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <Text>{message?.alert} </Text>
        )}
        {reaction && (
          <View
            style={{
              bottom: -3,
              position: "absolute",
              backgroundColor: "white",
              right: message.user.id === user.id ? 50 : -50,
              // left: message.user.id !== user.id ? 50 : 0,
              padding: 7,
              borderRadius: 10,
              elevation: 5,
            }}
          >
            {reactionMenu}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    margin: 5,
    maxWidth: "80%",
    borderRadius: 15, // Increase border radius for rounded corners
    alignSelf: "flex-start",
    position: "relative",
  },
  image: {
    maxWidth: 200,
    width: "100%",
    aspectRatio: 1, // Maintain aspect ratio (1:1 in this case)
    resizeMode: "contain", // Ensure the entire image fits within the specified dimensions
    alignSelf: "flex-start", // Align the image to the start of the container
  },

  senderMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#2db4e2", // Set sender background color
  },
  receiverMessage: {
    backgroundColor: "#e3e3e3", // Set receiver background color
  },
  userAvatarContainer: {
    marginRight: 8,
  },

  messageContent: {
    maxWidth: 280,
    flexDirection: "column", // Align avatar and message text horizontally
    zIndex: 0,
  },
  messageText: {
    fontSize: 16,
    color: "#666",
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
    marginLeft: 8,
    alignItems: "center",
  },
  emptyAvatarContainer: {
    borderRadius: 15,
    backgroundColor: "#2db4e2",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyAvatarText: {
    color: "white",
    fontSize: 16,
  },
});

export default MessageBubble;

export const renderUserAvatar = (userData, dimensions) => {
  if (userData && userData.image !== "") {
    return (
      <View style={styles.userAvatarContainer}>
        <Image
          source={{ uri: userData.image }}
          style={{ width: dimensions, height: dimensions, borderRadius: 15 }}
        />
      </View>
    );
  } else {
    // If image is an empty string, render a circle with the first letter of the username
    const initials = userData.username
      ? userData.username[0].toUpperCase()
      : "";
    return (
      <View
        style={[
          styles.emptyAvatarContainer,
          { width: dimensions, height: dimensions },
        ]}
      >
        <Text style={styles.emptyAvatarText}>{initials}</Text>
      </View>
    );
  }
};
