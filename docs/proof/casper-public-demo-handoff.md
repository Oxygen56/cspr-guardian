# Casper Public Demo Handoff

Generated: 2026-07-02T15:32:27.284Z

Status: host_ready

Checks: 7/7 passed, 0 failed.

## Public Link Gate

Missing public links:

- None

## Current Public Path

The public judge demo is already available through GitHub Pages. The final
walkthrough, public source repository, BUIDL links, and Casper explorer URL are
configured.

## Optional Server Hosting Path

1. Push this project to a public repository.
2. Create a Render web service from the repo using `render.yaml`.
3. Keep `CASPER_MODE=mock` for repeatable interactive demo runs, or set
   `CASPER_MODE=real` only when intentionally using a funded local key.
4. Open `/api/health` on the hosted URL and confirm it returns `status: ok`.
5. Record or publish the 64-second final walkthrough from the hosted URL.
6. Re-export BUIDL fields:

```bash
SUBMISSION_REPO_URL=https://github.com/you/cspr-guardian \
SUBMISSION_DEMO_URL=https://your-demo.example \
SUBMISSION_VIDEO_URL=https://youtu.be/your-demo \
npm run export:buidl
npm run export:submission
npm run seal:submission
npm run audit:submission
```

The final Casper receipt is already picked up from final evidence. If a new
receipt is broadcast later, rerun `npm run seal:submission` and then
`npm run audit:submission`.

## Checks

| Check | Status | Detail |
| --- | --- | --- |
| dockerfile_present | pass | Dockerfile builds a production Node image and starts the demo with npm start. |
| dockerignore_protects_secrets | pass | .dockerignore excludes local keys, env files, dependencies, and generated outputs. |
| render_blueprint_present | pass | Render blueprint is present with Docker runtime and health check. |
| health_endpoint_present | pass | Server exposes /api/health for hosted-demo checks. |
| start_script_present | pass | package.json has a start script for public hosting. |
| submission_env_documented | pass | .env.example documents public submission URL fields. |
| public_links_configured | pass | BUIDL export has concrete public repo, hosted demo, and video links. |
