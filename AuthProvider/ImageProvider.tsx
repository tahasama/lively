import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface ImageContextType {
  image: string;
  setImage: React.Dispatch<React.SetStateAction<string | null>>;
  loadingImage: boolean;
  setLoadingImage: React.Dispatch<React.SetStateAction<boolean | null>>;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);

  return (
    <ImageContext.Provider
      value={{ image, setImage, loadingImage, setLoadingImage }}
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
