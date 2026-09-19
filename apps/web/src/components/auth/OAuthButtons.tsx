"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface OAuthButtonsProps {
  mode: "sign-in" | "sign-up";
  onError?: (msg: string | null) => void;
}

export function OAuthButtons({ mode, onError }: OAuthButtonsProps) {
  const router = useRouter();
  const { signInWithGoogle, signInWithGithub, signInWithApple, formatAuthError } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuth = async (provider: "google" | "github" | "apple") => {
    try {
      setLoadingProvider(provider);
      onError?.(null);

      if (provider === "google") {
        await signInWithGoogle();
      } else if (provider === "github") {
        await signInWithGithub();
      } else if (provider === "apple") {
        await signInWithApple();
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      console.error(`Firebase OAuth error for ${provider}:`, err);
      const friendly = formatAuthError(err);
      onError?.(friendly);
    } finally {
      setLoadingProvider(null);
    }
  };

  const actionText = mode === "sign-in" ? "SIGN IN" : "SIGN UP";

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Google OAuth Button */}
      <button
        type="button"
        disabled={loadingProvider !== null}
        onClick={() => handleOAuth("google")}
        className="btn-oauth"
        aria-label={`${actionText} with Google`}
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span className="truncate tracking-[0.14em] text-[11px] font-mono-tech">
          {loadingProvider === "google" ? "CONNECTING..." : `${actionText} WITH GOOGLE`}
        </span>
      </button>

      {/* GitHub OAuth Button */}
      <button
        type="button"
        disabled={loadingProvider !== null}
        onClick={() => handleOAuth("github")}
        className="btn-oauth"
        aria-label={`${actionText} with GitHub`}
      >
        <svg className="w-4 h-4 shrink-0 fill-[#F2EFE9]" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
        <span className="truncate tracking-[0.14em] text-[11px] font-mono-tech">
          {loadingProvider === "github" ? "CONNECTING..." : `${actionText} WITH GITHUB`}
        </span>
      </button>

      {/* Apple OAuth Button */}
      <button
        type="button"
        disabled={loadingProvider !== null}
        onClick={() => handleOAuth("apple")}
        className="btn-oauth"
        aria-label={`${actionText} with Apple`}
      >
        <svg className="w-4 h-4 shrink-0 fill-[#F2EFE9]" viewBox="0 0 170 170">
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.59-7.71-11.66-14.01-6.19-9.58-11.05-20.48-14.58-32.7-3.53-12.21-5.3-23.71-5.3-34.5 0-14.38 3.59-26.6 10.77-36.68 7.18-10.08 16.32-15.22 27.42-15.42 4.7.13 9.94 1.36 15.72 3.7 5.78 2.33 9.68 3.57 11.69 3.7 2.45-.25 6.64-1.57 12.57-3.96 5.93-2.39 11.05-3.5 15.36-3.34 13.9.76 24.63 5.46 32.19 14.09-11.75 7.17-17.5 16.89-17.25 29.17.25 9.78 4.08 17.94 11.49 24.48 7.41 6.54 16.14 10.15 26.2 10.84-2.28 7.2-5.07 14.4-8.36 21.6zm-31.95-103.7c0-7.39 2.67-14.19 8.01-20.41 5.34-6.22 12.01-10.22 20.02-12-1.08 7.82-3.8 14.68-8.15 20.59-4.35 5.9-10.7 9.85-19.04 11.82-.28-.02-.56-.04-.84-.04z" />
        </svg>
        <span className="truncate tracking-[0.14em] text-[11px] font-mono-tech">
          {loadingProvider === "apple" ? "CONNECTING..." : `${actionText} WITH APPLE`}
        </span>
      </button>
    </div>
  );
}
