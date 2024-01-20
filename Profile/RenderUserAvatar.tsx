import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const RenderUserAvatar = (userData, dimensions, darkMode, route) => {
  if (userData && userData.image !== "") {
    return (
      <View style={styles.userAvatarContainer}>
        <Image
          source={{ uri: userData.image }}
          style={{
            width: dimensions,
            height: dimensions,
            borderRadius: 15,
            borderColor: "gray",
            borderWidth: 0.3,
          }}
        />
      </View>
    );
  } else if (userData && userData.username !== undefined) {
    // If image is an empty string, render a circle with the first letter of the username
    const initials =
      userData && userData?.username ? userData.username[0].toUpperCase() : "";
    return (
      <View
        style={[
          styles.emptyAvatarContainer,
          {
            width: dimensions,
            height: dimensions,
            backgroundColor: !darkMode ? "#2db4e2" : "#165a71",
          },
        ]}
      >
        <Text
          style={{
            color: darkMode ? "#adadad" : "#d9d9d9",
            fontSize: route && route.name === "Conversation" ? 18 : 14,
            marginTop: route && route.name === "Conversation" ? 2 : 0,
          }}
        >
          {initials}
        </Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  userAvatarContainer: {
    marginRight: 4,
  },
  emptyAvatarContainer: {
    borderRadius: 15,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  emptyAvatarText: {
    color: "white",
    fontSize: 16,
  },
});

export default RenderUserAvatar;
