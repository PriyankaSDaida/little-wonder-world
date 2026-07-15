import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Little Wonder World — Gentle play, made together",
  description:
    "A peaceful digital village for stories, creativity, caring, and family imagination.",
  manifest: "/manifest.webmanifest",
  metadataBase: new URL("http://localhost:3008"),
  openGraph: {
    title: "Little Wonder World",
    description: "A peaceful digital village that moves at your child’s pace.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Little Wonder World",
    description: "A peaceful digital village that moves at your child’s pace.",
    images: ["/og.png"],
  },
};
export const viewport: Viewport = { themeColor: "#f8dca7" };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
