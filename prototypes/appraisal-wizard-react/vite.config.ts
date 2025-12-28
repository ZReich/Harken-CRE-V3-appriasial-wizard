import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-recharts': ['recharts'],
          'vendor-lucide': ['lucide-react'],
          // Feature chunks
          'feature-sales': ['./src/features/sales-comparison/index.ts'],
          'feature-income': ['./src/features/income-approach/index.ts'],
          'feature-cost': ['./src/features/cost-approach/index.ts'],
          'feature-land': ['./src/features/land-valuation/index.ts'],
          'feature-market': ['./src/features/market-analysis/index.ts'],
          'feature-multifamily': ['./src/features/multi-family/index.ts'],
        },
      },
    },
    // Increase chunk warning limit slightly since we're now chunking appropriately
    chunkSizeWarningLimit: 600,
  },
})
