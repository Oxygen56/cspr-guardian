import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  callPaidCovenantOracle,
  callPaidKybOracle,
  callPaidLiquidityOracle,
  callPaidRiskOracle,
  listTools,
  loadSignals,
  runScenario
} from "./agent.mjs";
import { getLatestEvidenceBundle, getProviderLedger, getRunLedger } from "./ledger.mjs";
import { verifyLatestEvidenceBundle } from "./evidence-verifier.mjs";
import { getTestnetReadiness } from "./testnet-readiness.mjs";
import { getPrizeReadiness } from "./prize-readiness.mjs";
import { generateJudgeProofPack } from "./judge-proof-pack.mjs";
import { generateTestnetPreflight } from "./testnet-preflight.mjs";
import {
  buildFundingSeal,
  buildReadySeal,
  fileSha256,
  readJsonIfExists,
  resolveOutputDir
} from "./final-submission-seal.mjs";
import { generateSubmissionAudit } from "./submission-audit.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");
const port = Number(process.env.PORT || 4173);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "GET" && url.pathname === "/api/health") {
      return json(res, 200, {
        status: "ok",
        project: "CSPR Guardian",
        mode: process.env.CASPER_MODE || "mock",
        chain: process.env.CASPER_CHAIN_NAME || process.env.CASPER_NETWORK || "casper-test",
        timestamp: new Date().toISOString()
      });
    }

    if (req.method === "GET" && url.pathname === "/api/tools") {
      return json(res, 200, { tools: await listTools() });
    }

    if (req.method === "GET" && url.pathname === "/api/assets") {
      const dataset = await loadSignals();
      return json(res, 200, dataset);
    }

    if (req.method === "GET" && url.pathname === "/api/runs") {
      return json(res, 200, await getRunLedger());
    }

    if (req.method === "GET" && url.pathname === "/api/provider-ledger") {
      return json(res, 200, await getProviderLedger());
    }

    if (req.method === "GET" && url.pathname === "/api/evidence/latest") {
      return json(res, 200, await getLatestEvidenceBundle());
    }

    if (req.method === "GET" && url.pathname === "/api/evidence/verify") {
      return json(res, 200, await verifyLatestEvidenceBundle());
    }

    if (req.method === "GET" && url.pathname === "/api/testnet/readiness") {
      return json(res, 200, await getTestnetReadiness());
    }

    if (req.method === "POST" && url.pathname === "/api/testnet/preflight") {
      return json(res, 200, await generateTestnetPreflight());
    }

    if (req.method === "GET" && url.pathname === "/api/prize-readiness") {
      return json(res, 200, await getPrizeReadiness());
    }

    if (req.method === "GET" && url.pathname === "/api/submission/seal") {
      return json(res, 200, await getCurrentSubmissionSeal());
    }

    if (req.method === "GET" && url.pathname === "/api/submission/audit") {
      return json(res, 200, await generateSubmissionAudit({ projectDir: root }));
    }

    if (req.method === "POST" && url.pathname === "/api/judge-proof") {
      const body = await readJson(req);
      return json(
        res,
        200,
        await generateJudgeProofPack({
          assetId: body.assetId,
          requestedAmountUsd: Number(body.requestedAmountUsd) || undefined
        })
      );
    }

    if (req.method === "POST" && url.pathname === "/api/run-scenario") {
      const body = await readJson(req);
      return json(res, 200, await runScenario(body));
    }

    if (req.method === "GET" && url.pathname === "/api/oracle/rwa-risk") {
      const result = await callPaidRiskOracle({
        assetId: url.searchParams.get("assetId"),
        paymentProof: req.headers["x-payment"] || req.headers["payment-signature"]
      });
      return json(res, result.status, result.body, result.headers);
    }

    if (req.method === "GET" && url.pathname === "/api/oracle/kyb-screen") {
      const result = await callPaidKybOracle({
        assetId: url.searchParams.get("assetId"),
        paymentProof: req.headers["x-payment"] || req.headers["payment-signature"]
      });
      return json(res, result.status, result.body, result.headers);
    }

    if (req.method === "GET" && url.pathname === "/api/oracle/liquidity-depth") {
      const result = await callPaidLiquidityOracle({
        assetId: url.searchParams.get("assetId"),
        requestedAmountUsd: Number(url.searchParams.get("requestedAmountUsd")) || undefined,
        paymentProof: req.headers["x-payment"] || req.headers["payment-signature"]
      });
      return json(res, result.status, result.body, result.headers);
    }

    if (req.method === "GET" && url.pathname === "/api/oracle/covenant-monitor") {
      const result = await callPaidCovenantOracle({
        assetId: url.searchParams.get("assetId"),
        requestedAmountUsd: Number(url.searchParams.get("requestedAmountUsd")) || undefined,
        paymentProof: req.headers["x-payment"] || req.headers["payment-signature"]
      });
      return json(res, result.status, result.body, result.headers);
    }

    if (req.method === "GET" && url.pathname === "/mcp/tools") {
      return json(res, 200, {
        protocol: "mcp-lite",
        tools: await listTools()
      });
    }

    if (req.method === "POST" && url.pathname === "/mcp/call") {
      const body = await readJson(req);
      if (
        !["rwa.risk_score", "rwa.kyb_screen", "rwa.liquidity_depth", "rwa.covenant_monitor"].includes(
          body.tool
        )
      ) {
        return json(res, 404, { error: "Unknown tool" });
      }

      const handler =
        body.tool === "rwa.risk_score"
          ? callPaidRiskOracle
          : body.tool === "rwa.kyb_screen"
            ? callPaidKybOracle
            : body.tool === "rwa.liquidity_depth"
              ? callPaidLiquidityOracle
              : callPaidCovenantOracle;
      const result = await handler({
        assetId: body.arguments?.assetId,
        requestedAmountUsd: body.arguments?.requestedAmountUsd,
        paymentProof: body.paymentProof
      });
      return json(res, result.status, result.body, result.headers);
    }

    return serveStatic(url.pathname, res);
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: error.message || "Internal error" });
  }
});

server.listen(port, () => {
  console.log(`CSPR Guardian demo running at http://localhost:${port}`);
});

async function serveStatic(pathname, res) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(publicDir, safePath));

  if (!filePath.startsWith(publicDir)) {
    return json(res, 403, { error: "Forbidden" });
  }

  try {
    const data = await fs.readFile(filePath);
    const type = contentType(path.extname(filePath));
    res.writeHead(200, { "content-type": type });
    res.end(data);
  } catch {
    return json(res, 404, { error: "Not found" });
  }
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function json(res, status, body, headers = {}) {
  res.writeHead(status, { "content-type": "application/json", ...headers });
  res.end(JSON.stringify(body, null, 2));
}

function contentType(ext) {
  return (
    {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8"
    }[ext] || "application/octet-stream"
  );
}

async function getCurrentSubmissionSeal() {
  const outputDir = await resolveOutputDir(root);
  const readiness = await getTestnetReadiness();
  const [finalEvidence, prizeReadiness, judgeProof, packManifest] = await Promise.all([
    readJsonIfExists(path.join(outputDir, "casper-final-testnet-evidence.json")),
    readJsonIfExists(path.join(outputDir, "casper-prize-readiness.json")),
    readJsonIfExists(path.join(outputDir, "casper-judge-proof-pack.json")),
    readPackManifest(outputDir)
  ]);

  if (!readiness.readyForAnchor && finalEvidence?.status !== "ready_for_submission") {
    return buildFundingSeal({ readiness, packManifest });
  }

  return buildReadySeal({
    readiness,
    finalEvidence,
    prizeReadiness,
    judgeProof,
    packManifest
  });
}

async function readPackManifest(outputDir) {
  const manifest = await readJsonIfExists(
    path.join(outputDir, "cspr-guardian-final-submission/manifest.json")
  );
  if (!manifest) return null;

  const zipPath = path.join(outputDir, "cspr-guardian-final-submission.zip");
  try {
    const stat = await fs.stat(zipPath);
    return {
      ...manifest,
      zip: {
        path: zipPath,
        bytes: stat.size,
        sha256: await fileSha256(zipPath)
      }
    };
  } catch {
    return manifest;
  }
}
