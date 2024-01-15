import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import { db, dbr } from "../../firebase";
import { ref, set } from "firebase/database";
import { useAuth } from "../../AuthProvider/AuthProvider";
import { renderUserAvatar } from "./MessageBubble";

const RenderUserInformation = ({ sender }: any) => {
  // Fetch user information using the sender ID
  const { user } = useAuth();

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (sender && user && sender !== user.id) {
        try {
          const docSnap = await getDoc(doc(db, "users", sender));
          if (docSnap.exists()) {
            setUserData({ id: docSnap.id, ...docSnap.data() });
          }
        } catch (error) {
          console.error("Error fetching user data:", error.message);
        }
      }
    };
    // fetchUserData();
    user && fetchUserData();
  }, [sender]);

  if (!userData && user && sender !== user.id) {
    // Render loading state or placeholder content
    return <ActivityIndicator />;
  }
  return (
    <View style={styles.userInfo}>
      {renderUserAvatar(userData, 22)}
      {user && sender !== user.id && (
        <Text style={styles.messageSender}>{userData?.username}, </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  messageSender: {
    color: "#555",
    fontSize: 12,
    textTransform: "capitalize",
  },
});

export default RenderUserInformation;
