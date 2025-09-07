import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3001,
    proxy: {
      '/api': 'http://192.168.31.85:3030',
      '/graphql': 'http://192.168.31.85:3030'
    }
  },
  build: {
    target: 'esnext',
  },
});
