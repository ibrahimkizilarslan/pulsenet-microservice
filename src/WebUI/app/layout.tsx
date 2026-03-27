import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PulseNet | What's Happening?",
  description: "A premium microservice-based social platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <div className="max-w-[1300px] mx-auto flex min-h-screen bg-white dark:bg-black text-foreground">
          {children}
        </div>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
