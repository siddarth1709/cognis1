"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { IndustrialLogo } from "../ui/IndustrialLogo";
import { ScaleIcon } from "@/components/ui/Icons";

export function MonumentalNav() {
  const router = useRouter();
  const [scrollFraction, setScrollFraction] = useState(0);
  const { user, logout, signInWithEmail } = useAuth();
  const [bypassing, setBypassing] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalDoc = document.documentElement.scrollHeight - window.innerHeight;
      setScrollFraction(totalDoc > 0 ? Math.min(scrollY / totalDoc, 1) : 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAuthenticated = !!user;
  const userIdentifier = user?.displayName || user?.email?.split("@")[0] || "OPERATOR";

  async function handleJudgeBypass() {
    setBypassing(true);
    window.sessionStorage.setItem("cognis:demo-welcome", "1");
    try {
      await signInWithEmail("operator@cognis.dev", "Password123!");
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    } finally {
      setBypassing(false);
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[68px] sm:h-[72px] bg-[#080806]/90 backdrop-blur-md transition-all duration-300 select-none border-b border-[#1C1C17]/60">
      <div className="w-full h-full px-4 sm:px-10 lg:px-16 flex items-center justify-between">
        {/* Left: Monolithic Brand Mark */}
        <Link href="/" className="flex items-center gap-3 sm:gap-3.5 group">
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

        {/* Center: Monumental Architectural Topics */}
        <nav className="hidden lg:flex items-center gap-10 text-[11px] font-mono-tech tracking-[0.14em] text-[#8C887B]">
          <Link href="/#hero-experience" className="hover:text-[#F2EFE9] transition-colors">
            01 // THE DRIFT GAP
          </Link>
          <Link href="/#hero-experience" className="hover:text-[#F2EFE9] transition-colors">
            02 // FORENSICS
          </Link>
          <Link href="/#hero-experience" className="hover:text-[#F2EFE9] transition-colors">
            03 // CONSEQUENCE
          </Link>
          <Link href="/#hero-experience" className="hover:text-[#F2EFE9] transition-colors">
            04 // HEALING
          </Link>
          <Link href="/#hero-experience" className="hover:text-[#F2EFE9] transition-colors">
            05 // REFUSAL
          </Link>
        </nav>

        {/* Right: Real Auth Action Buttons + Judge Bypass */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* JUDGE DEMO BYPASS BUTTON */}
          <button
            type="button"
            onClick={handleJudgeBypass}
            disabled={bypassing}
            className="flex items-center gap-1.5 bg-[#D8663D] hover:bg-[#c45730] text-[#080806] font-mono-tech font-bold text-[10px] tracking-[.12em] px-3 py-1.5 transition-all shadow-lg"
          >
            <ScaleIcon size={12} />
            <span>{bypassing ? "ENTERING DEMO..." : "JUDGE DEMO BYPASS →"}</span>
          </button>

          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 border border-[#282823] bg-[#0E0E0B] text-[10px] font-mono-tech tracking-wider text-[#F2EFE9] hover:border-[#D8663D] transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#9AA68A]" />
                <span className="uppercase truncate max-w-[120px]">{userIdentifier}</span>
              </Link>

              <button
                type="button"
                onClick={() => logout()}
                className="text-[10px] sm:text-[11px] font-mono-tech tracking-[0.14em] text-[#8C887B] hover:text-[#B84A3A] transition-colors uppercase px-2 py-1.5"
              >
                SIGN OUT
              </button>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="text-[10px] sm:text-[11px] font-mono-tech tracking-[0.14em] text-[#8C887B] hover:text-[#F2EFE9] transition-colors uppercase px-2 py-1.5"
            >
              SIGN IN
            </Link>
          )}
        </div>
      </div>

      {/* 1px Bottom Progress Hairline */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#1C1C17]">
        <div
          className="h-full bg-[#E05A2B] transition-all duration-100 ease-out"
          style={{ width: `${scrollFraction * 100}%` }}
        />
      </div>
    </header>
  );
}
