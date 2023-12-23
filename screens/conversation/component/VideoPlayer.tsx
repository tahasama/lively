import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

const VideoPlayer = ({ source }) => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState<any>({});
  const [loading, setLoading] = useState<any>(true);
  const [isOverlayVisible, setOverlayVisible] = useState(true);

  const handlePlay = async () => {
    setOverlayVisible(false);
    await videoRef.current.playAsync();
  };

  useEffect(() => {
    source !== "" &&
      setTimeout(() => {
        setLoading(false);
      }, 5000);
  }, []);

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
          {!loading ? (
            <Ionicons name="play-circle" size={60} color="white" />
          ) : (
            <ActivityIndicator size={40} />
          )}
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
