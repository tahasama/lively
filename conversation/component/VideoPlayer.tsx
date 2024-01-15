import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Image,
} from "react-native";
import { Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

const VideoPlayer = ({ source, thumbnail }) => {
  const handlePlay = async () => {
    // Check if the URL is valid before attempting to open it
    if (Linking.canOpenURL(source)) {
      Linking.openURL(source);
    } else {
      console.warn(`Invalid URL: ${source}`);
    }
  };
  return (
    <View style={styles.container}>
      {thumbnail && <Image source={{ uri: thumbnail }} style={styles.image} />}
      <TouchableOpacity style={styles.overlay} onPress={handlePlay}>
        <Ionicons name="play-circle" size={60} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 200,
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: "#23282d",
  },
  image: {
    flex: 1,
    width: 200,
    aspectRatio: 1,
    borderRadius: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default VideoPlayer;
