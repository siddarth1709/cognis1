import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
} from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyB7Oger4pxthLVvTUOEFGmPujhBJrcZ7jg",
  authDomain: "cognis-c2363.firebaseapp.com",
  projectId: "cognis-c2363",
  storageBucket: "cognis-c2363.firebasestorage.app",
  messagingSenderId: "631379465772",
  appId: "1:631379465772:web:1908521a266654f5ee6389",
  measurementId: "G-CJ63PQEQQQ",
};

// Initialize Firebase once (handles SSR and hot-reload cleanly)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Standard OAuth Providers configured for cognis-c2363
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const appleProvider = new OAuthProvider("apple.com");

// Optional client analytics
export const initAnalytics = async () => {
  if (typeof window !== "undefined") {
    try {
      const { getAnalytics, isSupported } = await import("firebase/analytics");
      const supported = await isSupported();
      if (supported) {
        return getAnalytics(app);
      }
    } catch {
      // Analytics fallback
    }
  }
  return null;
};
