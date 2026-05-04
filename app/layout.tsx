import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import GlobalClientWrapper from "@/components/GlobalClientWrapper";

export const metadata: Metadata = {
  title: "Haler - Breathe Better with Airway Care",
  description: "A perfectly designed aerosol delivers instant hydration and refreshment to your sinus and airway.",
};


export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="haler" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=3" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png?v=3" />
        <meta name="theme-color" content="#1C88FF" />
        <meta name="apple-mobile-web-app-title" content="haler" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Preload Critical Assets */}
        <link rel="preload" href="https://1tfmhoazf61aqn2e.public.blob.vercel-storage.com/public/videos/pass/theme_master.mp4" as="video" type="video/mp4" />
        <link rel="preload" href="https://1tfmhoazf61aqn2e.public.blob.vercel-storage.com/public/images/halersymbol.png" as="image" />
        <link rel="preload" href="https://1tfmhoazf61aqn2e.public.blob.vercel-storage.com/public/images/bliz-device.png" as="image" />
      </head>
      <body>
        <GlobalClientWrapper>
          {children}
        </GlobalClientWrapper>
      </body>
    </html>
  );
}
