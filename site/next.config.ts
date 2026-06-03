import type { NextConfig } from 'next'
import { fileURLToPath } from 'node:url'

const siteRoot = fileURLToPath(new URL('.', import.meta.url))

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: siteRoot,
  },
}

export default nextConfig
