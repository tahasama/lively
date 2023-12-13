import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { db, dbr } from "../../../firebase";
import { ref, set } from "firebase/database";

const renderUserInformation = ({ sender }: { sender: string }) => {
  console.log(
    "🚀 ~ file: renderUserInformation.tsx:7 ~ renderUserInformation ~ sender:",
    sender
  );
  // Fetch user information using the sender ID
  const [userData, setUserData] = useState(null);
  console.log(
    "🚀 ~ file: renderUserInformation.tsx:13 ~ renderUserInformation ~ userData:",
    userData
  );

  const [title, setTitle] = useState("yooo!!!!");

  const TestDbr = () => {
    console.log("dbr:", dbr);
    const postsRef = ref(dbr, "posts/");
    console.log("postsRef:", postsRef);

    set(postsRef, {
      title: "hello yo",
    })
      .then(() => {
        console.log("Data successfully written");
      })
      .catch((error) => {
        console.error("Error writing data:", error.message);
      });
  };

  useEffect(() => {
    TestDbr();
  }, []);

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
          <Text style={styles.messageSender}>{userData.username}</Text>
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

export default renderUserInformation;
