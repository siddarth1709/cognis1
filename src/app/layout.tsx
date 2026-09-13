import type { Metadata, Viewport } from "next";
import { Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#080806",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Cognis — Knowledge that keeps up.",
  description:
    "The cognitive layer between software changes and product knowledge. Industrial software forensics and continuous contract verification.",
  keywords: [
    "developer infrastructure",
    "software knowledge",
    "software forensics",
    "self-healing documentation",
    "contract verification",
    "epistemic restraint",
  ],
  openGraph: {
    title: "Cognis — Knowledge that keeps up.",
    description:
      "The cognitive layer between software changes and product knowledge. Industrial software forensics and continuous contract verification.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${ibmPlexMono.variable} dark antialiased`}
    >
      <body className="min-h-screen bg-[#080806] text-[#F2EFE9] font-sans selection:bg-[#D8663D]/30 selection:text-[#F2EFE9] overflow-x-hidden">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
