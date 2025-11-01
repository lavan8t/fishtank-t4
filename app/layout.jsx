"use client";
import "./../styles/globals.css";
import { Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import { PhotoProvider } from "@/contexts/PhotoContext";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${spaceMono.variable} antialiased`}
    >
      <head>
        <title>VYNX</title>
        <meta name="description" content="VYNX Photo Analytics" />
      </head>
      <body className="font-sans bg-[#0B0B0B] text-[#EAEAEA] min-h-screen flex flex-col">
        <PhotoProvider>
          <Navbar />
          <main className="flex-1 flex flex-col items-center pt-24 pb-10 px-4">
            <div className="w-full">{children}</div>
          </main>
        </PhotoProvider>
      </body>
    </html>
  );
}
