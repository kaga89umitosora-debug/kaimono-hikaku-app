import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pagesはリポジトリ名のサブパス配下(例: /kaimono-hikaku-app/)で公開されるため、
  // 相対パスにしてどのサブパスに置かれても解決できるようにする
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: '店舗価格比較 - Store Price Compare',
        short_name: '店舗価格比較',
        description:
          'Save product prices at your favorite stores, compare them, and build shopping lists.',
        // index.css の --accent / --bg と一致させ、テーマカラー・スプラッシュ画面を実際のUI配色に揃える
        theme_color: '#3d8bff',
        background_color: '#eef6fc',
        lang: 'en',
        display: 'standalone',
        // TWA化時のアプリ識別を安定させるための明示的なid(GitHub Pagesの公開パス)
        id: '/kaimono-hikaku-app/',
        // manifest内の相対パスは「manifestファイル自身の場所」を基準に解決されるため、
        // サブパス配下に置かれても正しく自分のスコープを指せる
        start_url: '.',
        scope: '.',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // このアプリは外部APIを呼ばずlocalStorageのみで完結するため、
        // ビルド成果物を全て事前キャッシュしてオフラインでも起動できるようにする
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
      },
    }),
  ],
})
