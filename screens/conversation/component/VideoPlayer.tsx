import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Button,
  Modal,
  StatusBar,
  Image,
  ActivityIndicator,
} from "react-native";
import * as VideoThumbnails from "expo-video-thumbnails";
import { Entypo } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const VideoPlayer = ({ source }) => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState<any>({});
  const [loading, setLoading] = useState<any>(true);
  const [isVisible, setVisible] = useState(false);
  // const [image, setImage] = useState(null);
  // console.log("🚀 ~ file: VideoPlayer.tsx:21 ~ VideoPlayer ~ image:", image);

  // const generateThumbnail = async () => {
  //   try {
  //     const { uri } = await VideoThumbnails.getThumbnailAsync(source, {
  //       time: 15000,
  //     });
  //     setImage(uri);
  //   } catch (e) {
  //     console.warn(e);
  //   }
  // };

  // useEffect(() => {
  //   generateThumbnail();
  // }, []);

  useEffect(() => {
    isVisible
      ? setTimeout(() => {
          setLoading(false);
        }, 1500)
      : setLoading(true);
  }, [isVisible]);

  return (
    <View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isVisible}
        onRequestClose={() => (setVisible(false), setLoading(true))}
      >
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" />
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Video
              ref={videoRef}
              style={styles.video}
              source={{
                uri: source,
              }}
              useNativeControls
              onPlaybackStatusUpdate={(status) => setStatus(status)}
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
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={[styles.buttonText, styles.button]}>Close</Text>
              </TouchableOpacity>
            </View>
            {loading && (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  marginTop: -40,
                }}
              >
                <ActivityIndicator size={40} />
              </View>
            )}
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          width: 150,
          height: 120,
        }}
      >
        <View
          style={{
            position: "absolute",
            backgroundColor: "white",
            paddingHorizontal: 18,
            paddingVertical: 8,
            borderRadius: 5,
          }}
        >
          <Text>Play</Text>
          <Entypo name="controller-play" size={24} color="black" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 16 / 9, // You can adjust the aspect ratio based on your video's dimensions
    backgroundColor: "black", // Background color while loading
    borderRadius: 10, // Adjust the border radius as needed
    // height: "100%",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: "100%",
    height: "100%",
    // margin: 20,
    backgroundColor: "rgba(0, 0, 0, 1)",
    // borderRadius: 20,
    // padding: 35,
    alignItems: "center",
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    elevation: 5,
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
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Adjust the opacity as needed
  },
  modalContainer: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
  },
});

export default VideoPlayer;
