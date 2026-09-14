import { defineConfig, loadEnv } from 'vite';
export default defineConfig(({mode}) => {
  if (mode === 'cloud') {
    const { VITE_API_BASE } = loadEnv(mode, process.cwd(), 'VITE_');
    if (!VITE_API_BASE || /teamind/i.test(VITE_API_BASE)) {
      throw new Error('Cloud build blocked: set VITE_API_BASE to the dedicated Grey Heron API. TeaMind is not allowed.');
    }
    const api = new URL(VITE_API_BASE);
    if (api.protocol !== 'https:' || api.pathname !== '/api/grey-heron' || api.search || api.hash || api.username || api.password) {
      throw new Error('VITE_API_BASE must be an HTTPS URL ending in /api/grey-heron, without credentials or query parameters.');
    }
  }
  return {
  server: { middlewareMode: true },
  appType: 'spa',
  build: {rollupOptions: {input: {game: 'index.html', materials: 'materials.html'}}},
  };
});
