import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../../firebase";
import { useAuth } from "../../../AuthProvider/AuthProvider";
import { Entypo } from "@expo/vector-icons";
import { useImage } from "../../../AuthProvider/ImageProvider";
const ImagePickerC = () => {
  const { user } = useAuth();
  const { image, setImage, setLoadingImage, loadingImage } = useImage();

  const pickImageAsync = async () => {
    setLoadingImage(true);

    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      // dispatch(updateUserImageState(result.assets[0].uri));
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();

      const storageRef = ref(storage, user.id + ".jpg");

      uploadBytesResumable(storageRef, blob)
        .then(async () => {
          const res = await getDownloadURL(storageRef);
          setTimeout(() => {
            // dispatch(updateUserImage({ userImage: res, userId: user.id }));
            setImage(res);
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

  return (
    <TouchableOpacity style={{ marginLeft: 10 }} onPress={pickImageAsync}>
      <Entypo name="image" size={24} color="black" />
    </TouchableOpacity>
  );
};

export default ImagePickerC;
