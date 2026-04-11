import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/opengraph-image.png',
        headers: [{ key: 'Content-Type', value: 'image/png' }],
      },
      {
        source: '/twitter-image.png',
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
