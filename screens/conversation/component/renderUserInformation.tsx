import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { db, dbr } from "../../../firebase";
import { ref, set } from "firebase/database";

const RenderUserInformation = ({ sender }) => {
  console.log(
    "🚀 ~ file: renderUserInformation.tsx:8 ~ renderUserInformation ~ sender:",
    sender
  );
  // Fetch user information using the sender ID
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const docSnap = await getDoc(doc(db, "users", sender));
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    };

    fetchUserData();
  }, [sender]);

  return (
    <View>
      {userData && (
        <>
          <Text style={styles.messageSender}>{userData.username},</Text>
          {/* Add other user information as needed */}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  messageSender: {
    color: "#555",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 3,
    marginLeft: 8,
    textTransform: "capitalize",
  },
});

export default RenderUserInformation;
