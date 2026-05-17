import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-svelte',
              test: /node_modules\/(?:svelte|@sveltejs)\//,
            },
            {
              name: 'vendor-capacitor',
              test: /node_modules\/@capacitor(?:-community)?\//,
            },
            {
              name: 'vendor-sqlite',
              test: /node_modules\/(?:jeep-sqlite|sql\.js)\//,
            },
          ],
        },
      },
    },
  },
})
