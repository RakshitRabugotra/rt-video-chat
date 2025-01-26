import type { Metadata } from "next";
import { cn } from "@/lib/utils";
// Fonts
import { Geist, Geist_Mono } from "next/font/google";
// For authentication
import { ClerkProvider } from "@clerk/nextjs";

// Providers
import ThemeProvider from "@/providers/ThemeProvider";
import SocketProvider from "@/providers/SocketProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Realtime Video Chat",
  description:
    "Chat with your beloved in realtime, while doing some other activities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <body
            className={cn(
              geistSans.variable,
              geistMono.variable,
              "antialiased relative"
            )}
            style={{
              height: "calc(100vh - var(--nav-height) - 8px)",
            }}
          >
            <SocketProvider>{children}</SocketProvider>
          </body>
        </ThemeProvider>
      </html>
    </ClerkProvider>
  );
}
