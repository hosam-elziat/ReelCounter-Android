import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { handleGitHubPushAndBuild, handleGitHubWorkflowStatus } from './src/server/githubHandler';

function githubApiPlugin(): Plugin {
  return {
    name: 'github-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method === 'POST' && req.url === '/api/github/push-and-build') {
          handleGitHubPushAndBuild(req, res);
          return;
        }
        if (req.method === 'GET' && req.url?.startsWith('/api/github/workflow-status')) {
          handleGitHubWorkflowStatus(req, res);
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), githubApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
