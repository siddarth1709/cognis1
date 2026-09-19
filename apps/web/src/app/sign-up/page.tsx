"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { IndustrialLogo } from "@/components/ui/IndustrialLogo";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export default function SignUpPage() {
  const router = useRouter();
  const { signUpWithEmail, formatAuthError } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setErrorMsg("Please agree to the invariant specifications and restraint protocol.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await signUpWithEmail(email, password, name);
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Sign-up error:", err);
      setErrorMsg(formatAuthError(err));
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080806] text-[#F2EFE9] flex flex-col justify-between px-4 sm:px-8 py-6 selection:bg-[#E05A2B]/30 selection:text-[#F2EFE9]">
      {/* Top Architectural Header */}
      <header className="w-full max-w-[1280px] mx-auto flex items-center justify-between pb-6 border-b border-[#1C1C17]">
        <Link href="/" className="flex items-center gap-3 group">
          <IndustrialLogo size={22} />
          <div className="flex flex-col">
            <span className="text-[14px] sm:text-[15px] font-mono-tech tracking-[0.16em] uppercase text-[#F2EFE9] font-medium leading-none">
              COGNIS
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono-tech tracking-[0.2em] text-[#66655E] uppercase mt-1">
              COGNITIVE LAYER
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-[10px] sm:text-[11px] font-mono-tech tracking-[0.14em] text-[#8C887B] hover:text-[#D8663D] transition-colors uppercase flex items-center gap-2"
        >
          <span>←</span>
          <span>RETURN TO REPOSITORY</span>
        </Link>
      </header>

      {/* Center Registration Frame */}
      <div className="w-full max-w-[480px] mx-auto my-6 panel-elevated p-6 sm:p-10 border border-[#282823] shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
        {/* Milestone Tag */}
        <div className="badge-tech mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D8663D] animate-pulse" />
          <span>INITIALIZE // NODE 01</span>
        </div>

        {/* Headline */}
        <h1 className="text-[26px] sm:text-[32px] font-sans font-medium text-[#F2EFE9] tracking-[-0.04em] mb-2 leading-tight">
          INITIALIZE COGNIS.
        </h1>
        <p className="text-[13px] sm:text-[14px] text-[#8C887B] font-sans mb-6 leading-relaxed">
          Deploy your organization&apos;s behavioral topology model and consensus engine.
        </p>

        {/* Real OAuth Buttons: Google, GitHub, Apple */}
        <OAuthButtons mode="sign-up" onError={setErrorMsg} />

        {/* Industrial Separator */}
        <div className="relative my-6 text-center">
          <div className="hairline-divider" />
          <span className="relative -top-2.5 px-3 bg-[#0E0E0B] text-[9px] font-mono-tech tracking-[0.16em] text-[#66655E] uppercase">
            OR WORKSPACE CREDENTIALS
          </span>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 mb-4 border border-[#B84A3A] bg-[#B84A3A]/10 rounded-[2px] text-[11px] font-mono-tech text-[#F2EFE9] flex items-start gap-2 leading-tight">
            <span className="text-[#B84A3A] shrink-0 font-bold">✕</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-monumental">
              <span>FULL NAME / ORG IDENTIFIER</span>
              <span className="text-[#66655E]">REQUIRED</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ada Lovelace / Core Infrastructure"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-monumental"
            />
          </div>

          <div>
            <label className="label-monumental">
              <span>WORK EMAIL</span>
              <span className="text-[#66655E]">REQUIRED</span>
            </label>
            <input
              type="email"
              required
              placeholder="developer@organization.internal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-monumental"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label-monumental mb-0">
                <span>CREATE PASSWORD</span>
              </label>
              <span className="text-[9px] font-mono-tech text-[#66655E]">MIN 6 CHARS</span>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-monumental pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono-tech text-[#66655E] hover:text-[#F2EFE9] transition-colors"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {/* Invariant Terms Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 accent-[#E05A2B] bg-[#0A0A08] border-[#282823] cursor-pointer"
              />
              <span className="text-[11px] font-sans text-[#8C887B] leading-snug">
                I agree to the Bounded Consensus telemetry specifications and Epistemic Restraint protocols.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-monumental w-full mt-5"
          >
            <span>{isLoading ? "INITIALIZING NODE..." : "INITIALIZE WORKSPACE"}</span>
            <span className="text-[#D8663D]">→</span>
          </button>
        </form>

        {/* Switcher to Sign In */}
        <div className="mt-6 pt-5 border-t border-[#1C1C17] text-center text-[10px] sm:text-[11px] font-mono-tech text-[#8C887B]">
          <span>ALREADY HAVE ACCESS? </span>
          <Link href="/sign-in" className="text-[#D8663D] hover:underline ml-1 uppercase">
            AUTHENTICATE REPOSITORY →
          </Link>
        </div>
      </div>

      {/* Persistent Bottom Coordinate Line */}
      <footer className="w-full max-w-[1280px] mx-auto pt-6 border-t border-[#1C1C17] flex flex-wrap items-center justify-between gap-4 text-[9px] sm:text-[10px] font-mono-tech text-[#66655E] tracking-[0.16em]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D8663D]" />
          <span>INITIALIZE NODE // FIREBASE SECURE CONTEXT</span>
        </div>
        <span>INITIALIZATION LATENCY: 0.04ms</span>
      </footer>
    </main>
  );
}
