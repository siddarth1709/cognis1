"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  AuthError,
} from "firebase/auth";
import {
  auth,
  googleProvider,
  githubProvider,
  appleProvider,
  initAnalytics,
} from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User>;
  signInWithGithub: () => Promise<User>;
  signInWithApple: () => Promise<User>;
  signInWithEmail: (email: string, pass: string) => Promise<User>;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<User>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  formatAuthError: (error: unknown) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize analytics client-side if supported
    initAnalytics();

    // Listen to Firebase auth state transitions
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<User> => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  const signInWithGithub = async (): Promise<User> => {
    const result = await signInWithPopup(auth, githubProvider);
    return result.user;
  };

  const signInWithApple = async (): Promise<User> => {
    const result = await signInWithPopup(auth, appleProvider);
    return result.user;
  };

  const signInWithEmail = async (email: string, pass: string): Promise<User> => {
    const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return result.user;
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    displayName?: string
  ): Promise<User> => {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName: displayName.trim() });
      // Force trigger state update with updated displayName
      setUser({ ...result.user, displayName: displayName.trim() } as User);
    }
    return result.user;
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const logout = async (): Promise<void> => {
    await fbSignOut(auth);
  };

  const formatAuthError = (error: unknown): string => {
    if (!error) return "An unexpected error occurred.";
    const authErr = error as AuthError;
    const code = authErr.code || "";

    switch (code) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-not-found":
        return "No account found with this email. Please initialize an account first.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Invalid email or password. Please verify your credentials.";
      case "auth/email-already-in-use":
        return "An account with this email already exists. Try signing in instead.";
      case "auth/weak-password":
        return "Password is too weak. Please use at least 6 characters.";
      case "auth/popup-closed-by-user":
        return "Authentication popup was closed before completing.";
      case "auth/popup-blocked":
        return "Browser popup was blocked. Please allow popups for authentication.";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with the same email using a different sign-in method.";
      case "auth/operation-not-allowed":
        return "This sign-in method is currently disabled in your Firebase console.";
      case "auth/network-request-failed":
        return "Network connection issue. Please check your internet connection.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Access is temporarily restricted. Please try again later.";
      case "auth/unauthorized-domain":
        return "This domain is not authorized for OAuth in Firebase Console. Please add localhost to Authorized Domains.";
      default:
        return authErr.message || "Authentication failed. Please verify your details.";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithGithub,
        signInWithApple,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        logout,
        formatAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
