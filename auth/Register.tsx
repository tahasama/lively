// RegisterScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons"; // Import Feather icon from Expo vector-icons
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../firebase";
import { useAuth } from "../AuthProvider/AuthProvider";

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { user, setUser, expoPushToken, notification, darkMode } = useAuth();

  const handleRegister = async () => {
    try {
      if (!username.trim()) {
        setError("Username is required");
        return;
      }

      // Check if the username is already taken
      const usersCollection = collection(db, "users");
      const usernameQuery = query(
        usersCollection,
        where("username", "==", username)
      );

      const usernameQuerySnapshot = await getDocs(usernameQuery);

      if (!usernameQuerySnapshot.empty) {
        setError("Username is already taken. Please choose another one.");
        return;
      }

      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Set the username in the user's profile
      await updateProfile(userCredential.user, {
        displayName: username,
      });

      // Add the user to the Firestore collection 'users'
      await addDoc(usersCollection, {
        uid: userCredential.user.uid,
        username: username,
        timestamp: new Date(),
        image: "",
        email: email,
        expoPushToken: expoPushToken,
      });

      const xx = await signInWithEmailAndPassword(auth, email, password);
      // setUser(xx);
      // AsyncStorage.setItem("userData", JSON.stringify(xx));
      setTimeout(() => {
        navigation.navigate("Home");
      }, 1500);

      // Registration successful, navigate to the home screen or perform other actions
    } catch (error) {
      // Handle registration error
      setError(error.message);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: darkMode ? "#212121" : "#ececec",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          marginBottom: 24,
          fontWeight: "bold",
          color: darkMode ? "#FFFFFF" : "#333333",
        }}
      >
        Create an Account
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: darkMode ? "#666666" : "#f6f6f6",
            color: darkMode ? "#efefef" : "#333",
            borderColor: darkMode ? "#333333" : "#ccc",
          },
        ]}
        placeholder="Email"
        placeholderTextColor={darkMode ? "#efefef" : "#333"}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError("");
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: darkMode ? "#666666" : "#f6f6f6",
            color: darkMode ? "#efefef" : "#333",
            borderColor: darkMode ? "#333333" : "#ccc",
          },
        ]}
        placeholder="Username"
        placeholderTextColor={darkMode ? "#efefef" : "#333"}
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          setError("");
        }}
        autoCapitalize="none"
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          gap: 12,
        }}
      >
        <TextInput
          style={[
            styles.passwordInput,
            {
              backgroundColor: darkMode ? "#666666" : "#f6f6f6",
              color: darkMode ? "#efefef" : "#333",
              borderColor: darkMode ? "#333333" : "#ccc",
            },
          ]}
          placeholder="Password"
          placeholderTextColor={darkMode ? "#efefef" : "#333"}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError("");
          }}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={{
            height: 48,
            borderColor: darkMode ? "#555555" : "#dddddd",
            justifyContent: "center",
            alignItems: "center",
            marginHorizontal: 4,
            marginBottom: 12,
          }}
        >
          <Feather
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color={darkMode ? "#FFFFFF" : "#4285F4"}
          />
        </TouchableOpacity>
      </View>
      {error && (
        <Text
          style={{
            color: "red",
            marginBottom: 16,
          }}
        >
          {error}
        </Text>
      )}
      <TouchableOpacity
        style={[
          styles.registerButton,
          {
            backgroundColor: darkMode ? "#274f92" : "#4285F4",
          },
        ]}
        onPress={handleRegister}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          Register
        </Text>
      </TouchableOpacity>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: darkMode ? "#AAAAAA" : "#555555",
          }}
        >
          Already have an account?{" "}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text
            style={{
              fontSize: 16,
              color: darkMode ? "#346ac3" : "#4285F4",
              fontWeight: "bold",
            }}
          >
            Login here
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  input: {
    height: 48,
    width: "100%",
    borderColor: "#dddddd",
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 16,
    borderRadius: 8,
    fontSize: 16,
    color: "#333333",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  passwordInput: {
    flex: 1,
    height: 48,
    borderColor: "#dddddd",
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 16,
    borderRadius: 8,
    fontSize: 16,
    color: "#333333",
  },
  show: {
    // flex: 1,
    height: 48,
    borderColor: "#dddddd",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    marginBottom: 12,
  },
  showPasswordText: {
    color: "#4285F4",
    marginLeft: 8,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
  },
  registerButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    fontSize: 16,
    color: "#555555",
  },
  loginLink: {
    fontSize: 16,
    color: "#4285F4",
    fontWeight: "bold",
  },
});

export default RegisterScreen;
