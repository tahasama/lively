import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../firebase";
import { useAuth } from "../../AuthProvider/AuthProvider";
import * as DocumentPicker from "expo-document-picker";

import {
  Foundation,
  Ionicons,
  Entypo,
  MaterialIcons,
} from "@expo/vector-icons";

import { useImage } from "../../AuthProvider/ImageProvider";
import RecordingSounds from "./RecordingSounds";
import CameraUsage from "./CameraUsage";
import VideoRecorder from "./VideoRecorder";
const ImagePickerC = ({ type, size, color }) => {
  const { user } = useAuth();
  const {
    image,
    setImage,
    setVideo,
    setFile,
    setAudio,
    uploadProgress,
    setUploadProgress,
    setLoadingImage,
    setAudioRecord,
    loadingImage,
  } = useImage();

  const pickImageAsync = async () => {
    if (type !== "audioRecord" && type !== "imageRecord") {
      setLoadingImage(true);

      let result =
        type === "image"
          ? await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              quality: 1,
            })
          : type === "video"
          ? await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Videos,
              allowsEditing: true,
              quality: 1,
            })
          : type === "audio"
          ? await DocumentPicker.getDocumentAsync({
              type: "audio/*",
            })
          : type === "file" && (await DocumentPicker.getDocumentAsync());

      if (result.canceled) {
        setLoadingImage(false);
        return;
      }

      try {
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();

        const storageRef =
          type === "video"
            ? ref(storage, `${user.id}_${Date.now().toString()}.mp4`)
            : type === "image"
            ? ref(storage, `${user.id}_${Date.now().toString()}.jpg`)
            : ref(
                storage,
                `${user.id}_${Date.now().toString()}` +
                  "." +
                  result.assets[0].uri.split(".")[
                    result.assets[0].uri.split(".").length - 1
                  ]
              );

        const uploadTask = uploadBytesResumable(storageRef, blob);

        // Set up an event listener to track the upload progress
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
            // You can update the UI to show the progress to the user
          },
          (error) => {
            console.error("Error during upload:", error);
            // Handle errors
            setLoadingImage(false);
          },
          async () => {
            // Upload completed successfully
            try {
              const res = await getDownloadURL(storageRef);
              setTimeout(() => {
                type === "video"
                  ? setVideo(res)
                  : type === "image"
                  ? setImage(res)
                  : type === "audio"
                  ? setAudio(res)
                  : setFile(res);
              }, 2000);
            } catch (error) {
              console.error("Error getting download URL:", error);
            } finally {
              setTimeout(() => {
                setLoadingImage(false);
              }, 300);
            }
          }
        );
      } catch (error) {
        console.error("Error fetching image data:", error);
        setLoadingImage(false);
      }
    }
  };

  if (loadingImage) {
    return (
      <View>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  const Types = ["file", "image", "audio", "video"];

  return (
    <TouchableOpacity style={{ marginLeft: 0 }} onPress={pickImageAsync}>
      {type === "image" && <Entypo name="image" size={size} color={color} />}
      {type === "video" && (
        <Foundation name="play-video" size={34} color="black" />
      )}
      {type === "audio" && (
        <MaterialIcons name="audiotrack" size={24} color="black" />
      )}
      {type === "file" && <Ionicons name="attach" size={30} color="black" />}
      {type === "audioRecord" && <RecordingSounds />}
      {type === "imageRecord" && <CameraUsage />}
      {type === "recordedVideo" && <VideoRecorder />}
    </TouchableOpacity>
  );
};

export default ImagePickerC;
