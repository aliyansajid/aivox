import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIVOX - AI-Powered Recruitment Platform",
  description:
    "Transform your hiring process with AI agents that handle everything from resume parsing and candidate shortlisting to conducting interviews and generating comprehensive reports.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en">
      <body
        className={`font-sans ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <main>{children}</main>
          <Toaster position="top-center" richColors />
        </SessionProvider>
      </body>
    </html>
  );
}
