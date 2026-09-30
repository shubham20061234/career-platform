import type { Metadata } from "next";
import Navbar from "./navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Career Platform",
  description: "Explore careers, skills, education and opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
