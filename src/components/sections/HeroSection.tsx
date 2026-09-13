"use client";

import { useEffect, useRef, useState } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  color: string;
  alpha: number;
  label?: string;
  labelTimer: number;
}

const LABELS = ["SOURCE", "BEHAVIOR", "CONTRACT", "TEST", "DOC", "AGENT"];

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll listener for hero scale and opacity transformation
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const progress = Math.min(Math.max(scrollY / (vh * 0.8), 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cognitive Field Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio || 1);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const isMobile = window.innerWidth < 768;
    const nodeCount = isMobile ? 24 : 44;

    const nodes: Node[] = [];
    const colors = ["#5CEBFF", "#8B7CFF", "#A7B0BD"];

    const logicalW = canvas.offsetWidth;
    const logicalH = canvas.offsetHeight;

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * logicalW,
        y: Math.random() * logicalH,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        baseRadius: Math.random() > 0.85 ? 2.2 : 1.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.35 + 0.15,
        label: Math.random() > 0.82 ? LABELS[Math.floor(Math.random() * LABELS.length)] : undefined,
        labelTimer: Math.random() * 200,
      });
    }

    let mouseX = -9999;
    let mouseY = -9999;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio || 1;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio || 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let step = 0;

    const render = () => {
      step++;
      const currentLogicalW = canvas.offsetWidth;
      const currentLogicalH = canvas.offsetHeight;

      ctx.clearRect(0, 0, currentLogicalW, currentLogicalH);

      // Connect lines between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = isMobile ? 90 : 130;
          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.12;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(92, 235, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Update & Draw nodes
      nodes.forEach((node, idx) => {
        // Move nodes
        node.x += node.vx;
        node.y += node.vy;

        // Bounce at boundaries
        if (node.x < 0 || node.x > currentLogicalW) node.vx *= -1;
        if (node.y < 0 || node.y > currentLogicalH) node.vy *= -1;

        // Subtle proximity influence from mouse (max 4px)
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        if (distToMouse < 100 && distToMouse > 0) {
          const force = (1 - distToMouse / 100) * 0.8;
          node.x -= (dx / distToMouse) * force;
          node.y -= (dy / distToMouse) * force;
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = node.alpha;
        ctx.fill();

        // Occasional node pulse & label display
        node.labelTimer++;
        if (node.label && Math.sin(node.labelTimer * 0.02) > 0.75) {
          ctx.font = "9px 'JetBrains Mono', monospace";
          ctx.fillStyle = "#5CEBFF";
          ctx.globalAlpha = 0.45;
          ctx.fillText(node.label, node.x + 6, node.y + 3);
        }

        ctx.globalAlpha = 1;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col justify-center items-center px-6 sm:px-8 md:px-12 pt-28 pb-20 overflow-hidden bg-[#07090D] bg-tech-grid"
      aria-label="Cognis Hero"
    >
      {/* Background Interactive Cognitive Field */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-80 transition-opacity duration-700"
      />

      {/* Subtle Central Radial Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[480px] pointer-events-none rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(circle, rgba(92,235,255,0.04) 0%, rgba(139,124,255,0.03) 50%, transparent 80%)",
        }}
      />

      {/* Hero Typography & Content */}
      <div
        className="relative z-10 max-w-[900px] mx-auto text-center flex flex-col items-center will-change-transform"
        style={{
          opacity: 1 - scrollProgress * 1.05,
          transform: `translate3d(0, ${-scrollProgress * 48}px, 0) scale(${1 - scrollProgress * 0.04})`,
          transition: "opacity 200ms cubic-bezier(0.16, 1, 0.3, 1), transform 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5CEBFF] animate-subtle-pulse" />
          <span className="text-[12px] sm:text-[13px] font-mono-tech tracking-[0.14em] uppercase text-[#A7B0BD]">
            COGNITIVE INFRASTRUCTURE FOR SOFTWARE
          </span>
        </div>

        {/* Architectural Headline */}
        <h1 className="headline-hero text-[#F4F7FA] font-sans tracking-[-0.045em] mb-7 max-w-[880px]">
          Software changes.
          <br />
          <span className="text-gradient-cognis inline-block">Knowledge</span> shouldn&apos;t fall behind.
        </h1>

        {/* Supporting Paragraph */}
        <p className="text-[17px] sm:text-[19px] leading-[1.6] text-[#A7B0BD] max-w-[620px] font-sans mb-10 font-normal">
          Cognis reconstructs what your software actually does, detects when product knowledge
          diverges from reality, and safely heals what changed.
        </p>

        {/* CTA Row */}
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7">
          <a
            href="#forensics"
            data-interactive="true"
            className="h-[46px] px-6 rounded-[12px] border border-[#5CEBFF]/40 bg-[#5CEBFF]/[0.07] text-[#F4F7FA] text-[14px] font-medium tracking-wide flex items-center justify-center gap-2 transition-all duration-300 ease-out hover:border-[#5CEBFF]/80 hover:bg-[#5CEBFF]/[0.14] hover:shadow-[0_0_24px_rgba(92,235,255,0.2)] group"
          >
            <span>Explore the system</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1 text-[#5CEBFF]">→</span>
          </a>

          <a
            href="#problem"
            data-interactive="true"
            className="text-[14px] font-medium text-[#A7B0BD] hover:text-[#F4F7FA] transition-colors duration-200 relative group py-1"
          >
            See how it reasons
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#A7B0BD] transition-all duration-300 group-hover:w-full group-hover:bg-[#5CEBFF]" />
          </a>
        </div>
      </div>

      {/* Bottom Subtle Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-mono-tech uppercase tracking-[0.2em] text-[#697482]">Scroll to explore</span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-[#5CEBFF]/50 via-[#8B7CFF]/30 to-transparent" />
      </div>
    </section>
  );
}
