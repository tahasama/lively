import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface AuthContextType {
  user: any;
  setUser: any;
  expoPushToken: any;
  setExpoPushToken: any;
  notification: any;
  setNotification: any;
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
  const [converations, setConverations] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const usersCollection = collection(db, "users");
        const q = query(usersCollection, where("uid", "==", authUser.uid));

        const querySnapshot = await getDocs(q);

        const foundUsers = [];
        querySnapshot.forEach((doc) => {
          foundUsers.push({ id: doc.id, ...doc.data() });
        });

        setUser(foundUsers[0]);
      }
    });

    return () => unsubscribe();
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
