"use client";

import "./../styles/globals.css";
import {
  Instrument_Serif,
  Instrument_Sans,
  Space_Mono,
  Asset,
} from "next/font/google";
import Navbar from "@/components/Navbar";
import { PhotoProvider, usePhotos } from "@/contexts/PhotoContext";
import { ViewProvider } from "@/contexts/ViewContext";
import { CursorProvider } from "@/contexts/CursorContext";
import CustomCursor from "@/components/CustomCursor";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  variable: "--font-serif",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  variable: "--font-sans",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

const asset = Asset({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-asset",
});

function AmbientGlow() {
  const { ambientColor } = usePhotos();

  return (
    <div
      className="fixed inset-0 -z-10 transition-all duration-1000"
      style={{
        boxShadow: ambientColor
          ? `inset 0 0 200px 100px ${ambientColor}20`
          : "none",
        opacity: ambientColor ? 1 : 0,
      }}
    />
  );
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${instrumentSans.variable} ${spaceMono.variable} ${asset.variable} antialiased`}
    >
      <head>
        <title>VYNX</title>
        <meta name="description" content="VYNX Photo Analytics" />
      </head>
      <body className="bg-0d0d0d text-e5e5e5 min-h-screen flex flex-col">
        <CursorProvider>
          <PhotoProvider>
            <ViewProvider>
              <AmbientGlow />
              <CustomCursor />
              <Navbar />
              <main className="flex-1 pt-20">{children}</main>
            </ViewProvider>
          </PhotoProvider>
        </CursorProvider>
      </body>
    </html>
  );
}
