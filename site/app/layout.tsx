import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://claude.raintree.technology"),
  title: "agent-starter - skills for Claude Code, Codex, and Cursor",
  description:
    "Opinionated multi-agent skill pack for Claude Code, Codex, and Cursor. Seven deep, handwritten skills plus native project outputs for .claude, .codex, and .cursor/rules.",
  openGraph: {
    title: "agent-starter - skills for Claude Code, Codex, and Cursor",
    description:
      "Seven deep, handwritten skills generated into Claude Code, Codex, and Cursor project formats.",
    url: "https://claude.raintree.technology",
    siteName: "claude.raintree.technology",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          nonce={nonce}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
