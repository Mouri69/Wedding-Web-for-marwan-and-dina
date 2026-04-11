import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/og2.png',
        headers: [{ key: 'Content-Type', value: 'image/png' }],
      },
      {
        source: '/og.png',
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
