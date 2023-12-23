import React, { useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

const VideoPlayer = ({ source }) => {
  console.log("🚀 ~ file: VideoPlayer.tsx:7 ~ VideoPlayer ~ source:", source);
  const videoRef = useRef(null);
  const [status, setStatus] = useState<any>({});
  const [isOverlayVisible, setOverlayVisible] = useState(true);

  const handlePlay = async () => {
    setOverlayVisible(false);
    await videoRef.current.playAsync();
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        style={styles.video}
        source={{
          uri: source,
        }}
        useNativeControls
        onPlaybackStatusUpdate={(status) => setStatus(status)}
      />

      {isOverlayVisible && (
        <TouchableOpacity style={styles.overlay} onPress={handlePlay}>
          <Ionicons name="play-circle" size={60} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    flex: 1,
    width: 200,
    aspectRatio: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default VideoPlayer;
