const PLACEHOLDERS = {
  repoUrl: "<paste repository URL>",
  demoUrl: "<paste hosted demo URL>",
  videoUrl: "<paste 90-second demo video URL>",
  casperExplorerUrl: "<fund testnet key, run npm run seal:submission, paste CSPR.live deploy URL>"
};

export function buildSubmissionFields({
  env = process.env,
  casperExplorerUrl = null
} = {}) {
  return {
    shortDescription:
      "Agentic RWA workflow where autonomous treasuries buy paid risk tools and anchor decision evidence to Casper.",
    repoUrl: firstValue(env.SUBMISSION_REPO_URL, env.REPO_URL, PLACEHOLDERS.repoUrl),
    demoUrl: firstValue(env.SUBMISSION_DEMO_URL, env.DEMO_URL, PLACEHOLDERS.demoUrl),
    videoUrl: firstValue(env.SUBMISSION_VIDEO_URL, env.VIDEO_URL, PLACEHOLDERS.videoUrl),
    casperExplorerUrl: firstValue(
      casperExplorerUrl,
      env.SUBMISSION_CASPER_EXPLORER_URL,
      env.CASPER_EXPLORER_URL,
      PLACEHOLDERS.casperExplorerUrl
    )
  };
}

export function summarizePublicSubmissionFields(fields = {}) {
  const required = ["repoUrl", "demoUrl", "videoUrl"];
  const items = required.map((name) => ({
    name,
    value: fields[name] || null,
    complete: isPublicUrl(fields[name])
  }));

  return {
    status: items.every((item) => item.complete) ? "complete" : "missing_public_links",
    complete: items.every((item) => item.complete),
    missing: items.filter((item) => !item.complete).map((item) => item.name),
    items
  };
}

export function isPublicUrl(value) {
  if (typeof value !== "string" || /[<>]/u.test(value)) return false;
  try {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname)
    );
  } catch {
    return false;
  }
}

function firstValue(...values) {
  return values.find((value) => typeof value === "string" && value.trim()) || "";
}
