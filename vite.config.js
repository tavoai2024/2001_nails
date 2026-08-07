import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/2001_nails/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        services: resolve(__dirname, 'services.html'),
        gallery: resolve(__dirname, 'gallery.html'),
        contact: resolve(__dirname, 'contact.html')
      }
    }
  }
});
