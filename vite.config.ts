import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { vitePluginForArco } from '@arco-plugins/vite-react';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './'),
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.tsx', '.jsx', '.ts', '.js', '.json', '.geojson'],
  },
  plugins: [
    react(),
    vitePluginForArco({
      modifyVars: {
        'primary-6': '#12372a',
        'primary-1': '#12372a',
        'primary-2': '#12372a',
        'primary-3': '#738977',
        'primary-4': '#12372a',
        'primary-5': '#12372a',
        'primary-7': '#0E3227',
        'arcoblue-6': '#12372a',
        style: true,
      },
    }),
    svgr({
      // svgr options: https://react-svgr.com/docs/options/
      svgrOptions: {
        exportType: 'default',
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: '**/*.svg',
    }),
  ],
});
