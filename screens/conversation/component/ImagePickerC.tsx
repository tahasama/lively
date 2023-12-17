import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../../firebase";
import { useAuth } from "../../../AuthProvider/AuthProvider";
import * as DocumentPicker from "expo-document-picker";

import {
  Foundation,
  Ionicons,
  Entypo,
  MaterialIcons,
} from "@expo/vector-icons";

import { useImage } from "../../../AuthProvider/ImageProvider";
const ImagePickerC = ({ type }) => {
  const { user } = useAuth();
  const { image, setImage, setVideo, setFile, setLoadingImage, loadingImage } =
    useImage();

  const pickImageAsync = async () => {
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
        : await DocumentPicker.getDocumentAsync();
    console.log("🚀 ~ file: ImagePickerC.tsx:26 ~ pickImageAsync ~ result:");

    if (!result.canceled) {
      // dispatch(updateUserImageState(result.assets[0].uri));
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();

      const storageRef =
        type === "video"
          ? ref(storage, user.id + ".mp4")
          : type === "image"
          ? ref(storage, user.id + ".jpg")
          : ref(
              storage,
              user.id +
                "." +
                result.assets[0].uri.split(".")[
                  result.assets[0].uri.split(".").length - 1
                ]
            );

      uploadBytesResumable(storageRef, blob)
        .then(async () => {
          const res = await getDownloadURL(storageRef);
          setTimeout(() => {
            // dispatch(updateUserImage({ userImage: res, userId: user.id }));
            type === "video"
              ? setVideo(res)
              : type === "video"
              ? setImage(res)
              : setFile(res);
          }, 2000),
            setLoadingImage(false);
        })

        .catch((error) => {
          setLoadingImage(false);
        });
    } else {
      setLoadingImage(false);
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
    <TouchableOpacity style={{ marginLeft: 10 }} onPress={pickImageAsync}>
      {type === "image" && <Entypo name="image" size={24} color="black" />}
      {type === "video" && (
        <Foundation name="play-video" size={34} color="black" />
      )}
      {type === "audio" && (
        <MaterialIcons name="audiotrack" size={24} color="black" />
      )}
      {type === "file" && <Ionicons name="attach" size={30} color="black" />}
    </TouchableOpacity>
  );
};

export default ImagePickerC;
