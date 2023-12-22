import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  Modal,
  Dimensions,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Camera, CameraType } from "expo-camera";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useImage } from "../../../AuthProvider/ImageProvider";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../../firebase";
import { useAuth } from "../../../AuthProvider/AuthProvider";
import { Audio } from "expo-av";

const VideoRecorder = () => {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [permissionResponse, requestPermissionAudio] = Audio.usePermissions();

  const [isRecording, setRecording] = useState(false);
  const { user } = useAuth();

  const { recordedVideo, setRecordedVideo } = useImage();
  console.log(
    "🚀 ~ file: VideoRecorder.tsx:36 ~ VideoRecorder ~ recordedVideo:",
    recordedVideo
  );
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const cameraRef = useRef(null);
  const { width } = Dimensions.get("window");
  const height = Math.round((width * 16) / 9);

  const startRecording = async () => {
    setRecording(true);
    if (cameraRef.current) {
      try {
        const { uri } = await cameraRef.current.recordAsync();

        const response = await fetch(uri);

        const blob = await response.blob();

        const storageRef = ref(
          storage,
          `${user.id}_${Date.now().toString()}.mp4`
        );

        uploadBytesResumable(storageRef, blob)
          .then(async () => {
            const res = await getDownloadURL(storageRef);
            setTimeout(() => {
              setRecordedVideo(res);
              setLoading(false);
            }, 2000);
          })

          .catch((error) => {
            console.log(
              "🚀 ~ file: VideoRecorder.tsx:69 ~ startRecording ~ error:",
              error
            );
          });
      } catch (error) {
        console.error("Error starting video recording:", error);
      }
    }
  };

  const stopRecording = () => {
    setRecording(false);
    setLoading(true);
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
    }
    // setModalVisible(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const openVideoRecorderModal = () => {
    setModalVisible(true);
  };

  const closeVideoRecorderModal = () => {
    setModalVisible(false);
    // Reset recorded video URI when closing the modal
    // setRecordedVideo(null);
  };

  if (
    !permissionResponse ||
    !permission ||
    !permission.granted ||
    !permissionResponse.granted
  ) {
    // Camera permissions are not granted yet
    return (
      <>
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          // style={styles.container}
        >
          <StatusBar backgroundColor="rgba(0, 0, 0, 0.9)" />

          <View
            style={[
              styles.modalContainer,
              {
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <Text
              style={{
                textAlign: "center",
                color: "white",
                fontSize: 18,
                marginHorizontal: 5,
              }}
            >
              We need your permission to access the camera and the microphone
            </Text>
            <View
              style={{
                maxWidth: "50%",
                // alignItems: "center",
                justifyContent: "center",
                gap: 30,
                marginTop: 40,
                // borderRadius: 50,
              }}
            >
              <Button
                onPress={requestPermission}
                title={
                  !permission?.granted ? "Grant Camera Permission" : "granted"
                }
              />
              <Button
                onPress={requestPermissionAudio}
                title={
                  !permission?.granted ? "Grant Audio Permission" : "granted"
                }
              />
              <Button
                onPress={closeVideoRecorderModal}
                title="Close"
                color={"purple"}
              />
            </View>
          </View>
        </Modal>
        <TouchableOpacity onPress={openVideoRecorderModal}>
          <FontAwesome5 name="video" size={24} color="black" />
        </TouchableOpacity>
      </>
    );
  }

  return (
    <View>
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "black" }}>
          <Camera
            style={{
              height: height,
              width: "100%",
            }}
            type={CameraType.back}
            ref={cameraRef}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              padding: 20,
              position: "absolute",
              bottom: 0,
              width: "100%",
            }}
          >
            <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleRecording}
            >
              <FontAwesome5
                name={isRecording ? "stop" : "video"}
                size={24}
                color={isRecording ? "red" : "white"}
              />
            </TouchableOpacity>
            {recordedVideo && !loading ? (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={closeVideoRecorderModal}
              >
                <FontAwesome5 name="check" size={24} color="white" />
              </TouchableOpacity>
            ) : (
              <View style={styles.iconButton}>
                {!isRecording && loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <TouchableOpacity onPress={closeVideoRecorderModal}>
                    <FontAwesome5 name="times" size={24} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
      <TouchableOpacity onPress={openVideoRecorderModal}>
        <FontAwesome5 name="video" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default VideoRecorder;

const styles = StyleSheet.create({
  iconButton: {
    padding: 15,
    backgroundColor: "lightblue",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 55,
  },
  modalContainer: {
    flex: 1,
    // position: "relative",
    // height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.9)",

    // bottom: 0,
    // justifyContent: "flex-end", // Align content at the bottom
  },
});
