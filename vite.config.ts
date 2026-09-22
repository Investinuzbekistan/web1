import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Relative base so dist/ can be dropped on any static host or sub-path.
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Recharts pulls in d3 internals; keeping it out of the entry chunk lets
        // the hero paint before the charts are parsed.
        manualChunks(id: string) {
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) return 'charts';
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion'))
            return 'motion';
          return undefined;
        },
      },
    },
  },
  server: { port: 5171 },
  preview: { port: 5171 },
});
