import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                popup: 'index.html',
                timeline: 'timeline.html',
                settings: 'settings.html',
                'service-worker': 'src/service-worker.ts'
            },
            output: {
                entryFileNames: (assetInfo) => {
                    return assetInfo.name === 'service-worker' ? '[name].js' : 'assets/[name]-[hash].js'
                }
            }
        },
    },
})
