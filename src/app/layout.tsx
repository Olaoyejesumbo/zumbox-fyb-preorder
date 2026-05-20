import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ZumboX FYB Week 2026 — Pre-Order Your Uniform",
  description:
    "Pre-order your custom ZumboX Academy uniform for FYB Week 2026. Exclusive designs for Byte-Circle 26.",
  openGraph: {
    title: "ZumboX FYB Week 2026 — Uniform Pre-Order",
    description: "Custom uniforms for Byte-Circle 26 | Back to School Day",
    siteName: "ZumboX Fashion",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${dmSans.variable} font-dm antialiased`}>
        {children}
      </body>
    </html>
  );
}
