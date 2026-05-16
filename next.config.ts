import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/og.jpg', destination: '/og3.png', permanent: true },
      { source: '/og2.png', destination: '/og3.png', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/og3.png',
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
