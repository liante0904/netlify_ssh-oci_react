import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    // Gzip 압축 (브라우저가 가장 널리 지원)
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli 압축 (더 높은 압축률, 최신 브라우저 지원)
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  publicDir: 'public',
  build: {
    // 소스 맵 제거로 빌드 속도 향상 및 보안 강화
    sourcemap: false,
    // 500kb 이상의 청크 경고 설정
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: ['/lib/pdfjs/build/pdf.mjs', '/lib/pdfjs/build/pdf.worker.mjs'],
      output: {
        // 모든 외부 라이브러리를 하나의 안정적인 청크로 묶어 순환 청크를 방지한다.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // 에셋 파일 이름 규칙
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
      },
    },
  },
})
