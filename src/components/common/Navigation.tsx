"use client";

import { useEffect, useState } from "react";
import { SplitBrainLogo } from "../ui/SplitBrainLogo";

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Product", href: "#problem" },
    { label: "Cognition", href: "#cognition" },
    { label: "Forensics", href: "#forensics" },
    { label: "Self-Healing", href: "#self-healing" },
    { label: "Architecture", href: "#agent-ready" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 h-[72px] transition-all duration-400 ease-out ${
        scrolled
          ? "bg-[#07090D]/80 backdrop-blur-md border-b border-white/[0.06] shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-[1440px] mx-auto h-full px-6 sm:px-8 md:px-12 flex items-center justify-between">
        {/* Brand Mark & Wordmark */}
        <a
          href="#"
          className="flex items-center gap-3.5 group cursor-pointer"
          data-interactive="true"
        >
          <SplitBrainLogo size={28} className="transition-transform duration-300 group-hover:scale-105" />
          <span className="text-[17px] font-medium tracking-tight text-[#F4F7FA] font-sans flex items-center gap-1.5">
            Cognis
            <span className="inline-block w-1 h-1 rounded-full bg-[#5CEBFF]/70" />
          </span>
        </a>

        {/* Center / Right Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium tracking-[0.02em] text-[#A7B0BD]">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative py-1 text-[#A7B0BD] hover:text-[#F4F7FA] transition-colors duration-200 group"
              data-interactive="true"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#5CEBFF] transition-all duration-300 ease-out group-hover:w-full opacity-0 group-hover:opacity-100" />
            </a>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-4">
          <a
            href="#forensics"
            data-interactive="true"
            className="h-[38px] px-5 rounded-full border border-white/[0.14] text-[13px] font-medium text-[#F4F7FA] tracking-wide flex items-center justify-center transition-all duration-300 ease-out hover:border-[#5CEBFF]/50 hover:bg-[#5CEBFF]/[0.06] hover:text-[#5CEBFF] active:scale-[0.98]"
          >
            Explore Cognis
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          aria-label="Toggle Navigation Menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex flex-col justify-center items-center w-9 h-9 text-[#A7B0BD] hover:text-[#F4F7FA] focus:outline-none"
          data-interactive="true"
        >
          <span
            className={`w-5 h-[1.5px] bg-current transition-transform duration-300 ${
              mobileMenuOpen ? "rotate-45 translate-y-[5px]" : "mb-1.5"
            }`}
          />
          <span
            className={`w-5 h-[1.5px] bg-current transition-transform duration-300 ${
              mobileMenuOpen ? "-rotate-45 -translate-y-[2px]" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#07090D]/95 backdrop-blur-xl border-b border-white/[0.08] px-6 py-6 transition-all">
          <nav className="flex flex-col gap-4 text-[15px] font-medium text-[#A7B0BD]">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-[#A7B0BD] hover:text-[#5CEBFF] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-white/[0.08]">
              <a
                href="#forensics"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-[38px] w-full px-5 rounded-full border border-[#5CEBFF]/40 bg-[#5CEBFF]/[0.06] text-[13px] font-medium text-[#5CEBFF] items-center justify-center"
              >
                Explore Cognis
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
