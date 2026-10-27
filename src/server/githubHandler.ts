import { execSync } from 'child_process';
import type { IncomingMessage, ServerResponse } from 'http';

interface PushPayload {
  token: string;
  repoName: string;
  isPrivate?: boolean;
}

export async function handleGitHubPushAndBuild(
  req: IncomingMessage,
  res: ServerResponse
) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const data: PushPayload = JSON.parse(body || '{}');
      const { token, repoName, isPrivate } = data;

      if (!token || !repoName) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'GitHub token and repository name are required.' }));
        return;
      }

      const cleanToken = token.trim();
      const cleanRepo = repoName.trim().replace(/\s+/g, '-');

      // 1. Verify GitHub Token and get user profile
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'ReelCounter-Builder',
        },
      });

      if (!userRes.ok) {
        const err = await userRes.json();
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `GitHub authentication failed: ${err.message || 'Invalid token'}` }));
        return;
      }

      const user = await userRes.json();
      const owner = user.login;

      // 2. Check if repository exists or create it
      const repoCheckRes = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'ReelCounter-Builder',
        },
      });

      let repoCreated = false;
      if (repoCheckRes.status === 404) {
        // Create the repository
        const createRes = await fetch('https://api.github.com/user/repos', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'ReelCounter-Builder',
          },
          body: JSON.stringify({
            name: cleanRepo,
            description: 'ReelCounter - Native Android short-form video daily counter with floating VR goggles HUD',
            private: isPrivate ?? false,
            auto_init: false,
          }),
        });

        if (!createRes.ok) {
          const err = await createRes.json();
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Failed to create GitHub repository: ${err.message || 'Error'}` }));
          return;
        }
        repoCreated = true;
      }

      // 3. Git commit & push
      const gitCommands = [
        'git init',
        'git config user.name "ReelCounter App Builder"',
        'git config user.email "hosamelziat9@gmail.com"',
        'git add -A',
        'git commit -m "feat: ReelCounter Android Project & GitHub Actions APK Builder" || true',
        'git branch -M main',
        `git remote remove origin 2>/dev/null || true`,
        `git remote add origin https://x-access-token:${cleanToken}@github.com/${owner}/${cleanRepo}.git`,
        'git push -u origin main --force',
      ];

      execSync(gitCommands.join(' && '), {
        stdio: 'pipe',
        timeout: 45000,
      });

      // 4. Trigger GitHub Actions workflow dispatch if present
      let workflowDispatched = false;
      try {
        const dispatchRes = await fetch(
          `https://api.github.com/repos/${owner}/${cleanRepo}/actions/workflows/build-apk.yml/dispatches`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${cleanToken}`,
              Accept: 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
              'User-Agent': 'ReelCounter-Builder',
            },
            body: JSON.stringify({
              ref: 'main',
            }),
          }
        );
        workflowDispatched = dispatchRes.status === 204;
      } catch (e) {
        // Ignore dispatch error as push event triggers it automatically
      }

      const repoUrl = `https://github.com/${owner}/${cleanRepo}`;
      const actionsUrl = `${repoUrl}/actions`;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: true,
          owner,
          repo: cleanRepo,
          repoUrl,
          actionsUrl,
          repoCreated,
          workflowDispatched,
          message: 'Project pushed to GitHub successfully! APK build workflow is running.',
        })
      );
    } catch (err: any) {
      console.error('GitHub push error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message || 'Internal server error during git push.' }));
    }
  });
}

export async function handleGitHubWorkflowStatus(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    const url = new URL(req.url || '', 'http://localhost:3000');
    const token = url.searchParams.get('token');
    const owner = url.searchParams.get('owner');
    const repo = url.searchParams.get('repo');

    if (!token || !owner || !repo) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing token, owner, or repo' }));
      return;
    }

    const runsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'ReelCounter-Builder',
      },
    });

    if (!runsRes.ok) {
      res.writeHead(runsRes.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch GitHub Actions runs.' }));
      return;
    }

    const runsData = await runsRes.json();
    const latestRun = runsData.workflow_runs?.[0] || null;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        run: latestRun
          ? {
              id: latestRun.id,
              status: latestRun.status, // queued, in_progress, completed
              conclusion: latestRun.conclusion, // success, failure
              html_url: latestRun.html_url,
              created_at: latestRun.created_at,
              updated_at: latestRun.updated_at,
            }
          : null,
      })
    );
  } catch (err: any) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}
