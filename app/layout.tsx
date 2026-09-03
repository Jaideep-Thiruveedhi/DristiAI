import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/AppHeader";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DrishtiAI — Holographic Grid // Command Center",
  description:
    "DrishtiAI Concept C — Holographic Grid. Monochromatic cyan+grey, wireframe retina, Grad-CAM explainability. Frontend-only simulation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-holo flex flex-col font-mono">
        <AppHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
