import { View, Image, Text, StyleSheet } from "react-native";
import { useAuth } from "../../../AuthProvider/AuthProvider";

import userImage from "../image/user.jpg";
const renderAvatar = (props) => {
  const { currentMessage } = props;
  const { user } = useAuth();

  // If the current message is from the current user, don't customize the avatar
  if (currentMessage.user._id === user.id) {
    return null;
  }

  // Use your logic to get the sender's information (e.g., name and image)
  const senderName = currentMessage.user.name;
  // Replace the following line with the actual avatar URL or path

  return (
    <View style={styles.avatarContainer}>
      <Text style={styles.senderName}>{senderName}</Text>
      <Image source={userImage} style={styles.avatarImage} />
      {/* <Text>HG</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    position: "relative",
    marginLeft: 10,
  },
  avatarImage: {
    width: 30,
    height: 30,
    borderRadius: 20,
    top: -20,
    left: 2,
    position: "relative",
  },

  senderName: {
    fontSize: 12,
    color: "gray",
    marginBottom: 20,
    // top: 28,
    // left: 60,
    // position: "absolute",
  },
});

export default renderAvatar;
