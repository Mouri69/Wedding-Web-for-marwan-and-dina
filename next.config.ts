import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/og.png',
        destination: '/og2.png',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/og2.png',
        headers: [{ key: 'Content-Type', value: 'image/png' }],
      },
      {
        source: '/weddingmetadata.png',
        headers: [{ key: 'Content-Type', value: 'image/png' }],
      },
    ]
  },
}

export default nextConfig
