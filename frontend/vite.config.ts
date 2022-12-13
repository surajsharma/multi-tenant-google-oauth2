import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://host.docker.internal:3000',
        // target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    }
  }
});