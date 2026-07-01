import fs from "node:fs/promises";
import path from "node:path";
import { readJsonIfExists, resolveOutputDir } from "./final-submission-seal.mjs";
import { summarizePublicSubmissionFields } from "./submission-profile.mjs";

const PRIVATE_KEY_PATTERN = /BEGIN [A-Z ]*PRIVATE KEY|"privateKey(?:Hex|Pem)?"\s*:/i;

export async function getPublicDemoReadiness({
  projectDir = process.cwd(),
  outputDir,
  generatedAt = new Date().toISOString()
} = {}) {
  const resolvedProjectDir = path.resolve(projectDir);
  const resolvedOutputDir = outputDir
    ? path.resolve(resolvedProjectDir, outputDir)
    : await resolveOutputDir(resolvedProjectDir);
  const files = await readProjectFiles(resolvedProjectDir);
  const buidl = await readJsonIfExists(path.join(resolvedOutputDir, "casper-buidl-submission.json"));
  const publicSubmission = summarizePublicSubmissionFields(buidl?.submissionFields || {});
  const checks = buildPublicDemoReadinessChecks({ files, publicSubmission });
  const summary = summarizeChecks(checks);
  const failedChecks = checks.filter((check) => check.status === "fail");
  const onlyPublicLinksMissing =
    failedChecks.length === 1 && failedChecks[0].name === "public_links_configured";
  const readiness = {
    version: "0.1",
    generatedAt,
    project: "CSPR Guardian",
    status:
      summary.failed === 0
        ? "host_ready"
        : onlyPublicLinksMissing
          ? "host_ready_needs_public_links"
          : "needs_review",
    summary,
    publicSubmission,
    deployment: {
      healthPath: "/api/health",
      dockerfile: "Dockerfile",
      renderBlueprint: "render.yaml",
      demoCommand: "npm start",
      localUrl: "http://localhost:4173",
      envForBuidlExport: [
        "SUBMISSION_REPO_URL",
        "SUBMISSION_DEMO_URL",
        "SUBMISSION_VIDEO_URL",
        "SUBMISSION_CASPER_EXPLORER_URL"
      ]
    },
    checks
  };

  assertNoPrivateKeyLeak(readiness);
  return readiness;
}

export function buildPublicDemoReadinessChecks({ files, publicSubmission }) {
  const checks = [];
  const add = (name, ok, detail, extra = {}) => {
    checks.push({
      name,
      detail,
      ...extra,
      status: ok ? "pass" : "fail",
      ok
    });
  };

  add(
    "dockerfile_present",
    files.dockerfile.includes("npm install --omit=dev") &&
      files.dockerfile.includes('CMD ["npm", "start"]'),
    "Dockerfile builds a production Node image and starts the demo with npm start."
  );
  add(
    "dockerignore_protects_secrets",
    [".local", ".env", "node_modules", "outputs"].every((item) =>
      files.dockerignore.split(/\r?\n/u).includes(item)
    ),
    ".dockerignore excludes local keys, env files, dependencies, and generated outputs."
  );
  add(
    "render_blueprint_present",
    files.renderYaml.includes("runtime: docker") &&
      files.renderYaml.includes("healthCheckPath: /api/health"),
    "Render blueprint is present with Docker runtime and health check."
  );
  add(
    "health_endpoint_present",
    files.server.includes('url.pathname === "/api/health"'),
    "Server exposes /api/health for hosted-demo checks."
  );
  add(
    "start_script_present",
    Boolean(files.packageJson.scripts?.start),
    "package.json has a start script for public hosting."
  );
  add(
    "submission_env_documented",
    ["SUBMISSION_REPO_URL", "SUBMISSION_DEMO_URL", "SUBMISSION_VIDEO_URL"].every((item) =>
      files.envExample.includes(item)
    ),
    ".env.example documents public submission URL fields."
  );
  add(
    "public_links_configured",
    publicSubmission.complete,
    publicSubmission.complete
      ? "BUIDL export has concrete public repo, hosted demo, and video links."
      : `Public links still need values: ${publicSubmission.missing.join(", ")}.`,
    publicSubmission
  );

  return checks;
}

export async function writePublicDemoReadiness(readiness, outputDir) {
  const resolvedOutputDir = outputDir || (await resolveOutputDir(process.cwd()));
  await fs.mkdir(resolvedOutputDir, { recursive: true });
  await fs.writeFile(
    path.join(resolvedOutputDir, "casper-public-demo-readiness.json"),
    `${JSON.stringify(readiness, null, 2)}\n`
  );
  await fs.writeFile(
    path.join(resolvedOutputDir, "casper-public-demo-handoff.md"),
    renderPublicDemoHandoffMarkdown(readiness)
  );
}

export function renderPublicDemoHandoffMarkdown(readiness) {
  const checks = readiness.checks
    .map((check) => `| ${check.name} | ${check.status} | ${check.detail} |`)
    .join("\n");
  const missingLinks = readiness.publicSubmission.missing.length
    ? readiness.publicSubmission.missing.map((item) => `- ${item}`).join("\n")
    : "- None";

  return `# Casper Public Demo Handoff

Generated: ${readiness.generatedAt}

Status: ${readiness.status}

Checks: ${readiness.summary.passed}/${readiness.summary.total} passed, ${readiness.summary.failed} failed.

## Public Link Gate

Missing public links:

${missingLinks}

## Fast Hosting Path

1. Push this project to a public repository.
2. Create a Render web service from the repo using \`render.yaml\`.
3. Keep \`CASPER_MODE=mock\` for the public demo until the testnet key is funded.
4. Open \`/api/health\` on the hosted URL and confirm it returns \`status: ok\`.
5. Record the 90-second walkthrough from the hosted URL.
6. Re-export BUIDL fields:

\`\`\`bash
SUBMISSION_REPO_URL=https://github.com/you/cspr-guardian \\
SUBMISSION_DEMO_URL=https://your-demo.example \\
SUBMISSION_VIDEO_URL=https://youtu.be/your-demo \\
npm run export:buidl
npm run export:submission
npm run seal:submission
npm run audit:submission
\`\`\`

After Casper funding, rerun \`npm run seal:submission\`, then add
\`SUBMISSION_CASPER_EXPLORER_URL\` if the explorer URL is not already picked up
from final evidence.

## Checks

| Check | Status | Detail |
| --- | --- | --- |
${checks}
`;
}

function summarizeChecks(checks) {
  return {
    passed: checks.filter((check) => check.status === "pass").length,
    failed: checks.filter((check) => check.status === "fail").length,
    total: checks.length
  };
}

async function readProjectFiles(projectDir) {
  const [dockerfile, dockerignore, renderYaml, server, packageJson, envExample] =
    await Promise.all([
      readText(path.join(projectDir, "Dockerfile")),
      readText(path.join(projectDir, ".dockerignore")),
      readText(path.join(projectDir, "render.yaml")),
      readText(path.join(projectDir, "src/server.mjs")),
      readJsonIfExists(path.join(projectDir, "package.json")),
      readText(path.join(projectDir, ".env.example"))
    ]);

  return {
    dockerfile,
    dockerignore,
    renderYaml,
    server,
    packageJson: packageJson || {},
    envExample
  };
}

async function readText(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

function assertNoPrivateKeyLeak(value) {
  if (PRIVATE_KEY_PATTERN.test(JSON.stringify(value))) {
    throw new Error("Public demo readiness would leak private key material.");
  }
}
