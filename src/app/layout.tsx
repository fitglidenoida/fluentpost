import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FacebookSDK from '@/components/FacebookSDK';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FitGlide Marketing Hub",
  description: "Personal SEO & SMO powerhouse for fitness content domination",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FacebookSDK appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ''} />
        {children}
      </body>
    </html>
  );
}
