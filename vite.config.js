import { defineConfig } from 'vite';

// Extra hostnames the dev server may be reached from (comma separated), e.g. a
// cloud preview domain. Everything else keeps Vite's default localhost-only
// protection, so no blanket wildcard is allowed.
const extraHosts = (process.env.VITE_ALLOWED_HOSTS || '')
  .split(',')
  .map((h) => h.trim())
  .filter(Boolean);

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: extraHosts.length ? extraHosts : undefined,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: extraHosts.length ? extraHosts : undefined,
  },
});
