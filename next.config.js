/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Monaco Editor конфигурация
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'monaco-editor': '@monaco-editor/react'
      }
    }

    return config
  },
  // Разрешаем загрузку воркеров Monaco Editor
  experimental: {
    esmExternals: 'loose'
  }
}

module.exports = nextConfig 