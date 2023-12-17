import { ResizeMode, Video } from "expo-av";
import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Button } from "react-native";

const VideoPlayer = ({ source }) => {
  console.log("🚀 ~ file: VideoPlayer.tsx:6 ~ VideoPlayer ~ source:", source);
  const videoRef = useRef(null);
  const [status, setStatus] = useState<any>({});

  return (
    <View style={styles.videoContainer}>
      <Video
        ref={videoRef}
        style={styles.video}
        source={{
          uri: source,
        }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
      />
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            status.isPlaying
              ? videoRef.current.pauseAsync()
              : videoRef.current.playAsync()
          }
        >
          <Text style={styles.buttonText}>
            {status.isPlaying ? "Pause" : "Play"}
          </Text>
        </TouchableOpacity>
        {/* Add more buttons as needed */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 16 / 9, // You can adjust the aspect ratio based on your video's dimensions
    backgroundColor: "black", // Background color while loading
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  playPauseButton: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 10,
    borderRadius: 5,
  },
  playPauseButtonText: {
    fontSize: 16,
  },
  buttons: {
    flexDirection: "row",
    marginTop: 10,
  },
  button: {
    marginHorizontal: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#2db4e2", // Set your desired button color
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default VideoPlayer;
