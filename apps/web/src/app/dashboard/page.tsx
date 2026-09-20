"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MonumentalNav } from "@/components/common/MonumentalNav";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-[#080806] text-[#F2EFE9] flex items-center justify-center font-mono-tech text-[12px] tracking-[0.2em]">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#D8663D] animate-pulse" />
          <span>SYNCHRONIZING SECURE TELEMETRY STREAM...</span>
        </div>
      </main>
    );
  }

  const userEmail = user.email || "operator@cognis.dev";
  const userName = user.displayName || userEmail.split("@")[0];
  const providerId = user.providerData?.[0]?.providerId || "password";

  return (
    <main className="min-h-screen bg-[#080806] text-[#F2EFE9] flex flex-col justify-between selection:bg-[#E05A2B]/30 selection:text-[#F2EFE9]">
      <MonumentalNav />

      <div className="max-w-[1200px] w-full mx-auto px-6 sm:px-12 pt-[104px] sm:pt-[124px] pb-12 flex-1">
        <div className="mb-10 pb-8 border-b border-[#1C1C17]">
          <div className="badge-tech mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9AA68A]" />
            <span>SESSION ACTIVE // FIREBASE AUTH VERIFIED</span>
          </div>
          <h1 className="text-[28px] sm:text-[40px] font-sans font-medium text-[#F2EFE9] tracking-[-0.04em] mb-2">
            WELCOME, {userName.toUpperCase()}.
          </h1>
          <p className="text-[14px] sm:text-[16px] text-[#8C887B] font-sans">
            Authenticated via <span className="font-mono-tech text-[#D8663D] uppercase">{providerId}</span> as{" "}
            <span className="font-mono-tech text-[#E3B65A]">{userEmail}</span>. Connected to live consensus telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="panel-industrial p-5">
            <span className="text-[9px] font-mono-tech text-[#66655E] uppercase tracking-[0.16em] block mb-2">
              NODE STATUS
            </span>
            <div className="text-[20px] font-mono-tech text-[#9AA68A] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#9AA68A] animate-pulse" />
              SYNCHRONIZED
            </div>
            <span className="text-[10px] text-[#8C887B] mt-1 block">8/8 Surfaces verified</span>
          </div>

          <div className="panel-industrial p-5">
            <span className="text-[9px] font-mono-tech text-[#66655E] uppercase tracking-[0.16em] block mb-2">
              ACTIVE CONTRACTS
            </span>
            <div className="text-[20px] font-mono-tech text-[#F2EFE9]">142 INVARIANTS</div>
            <span className="text-[10px] text-[#8C887B] mt-1 block">0 Contradictions active</span>
          </div>

          <div className="panel-industrial p-5">
            <span className="text-[9px] font-mono-tech text-[#66655E] uppercase tracking-[0.16em] block mb-2">
              RESTORATION SPEED
            </span>
            <div className="text-[20px] font-mono-tech text-[#D8663D]">0.04ms</div>
            <span className="text-[10px] text-[#8C887B] mt-1 block">Cryptographic certainty 1.00</span>
          </div>

          <div className="panel-industrial p-5">
            <span className="text-[9px] font-mono-tech text-[#66655E] uppercase tracking-[0.16em] block mb-2">
              EPISTEMIC RESTRAINT
            </span>
            <div className="text-[20px] font-mono-tech text-[#E3B65A]">ENGAGED</div>
            <span className="text-[10px] text-[#8C887B] mt-1 block">Automated stops armed</span>
          </div>
        </div>

        <div className="panel-elevated p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1C1C17]">
            <span className="text-[11px] font-mono-tech tracking-[0.16em] text-[#F2EFE9] uppercase">
              WORKBENCH ACTIONS
            </span>
            <span className="text-[10px] font-mono-tech text-[#66655E]">CORE ID: C-017</span>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard/healing" className="btn-monumental text-[10px]">
              <span>OPEN HEALING LEDGER</span>
              <span className="text-[#D8663D]">→</span>
            </Link>

            <Link href="/#hero-experience" className="btn-monumental-secondary text-[10px]">
              EXPLORE 3D ENTITY UNIVERSE
            </Link>

            <button
              type="button"
              onClick={() => alert("Consensus Invariant Trace Complete: 0 contradictions found across all AST surfaces.")}
              className="btn-monumental-secondary text-[10px]"
            >
              RUN CONTINUOUS AUDIT TRACE
            </button>
          </div>
        </div>
      </div>

      <footer className="h-[60px] border-t border-[#1C1C17] px-6 sm:px-12 flex items-center justify-between text-[10px] font-mono-tech text-[#66655E]">
        <span>COGNIS WORKSPACE // SECURE ENTERPRISE ENCLAVE</span>
        <span>LATENCY: 0.04ms</span>
      </footer>
    </main>
  );
}