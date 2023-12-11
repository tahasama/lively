// LoginScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Login successful, navigate to the home screen or perform other actions
      navigation.navigate("Home");
    } catch (error) {
      // Handle login error
      setError(error.message);
    }
  };

  const handleForgotPassword = async () => {
    try {
      if (!email) {
        setError("Email is required to reset the password");
        return;
      }

      // Send a password reset email
      await sendPasswordResetEmail(auth, email);

      // Inform the user that a password reset email has been sent
      setError("Password reset email has been sent. Check your inbox.");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
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
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
      </TouchableOpacity>
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerLink}>Register here</Text>
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
    justifyContent: "center",
    width: "100%",
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
    height: 48,
    borderColor: "#dddddd",
    marginBottom: 14,
    paddingLeft: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  showPasswordText: {
    color: "#4285F4",
    marginLeft: 8,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
  },
  loginButton: {
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
  forgotPasswordLink: {
    marginVertical: 16,
    color: "#4285F4",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  registerText: {
    fontSize: 16,
    color: "#555555",
  },
  registerLink: {
    fontSize: 16,
    color: "#4285F4",
    fontWeight: "bold",
  },
});

export default LoginScreen;
