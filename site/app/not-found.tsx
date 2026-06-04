import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `Not found - ${siteConfig.name}`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="mt-3 font-mono text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The requested page does not exist on {siteConfig.name}.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-md border border-border/60 px-4 py-2 font-mono text-sm hover:border-border hover:bg-muted/60"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
