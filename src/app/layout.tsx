// C:\nproject\fe_pdsw\src\app\layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "react-date-picker/dist/DatePicker.css";
import "./globals.css";
// import ClientProvider from "@/components/providers/ClientProvider";
import Script from 'next/script'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "U PDS",
  description: "UPDS project",
  icons: {
    icon: '/nexpds.ico',           // /public/favicon.ico
    shortcut: '/nexpds.ico',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">

      {/* <head>
        <Script src="/env.js" strategy="afterInteractive" />

      </head> */}

      <head>
        <Script src="/env.js" strategy="afterInteractive" />
        <link rel="icon" href="/nexpds.ico" type="image/x-icon" />
      </head>


      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased body-top`}
      >
        {/*  Provider 제거 */}
        {children}
      </body>
    </html>
  );
}
