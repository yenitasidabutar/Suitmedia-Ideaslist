import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://suitmedia-backend.suitdev.com',
        changeOrigin: true,
        secure: true,
        // Jika backend memang pakai /api, hapus bagian ini
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
