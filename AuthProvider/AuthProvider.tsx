import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  user: any;
  setUser: any;
  expoPushToken: any;
  setExpoPushToken: any;
  notification: any;
  setNotification: any;
  notificationR: any;
  setNotificationR: any;
  converations: any;
  setConverations: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string[]>([]);
  const [notification, setNotification] = useState<any>(false);
  const [notificationR, setNotificationR] = useState<any>(false);
  const [converations, setConverations] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserData: any = await AsyncStorage.getItem("userData");

        if (storedUserData) {
          setUser(JSON.parse(storedUserData));
        } else {
          const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
              const usersCollection = collection(db, "users");
              const q = query(
                usersCollection,
                where("uid", "==", authUser.uid)
              );

              const querySnapshot = await getDocs(q);

              const foundUsers = [];
              querySnapshot.forEach((doc) => {
                foundUsers.push({ id: doc.id, ...doc.data() });
              });

              // Use a callback when setting the user data to handle async behavior
              setUser(foundUsers[0]);
              await AsyncStorage.setItem(
                "userData",
                JSON.stringify(foundUsers[0])
              );
            }

            return () => unsubscribe();
          });
        }
      } catch (error) {
        // Handle errors
        console.error("Error fetching or setting user data:", error);
      }
    };

    // Invoke the async function inside useEffect
    fetchData();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        expoPushToken,
        setExpoPushToken,
        notification,
        setNotification,
        converations,
        setConverations,
        notificationR,
        setNotificationR,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
