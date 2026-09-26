import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Default to live Railway proxy so dev works immediately without needing local port 5000 running
  const proxyTarget = env.VITE_BACKEND_PROXY_TARGET || 'https://jennie-your-2nd-love-music-app-production.up.railway.app';

  return {
    base: './',
    plugins: [react()],
    server: {
      port: 5173,
      open: true,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
          configure: (proxy) => {
            proxy.on('error', (err, _req, res) => {
              if (res && !res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Proxy backend unavailable' }));
              }
            });
          },
        },
      },
    },
  };
});
