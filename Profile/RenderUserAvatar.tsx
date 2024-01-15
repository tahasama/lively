import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const RenderUserAvatar = (userData, dimensions) => {
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
          { width: dimensions, height: dimensions },
        ]}
      >
        <Text style={styles.emptyAvatarText}>{initials}</Text>
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
    backgroundColor: "#2db4e2",
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
