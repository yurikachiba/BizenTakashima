import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        workIntroduction: resolve(__dirname, 'workIntroduction.html'),
        productionProcess: resolve(__dirname, 'productionProcess.html'),
        interview: resolve(__dirname, 'interview.html'),
        artistIntroduction: resolve(__dirname, 'artistIntroduction.html'),
        admin: resolve(__dirname, 'sohei-kiln-room-m7x9.html'),
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
});
