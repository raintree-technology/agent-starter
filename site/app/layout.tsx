import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://claude.raintree.technology"),
  title: "claude-starter — Raintree Technology",
  description:
    "A production-ready Claude Code starter: 40+ domain skills, TOON token optimization, and a clean pattern for extension.",
  openGraph: {
    title: "claude-starter — Raintree Technology",
    description:
      "Drop-in .claude/ config with 40+ skills, slash commands, and token optimization.",
    url: "https://claude.raintree.technology",
    siteName: "claude.raintree.technology",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
