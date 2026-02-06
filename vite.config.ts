import path from "path"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'SkillMount Students',
        short_name: 'SkillMount',
        description: 'SkillMount Student Portal - WordPress & No-Code Training',
        theme_color: '#7e22ce',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: "My Dashboard",
            short_name: "Dashboard",
            description: "Go to your dashboard",
            url: "/",
            icons: [{ src: "pwa-192x192.png", sizes: "192x192" }]
          },
          {
            name: "Materials & Videos",
            short_name: "Materials",
            description: "Browse course materials",
            url: "/materials",
            icons: [{ src: "pwa-192x192.png", sizes: "192x192" }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    }),
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
