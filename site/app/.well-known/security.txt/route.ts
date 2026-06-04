import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const expires = new Date("2027-06-03T00:00:00.000Z").toISOString();
  const body = `Contact: mailto:${siteConfig.securityContact}
Preferred-Languages: en
Policy: ${siteConfig.repoUrl}/blob/main/SECURITY.md
Expires: ${expires}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
