
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Prevent webpack from trying to resolve 'canvas'
    // This is a common workaround for 'Module not found: Can't resolve 'canvas'' with pdfjs-dist.
    // pdfjs-dist attempts to require('canvas') in Node.js environments,
    // but it's not needed for the client-side operations in this app,
    // and causes build failures in environments where the native canvas module isn't available.
    // Aliasing it to `false` effectively tells Webpack to ignore this module.
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    config.resolve.alias.canvas = false;

    // If you were using node-fetch or other Node.js specific modules client-side
    // and encountered issues, you might add fallbacks here for the client bundle.
    // However, for this specific 'canvas' issue with pdfjs-dist, aliasing is more direct.
    // if (!isServer) {
    //   config.resolve.fallback = {
    //     ...config.resolve.fallback,
    //     fs: false, // Example: if a module tried to use 'fs' on client
    //   };
    // }

    return config;
  },
};

export default nextConfig;
