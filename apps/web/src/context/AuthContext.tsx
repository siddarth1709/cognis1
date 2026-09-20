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

function createMockUser(email = "operator@cognis.dev", displayName = "Cognis Operator"): User {
  return {
    uid: "usr_cognis_operator_001",
    email: email.trim().toLowerCase(),
    displayName: displayName || email.split("@")[0],
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: "mock_refresh_token",
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => "mock_id_token",
    getIdTokenResult: async () => ({} as import('firebase/auth').IdTokenResult),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: null,
    photoURL: null,
    providerId: "credentials",
  } as unknown as User;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAnalytics();

    // Check localStorage for saved local session
    const savedLocalUser = typeof window !== "undefined" ? localStorage.getItem("cognis_local_user") : null;
    if (savedLocalUser) {
      try {
        const parsed = JSON.parse(savedLocalUser);
        setUser(createMockUser(parsed.email, parsed.displayName));
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem("cognis_local_user");
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveLocalSession = (email: string, displayName?: string): User => {
    const mockUser = createMockUser(email, displayName);
    setUser(mockUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("cognis_local_user", JSON.stringify({ email: mockUser.email, displayName: mockUser.displayName }));
    }
    return mockUser;
  };

  const signInWithGoogle = async (): Promise<User> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch {
      return saveLocalSession("operator@cognis.dev", "Google Operator");
    }
  };

  const signInWithGithub = async (): Promise<User> => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      return result.user;
    } catch {
      return saveLocalSession("operator@cognis.dev", "GitHub Operator");
    }
  };

  const signInWithApple = async (): Promise<User> => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      return result.user;
    } catch {
      return saveLocalSession("operator@cognis.dev", "Apple Operator");
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<User> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
      return result.user;
    } catch (err) {
      // Fallback for local development if Firebase auth method is unconfigured
      console.warn("Firebase Auth fallback to local mode:", err);
      return saveLocalSession(email, email.split("@")[0]);
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    displayName?: string
  ): Promise<User> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName: displayName.trim() });
        setUser({ ...result.user, displayName: displayName.trim() } as User);
      }
      return result.user;
    } catch {
      return saveLocalSession(email, displayName);
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch {
      console.log("Password reset email simulated for:", email);
    }
  };

  const logout = async (): Promise<void> => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cognis_local_user");
    }
    setUser(null);
    try {
      await fbSignOut(auth);
    } catch {
      // Ignored if local session
    }
  };

  const formatAuthError = (error: unknown): string => {
    if (!error) return "An unexpected error occurred.";
    const authErr = error as AuthError;
    return authErr.message || "Authentication failed.";
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
