import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { collection, doc, getDoc } from "firebase/firestore"; // Import Firebase Firestore functions
import { db } from "../../../firebase";
import VideoPlayer from "./VideoPlayer";
import AudioPlayer from "./AudioPlayer";
import FileLink from "./FilePlayer";
import { useImage } from "../../../AuthProvider/ImageProvider";
import FilePlayer from "./FilePlayer";

const MessageBubble = ({ message, isSender }) => {
  console.log(
    "🚀 ~ file: MessageBubble.tsx:12 ~ MessageBubble ~ message:",
    message
  );
  const [userData, setUserData] = useState(null);
  const xxx =
    "https://firebasestorage.googleapis.com/v0/b/lively-5824e.appspot.com/o/cVWlGmB4Mz94ZwP07dKY.docx?alt=media&token=43e06eea-2e55-47e3-8aa5-3629717a17bf";

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
      <View style={styles.messageContent}>
        {message.image && (
          <Image
            style={{
              width: 214,
              height: 135,
              resizeMode: "contain",
              borderRadius: 10,
              right: 0,
              top: 0,
            }}
            source={{ uri: message.image }}
          />
        )}
        {message.video && (
          // Render your video component (e.g., using Video or other components)
          <VideoPlayer source={message.video} />
        )}
        {message.audio && <AudioPlayer audioUri={message.audio} />}
        {message.file && <FilePlayer fileUrl={message.file} />}
        <View
          style={{
            marginTop: 5,
          }}
        >
          {message.text && (
            <Text style={styles.messageText}>{message.text}</Text>
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
                  {renderUserAvatar()}
                </View>
                <Text style={styles.messageText}>~ {userData.username}</Text>
              </View>
            )}

            <Text style={styles.timestamp}>
              {formatTimestamp(message.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 8,
    margin: 5,
    maxWidth: "80%",
    borderRadius: 15, // Increase border radius for rounded corners
    alignSelf: "flex-start",
  },
  image: {
    maxWidth: 200,
    width: "100%",
    aspectRatio: 1, // Maintain aspect ratio (1:1 in this case)
    backgroundColor: "red",
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
    color: "#666",
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
    marginLeft: 8,
    alignItems: "center",
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
