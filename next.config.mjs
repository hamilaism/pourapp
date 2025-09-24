/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignore les erreurs ESLint pendant le build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore les erreurs TypeScript pendant le build (optionnel)
    ignoreBuildErrors: true,
  },
}

export default nextConfig
