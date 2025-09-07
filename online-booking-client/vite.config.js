import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import os from 'os';

export default defineConfig({
  plugins: [solidPlugin()],
  resolve: {
    // 公用子模块需要使用
    alias: {
      '@booking/shared-utils': join(__dirname, 'packages/shared-utils/src'),
    }
  },
  server: {
    // 开启局域网访问，方便调试
    host: '0.0.0.0',
    port: 3000,
    // 代理设置
    proxy: {
      '/api': 'http://192.168.31.85:3030',
      '/graphql': 'http://192.168.31.85:3030'
    },
    // configureServer(server) {
    //   server.httpServer?.on('listening', () => {
    //     const nets = os.networkInterfaces();
    //     const results = [];
    //     for (const name of Object.keys(nets)) {
    //       for (const net of nets[name]) {
    //         if (net.family === 'IPv4' && !net.internal) {
    //           results.push(net.address);
    //         }
    //       }
    //     }
    //     const port = server.config.server.port || 3000;
    //     console.log('\n本机IP访问地址:');
    //     results.forEach(ip => {
    //       console.log(` 2222 http://${ip}:${port}`);
    //     });
    //   });
    // }
  },
  build: {
    target: 'esnext',
  },
});
