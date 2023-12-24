import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface ImageContextType {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string | null>>;
  image: string;
  setImage: React.Dispatch<React.SetStateAction<string | null>>;
  loadingImage: boolean;
  setLoadingImage: React.Dispatch<React.SetStateAction<boolean | null>>;
  video: string;
  setVideo: React.Dispatch<React.SetStateAction<string | null>>;
  audio: string;
  setAudio: React.Dispatch<React.SetStateAction<string | null>>;
  file: string;
  setFile: React.Dispatch<React.SetStateAction<string | null>>;
  audioRecord: string;
  setAudioRecord: React.Dispatch<React.SetStateAction<string | null>>;
  imageRecord: string;
  setImageRecord: React.Dispatch<React.SetStateAction<string | null>>;
  recordedVideo: string;
  setRecordedVideo: React.Dispatch<React.SetStateAction<string | null>>;
  uploadProgress: number;
  setUploadProgress: React.Dispatch<React.SetStateAction<number | null>>;
  getHome: boolean;
  setGetHome: React.Dispatch<React.SetStateAction<boolean | null>>;
  downloadedVideo: string;
  setDowloadedVideo: React.Dispatch<React.SetStateAction<string | null>>;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [file, setFile] = useState<string | null>(null);
  const [audioRecord, setAudioRecord] = useState<string | null>(null);
  const [imageRecord, setImageRecord] = useState<any>(null);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState<any>(0);

  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [getHome, setGetHome] = useState<boolean>(false);
  const [downloadedVideo, setDowloadedVideo] = useState<string>("");

  return (
    <ImageContext.Provider
      value={{
        text,
        setText,
        image,
        setImage,
        loadingImage,
        setLoadingImage,
        video,
        setVideo,
        audio,
        setAudio,
        file,
        setFile,
        audioRecord,
        setAudioRecord,
        imageRecord,
        setImageRecord,
        recordedVideo,
        setRecordedVideo,
        uploadProgress,
        setUploadProgress,
        getHome,
        setGetHome,
        downloadedVideo,
        setDowloadedVideo,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};

export const useImage = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImage must be used within an ImageProvider");
  }
  return context;
};
