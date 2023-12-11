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
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    try {
      if (!username.trim()) {
        setError("Username is required");
        return;
      }

      await createUserWithEmailAndPassword(auth, email, password);

      // Set the username in the user's profile
      await updateProfile(auth.currentUser, {
        displayName: username,
      });

      // Registration successful, navigate to the home screen or perform other actions
      navigation.navigate("Home");
    } catch (error) {
      // Handle registration error
      setError(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={(text) => setUsername(text)}
        autoCapitalize="none"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.show}
        >
          <Feather
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="#4285F4"
          />
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginLink}>Login here</Text>
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
