import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FacebookSDK from '@/components/FacebookSDK';
import { SessionProvider } from '@/components/SessionProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FitGlide Marketing Tool",
  description: "AI-powered marketing tool for viral content creation and user acquisition",
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
        <SessionProvider>
          <FacebookSDK appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ''} />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
