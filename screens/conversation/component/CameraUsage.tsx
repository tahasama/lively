import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  Button,
  StyleSheet,
  StatusBar,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../../firebase";
import { useAuth } from "../../../AuthProvider/AuthProvider";

import {
  Foundation,
  Ionicons,
  Entypo,
  MaterialIcons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { useImage } from "../../../AuthProvider/ImageProvider";
import RecordingSounds from "./RecordingSounds";
import VideoRecorder from "./VideoRecorder";
import { Camera, CameraType } from "expo-camera";

function CameraUsage() {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  const { setImageRecord, setLoadingImage } = useImage();

  const [isModalVisible, setModalVisible] = useState(false);
  const cameraRef = useRef(null);
  const { width, height } = Dimensions.get("window");
  // const height = Math.round((width * 16) / 9);
  const { user } = useAuth();

  const handleCameraReady = () => {
    // Adjust aspect ratio based on device orientation
    const isLandscape = width > height;

    let aspectRatio;
    if (isLandscape) {
      aspectRatio = height / width;
    } else {
      aspectRatio = width / height;
    }

    // Update camera aspect ratio
    if (cameraRef.current) {
      cameraRef.current
        .getSupportedRatiosAsync()
        .then((ratios) => {
          if (ratios.includes(String(aspectRatio))) {
            cameraRef.current.setRatio(aspectRatio);
          }
        })
        .catch((error) => {
          console.error("Error setting camera aspect ratio:", error);
        });
    }
  };

  const takePicture = async () => {
    // if (cameraRef.current) {
    const photo = await cameraRef.current.takePictureAsync();

    const response = await fetch(photo.uri);

    const blob = await response.blob();

    const storageRef = ref(storage, `${user.id}_${Date.now().toString()}.jpg`);

    uploadBytesResumable(storageRef, blob)
      .then(async () => {
        const res = await getDownloadURL(storageRef);
        setTimeout(() => {
          setImageRecord(res);
        }, 2000),
          setLoadingImage(false);
        setModalVisible(false); // Close the modal after taking a picture
      })

      .catch((error) => {
        setLoadingImage(false);
      });
  };

  const toggleCameraType = () => {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  const openCameraModal = () => {
    setModalVisible(true);
  };

  const closeCameraModal = () => {
    setModalVisible(false);
  };

  if (!permission || !permission.granted) {
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
              We need your permission to access the camera
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
              <Button onPress={requestPermission} title="Grant Permission" />
              <Button
                onPress={closeCameraModal}
                title="Close"
                color={"purple"}
              />
            </View>
          </View>
        </Modal>
        <TouchableOpacity onPress={openCameraModal}>
          <MaterialCommunityIcons name="camera" size={25} color="black" />
        </TouchableOpacity>
      </>
    );
  }

  return (
    <View>
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <StatusBar backgroundColor="rgba(0, 0, 0, 0.9)" />

          <Camera
            ratio="16:9"
            // style={styles.camera}
            style={{
              height: height - 100,
              width: width,
            }}
            type={type}
            ref={cameraRef}
            onCameraReady={handleCameraReady}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleCameraType}
            >
              <FontAwesome5 name="sync" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={takePicture}>
              <FontAwesome5 name="camera" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={closeCameraModal}
            >
              <FontAwesome5 name="times" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TouchableOpacity onPress={openCameraModal}>
        <MaterialCommunityIcons name="camera" size={25} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  modalContainer: {
    flex: 1,
    // position: "relative",
    // height: "100%",
    backgroundColor: "rgba(0, 0, 0, 1)",

    // bottom: 0,
    // justifyContent: "flex-end", // Align content at the bottom
  },
  camera: {
    flex: 1,
    // width: "100%",
    // aspectRatio: 0.5,
    // position: "absolute",
    // height: "100%",
    // bottom: 0,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,

    width: "100%",
    alignItems: "center",
  },
  iconButton: {
    padding: 15,
    backgroundColor: "lightblue",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 55,
  },
});

export default CameraUsage;
