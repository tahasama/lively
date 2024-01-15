import * as VideoThumbnails from "expo-video-thumbnails";
import { storage } from "../firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

export const generateThumbnail = async (source: string) => {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(source, {
      time: 15000,
    });
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef: any = ref(
      storage,
      `Thumbnail_${Date.now().toString()}.jpg`
    );

    const uploadTask = uploadBytesResumable(storageRef, blob);

    const snapshot = await uploadTask;

    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (e) {
    console.log(e);
  }
};
