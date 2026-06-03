import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://claude.raintree.technology"),
  title: "claude-starter — deep skills for Claude Code",
  description:
    "Opinionated Claude Code skill pack for fintech, growth builders, and Anthropic power-users. Seven deep, handwritten skills (Stripe, Supabase, Plaid, Expo, copywriting, Anthropic tooling) plus a TOON command wrapper that cuts input tokens 40–60% on tabular data.",
  openGraph: {
    title: "claude-starter — deep skills for Claude Code",
    description:
      "Seven deep, handwritten Claude Code skills + a TOON wrapper that measurably cuts input tokens 40–60% on tabular data.",
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
