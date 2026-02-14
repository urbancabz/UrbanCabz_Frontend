import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Build optimizations
  build: {
    // Enable minification
    minify: 'esbuild',

    // Code splitting configuration
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks - rarely change, cache well
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons': ['lucide-react', 'react-icons', '@heroicons/react'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'yup'],
          'vendor-map': ['leaflet', 'react-leaflet'],
        },
        // Use content hash for cache busting
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,

    // Generate source maps for production debugging
    sourcemap: false,

    // Target modern browsers for smaller bundle
    target: 'es2020',
  },

  // Dev server optimizations
  server: {
    // Pre-bundle dependencies for faster cold starts
    warmup: {
      clientFiles: [
        './src/App.jsx',
        './src/Pages/*.jsx',
        './src/Components/**/*.jsx',
      ],
    },
  },

  // Dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'lucide-react',
      '@heroicons/react/24/outline',
      'react-hot-toast',
    ],
  },
})
