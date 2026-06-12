import type { MetadataRoute } from "next"
import { absoluteUrl, siteConfig } from "@/lib/site"

const siteHost = new URL(siteConfig.url).host

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteHost,
  }
}
