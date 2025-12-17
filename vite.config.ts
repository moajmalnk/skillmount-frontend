import path from "path"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to handle main.jsx redirect
    {
      name: 'redirect-main-jsx',
      configureServer(server) {
        server.middlewares.use('/src/main.jsx', (req, res, next) => {
          res.writeHead(302, { Location: '/src/main.tsx' });
          res.end();
        });
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize build output
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'framer-motion'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  // Performance improvements
  server: {
    hmr: {
      overlay: false,
    },
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Permissions-Policy': 'camera=(), microphone=(self), payment=(), usb=(), geolocation=(), magnetometer=(), midi=(), sync-xhr=(), xr-spatial-tracking=(), autoplay=(), display-capture=(), hid=(), idle-detection=(), local-fonts=(), otp-credentials=(), publickey-credentials-create=(), publickey-credentials-get=(), screen-wake-lock=(), serial=(), shared-storage=(), storage-access=(), unload=(), web-share=(), window-management=()',
    },
    // Handle redirects for common file name issues
    middlewareMode: false,
  },
})
