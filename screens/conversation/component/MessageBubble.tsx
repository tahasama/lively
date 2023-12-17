import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { collection, doc, getDoc } from "firebase/firestore"; // Import Firebase Firestore functions
import { db } from "../../../firebase";
import VideoPlayer from "./VideoPlayer";
import AudioPlayer from "./AudioPlayer";
import FileLink from "./FileLink";
import { useImage } from "../../../AuthProvider/ImageProvider";

const MessageBubble = ({ message, isSender }) => {
  const [userData, setUserData] = useState(null);
  const { file, setFile } = useImage();

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
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderUserAvatar = () => {
    if (userData && userData.image !== "") {
      return (
        <View style={styles.userAvatarContainer}>
          <Image source={{ uri: userData.image }} style={styles.userAvatar} />
        </View>
      );
    } else {
      // If image is an empty string, render a circle with the first letter of the username
      const initials = userData.username
        ? userData.username[0].toUpperCase()
        : "";
      return (
        <View style={styles.emptyAvatarContainer}>
          <Text style={styles.emptyAvatarText}>{initials}</Text>
        </View>
      );
    }
  };

  return (
    <View
      style={[
        styles.messageContainer,
        isSender ? styles.senderMessage : styles.receiverMessage,
      ]}
    >
      {userData && !isSender && (
        <View style={styles.messageContent}>
          <Text style={styles.messageText}>{userData.username}</Text>
          <View style={styles.userAvatarContainer}>{renderUserAvatar()}</View>
        </View>
      )}
      <View style={styles.messageContent}>
        {message.image && (
          <Image style={styles.image} source={{ uri: message.image }} />
        )}
        {message.video && (
          // Render your video component (e.g., using Video or other components)
          <VideoPlayer source={message.video} />
        )}
        {/* {message.audio && (
          <AudioPlayer source={{ uri: message.audio }} />
        )}
        {message.file && (
          <FileLink onFilePick={() => setFile(file)} />
        )} */}
        <Text style={styles.messageText}>{message.text}</Text>
        <Text style={styles.timestamp}>
          {formatTimestamp(message.createdAt)}
        </Text>
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
  },
  image: {
    flex: 1,
    width: "100%", // Set the width to 50% of the container
    aspectRatio: 1, // Maintain the aspect ratio (adjust as needed)
    objectFit: "contain",
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
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  messageContent: {
    maxWidth: "70%",
    flexDirection: "column", // Align avatar and message text horizontally
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
    marginLeft: 8,
  },
  emptyAvatarContainer: {
    width: 30,
    height: 30,
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
