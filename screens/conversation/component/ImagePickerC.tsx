import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../../firebase";
import { useAuth } from "../../../AuthProvider/AuthProvider";
import DocumentPicker from "react-native-document-picker";

import {
  Foundation,
  Ionicons,
  Entypo,
  MaterialIcons,
} from "@expo/vector-icons";

import { useImage } from "../../../AuthProvider/ImageProvider";
const ImagePickerC = ({ type }) => {
  const { user } = useAuth();
  const { image, setImage, setVideo, setLoadingImage, loadingImage } =
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
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 1,
          });

    if (!result.canceled) {
      // dispatch(updateUserImageState(result.assets[0].uri));
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();

      const storageRef =
        type === "video"
          ? ref(storage, user.id + ".mp4")
          : ref(storage, user.id + ".jpg");

      uploadBytesResumable(storageRef, blob)
        .then(async () => {
          const res = await getDownloadURL(storageRef);
          setTimeout(() => {
            // dispatch(updateUserImage({ userImage: res, userId: user.id }));
            type === "video" ? setVideo(res) : setImage(res);
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
