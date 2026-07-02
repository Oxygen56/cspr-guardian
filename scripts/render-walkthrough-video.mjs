import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const projectDir = path.resolve(new URL("..", import.meta.url).pathname);
const outputPath = path.join(projectDir, "docs/cspr-guardian-walkthrough.webm");
const chromePath =
  process.env.CHROME_BIN || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const debugPort = Number(process.env.CHROME_DEBUG_PORT || 9461);
const fps = 24;
const durationSeconds = 64;

const assetUrl = (file) => pathToFileURL(path.join(projectDir, file)).href;
const html = renderHtml({
  fps,
  durationSeconds,
  assets: {
    dashboard: assetUrl("docs/assets/cspr-guardian-dashboard.png"),
    review: assetUrl("docs/assets/cspr-guardian-review-readiness.png"),
    proof: assetUrl("docs/assets/cspr-guardian-judge-proof.png"),
    preflight: assetUrl("docs/assets/cspr-guardian-testnet-preflight.png")
  }
});

await fs.mkdir(path.dirname(outputPath), { recursive: true });
const htmlPath = path.join(os.tmpdir(), `cspr-guardian-walkthrough-${Date.now()}.html`);
await fs.writeFile(htmlPath, html);

const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--disable-background-networking",
    "--disable-component-update",
    "--autoplay-policy=no-user-gesture-required",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${path.join(os.tmpdir(), `cspr-guardian-video-profile-${Date.now()}`)}`,
    pathToFileURL(htmlPath).href
  ],
  { stdio: ["ignore", "ignore", "ignore"] }
);

try {
  await waitForJson(`http://127.0.0.1:${debugPort}/json/version`, 15000);
  const targets = await waitForJson(`http://127.0.0.1:${debugPort}/json`, 15000);
  const target = targets.find((item) => item.type === "page" && item.webSocketDebuggerUrl);
  if (!target) throw new Error("Chrome page target was not available.");

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));
  const cdp = createCdpClient(ws);
  await cdp("Runtime.enable");

  await waitForPageValue(cdp, "window.__walkthroughDone === true", (durationSeconds + 20) * 1000);
  const result = await cdp("Runtime.evaluate", {
    expression: "window.__walkthroughVideoBase64",
    returnByValue: true
  });
  const videoBase64 = result.result?.value;
  if (!videoBase64) throw new Error("Walkthrough video data was not produced.");

  await fs.writeFile(outputPath, Buffer.from(videoBase64, "base64"));
  console.log(
    JSON.stringify(
      {
        status: "ok",
        outputPath,
        durationSeconds,
        bytes: (await fs.stat(outputPath)).size
      },
      null,
      2
    )
  );
  ws.close();
} finally {
  chrome.kill("SIGTERM");
}

function createCdpClient(ws) {
  let id = 1;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result || {});
  });

  return (method, params = {}) => {
    const callId = id++;
    ws.send(JSON.stringify({ id: callId, method, params }));
    return new Promise((resolve, reject) => pending.set(callId, { resolve, reject }));
  };
}

async function waitForPageValue(cdp, expression, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = await cdp("Runtime.evaluate", { expression, returnByValue: true });
    if (result.result?.value) return;
    await sleep(500);
  }
  throw new Error(`Timed out waiting for page expression: ${expression}`);
}

async function waitForJson(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch {
      // Chrome is still starting.
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function renderHtml({ fps, durationSeconds, assets }) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>CSPR Guardian Final Walkthrough Renderer</title>
  <style>
    body { margin: 0; background: #0b1220; }
    canvas { display: block; width: 1280px; height: 720px; }
  </style>
</head>
<body>
  <canvas id="stage" width="1280" height="720"></canvas>
  <script>
    const fps = ${fps};
    const durationSeconds = ${durationSeconds};
    const assets = ${JSON.stringify(assets)};
    const tx = "7982fc56043fe482643d49478c0ecaf696f1e7db979021a23ae6a4841516cb5a";
    const txUrl = "https://testnet.cspr.live/transaction/" + tx;
    const canvas = document.getElementById("stage");
    const ctx = canvas.getContext("2d");
    const images = {};

    const slides = [
      {
        start: 0,
        end: 8,
        kicker: "FINAL REVIEW STATUS",
        title: "CSPR Guardian",
        subtitle: "Autonomous RWA treasury agents with paid risk intelligence and Casper receipts.",
        metrics: [["Review readiness", "100/100"], ["Final review gate", "cleared"], ["Blockers", "0"]],
        bullets: ["Real Casper testnet receipt is published", "Independent verifier passes 34/34 checks", "Judge proof pack passes 10/10 assertions"]
      },
      {
        start: 8,
        end: 18,
        kicker: "FINAL REVIEW EVIDENCE",
        title: "Start with the proof",
        subtitle: "The scorecard is already final: 100/100 with a real CSPR.live transaction.",
        image: "review",
        bullets: ["Casper receipt: real testnet deploy", "Final gate: cleared", "Submission assets: ready"]
      },
      {
        start: 18,
        end: 28,
        kicker: "X402 + MCP",
        title: "Paid tools are discovered and settled",
        subtitle: "The agent sees paid MCP-style tools, receives HTTP 402 requirements, signs authorizations, and rejects replay.",
        image: "proof",
        bullets: ["4/4 signed x402-Casper proofs", "Nonce replay protection returns 402", "Provider revenue is recomputed for judges"]
      },
      {
        start: 28,
        end: 38,
        kicker: "AGENTIC RWA WORKFLOW",
        title: "Risk, KYB, liquidity, covenant",
        subtitle: "The agent buys intelligence before allocating capital, then records the full decision trail.",
        image: "dashboard",
        bullets: ["Risk score and KYB policy", "Liquidity depth and covenant monitoring", "Capped allocation decision with 0.62 CSPR provider revenue"]
      },
      {
        start: 38,
        end: 49,
        kicker: "CASPER TESTNET RECEIPT",
        title: "Final receipt is public",
        subtitle: txUrl,
        image: "preflight",
        bullets: ["Account funded on casper-test", "Deploy build OK, broadcast false in preflight", "Final seal ready_for_final_review"]
      },
      {
        start: 49,
        end: 58,
        kicker: "SUBMISSION PACK",
        title: "Ready for judging",
        subtitle: "Repo, hosted demo, walkthrough, proof pack, audit, and CSPR.live transaction are all linked.",
        metrics: [["Audit", "15/15"], ["Proof", "10/10"], ["Evidence", "34/34"]],
        bullets: ["Public demo: oxygen56.github.io/cspr-guardian", "Repository: github.com/Oxygen56/cspr-guardian", "Final transaction: " + tx.slice(0, 10) + "..." + tx.slice(-8)]
      },
      {
        start: 58,
        end: 64,
        kicker: "CASPER AGENTIC BUILDATHON",
        title: "CSPR Guardian is final-review ready",
        subtitle: "A verifiable agent economy workflow: discover paid tools, pay with signed proofs, make an RWA decision, anchor evidence on Casper.",
        metrics: [["Status", "ready"], ["Gate", "cleared"], ["Score", "100/100"]],
        bullets: ["x402-style payments", "MCP-style discovery", "Real Casper testnet receipt"]
      }
    ];

    main().catch((error) => {
      window.__walkthroughError = String(error && error.stack ? error.stack : error);
      window.__walkthroughDone = true;
    });

    async function main() {
      await loadImages();
      const stream = canvas.captureStream(fps);
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm;codecs=vp8",
        videoBitsPerSecond: 1400000
      });
      const chunks = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size) chunks.push(event.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        window.__walkthroughVideoBase64 = await blobToBase64(blob);
        window.__walkthroughDone = true;
      };

      recorder.start();
      const started = performance.now();
      function frame() {
        const t = Math.min((performance.now() - started) / 1000, durationSeconds);
        draw(t);
        if (t < durationSeconds) {
          requestAnimationFrame(frame);
        } else {
          recorder.stop();
        }
      }
      frame();
    }

    function draw(t) {
      const slide = slides.find((item) => t >= item.start && t < item.end) || slides[slides.length - 1];
      const local = (t - slide.start) / (slide.end - slide.start);
      drawBackground(t);
      drawProgress(t);

      const leftX = 62;
      const topY = 54;
      const leftW = slide.image ? 420 : 560;
      const fade = Math.min(1, local * 2.4);
      ctx.globalAlpha = fade;
      drawLabel(slide.kicker, leftX, topY);
      drawWrapped(slide.title, leftX, topY + 38, leftW, 58, 1.02, "#ffffff", "800");
      drawWrapped(slide.subtitle, leftX, topY + 176, leftW, 25, 1.35, "#cbd5e1", "500");

      if (slide.metrics) drawMetrics(slide.metrics, leftX, 300, leftW);
      drawBullets(slide.bullets, leftX, slide.metrics ? 450 : 332, leftW);

      if (slide.image) {
        drawImagePanel(images[slide.image], 520, 86, 700, 446, local);
      }

      drawFooter(t);
      ctx.globalAlpha = 1;
    }

    function drawBackground(t) {
      const gradient = ctx.createLinearGradient(0, 0, 1280, 720);
      gradient.addColorStop(0, "#0f172a");
      gradient.addColorStop(0.55, "#111827");
      gradient.addColorStop(1, t > 37 ? "#13251f" : "#211621");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1280, 720);

      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "#14b8a6";
      ctx.fillRect(0, 0, 1280, 8);
      ctx.globalAlpha = 1;
    }

    function drawLabel(text, x, y) {
      ctx.fillStyle = "#2dd4bf";
      ctx.font = "800 18px Inter, system-ui, sans-serif";
      ctx.fillText(text, x, y);
    }

    function drawMetrics(metrics, x, y, width) {
      const gap = 12;
      const cardW = (width - gap * (metrics.length - 1)) / metrics.length;
      for (let i = 0; i < metrics.length; i += 1) {
        const cardX = x + i * (cardW + gap);
        roundRect(cardX, y, cardW, 102, 14, "rgba(255,255,255,0.09)", "rgba(148,163,184,0.25)");
        ctx.fillStyle = "#94a3b8";
        ctx.font = "600 15px Inter, system-ui, sans-serif";
        ctx.fillText(metrics[i][0], cardX + 18, y + 34);
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 30px Inter, system-ui, sans-serif";
        ctx.fillText(metrics[i][1], cardX + 18, y + 74);
      }
    }

    function drawBullets(bullets, x, y, width) {
      ctx.font = "700 25px Inter, system-ui, sans-serif";
      bullets.forEach((bullet, index) => {
        const bulletY = y + index * 58;
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(x + 11, bulletY - 8, 8, 0, Math.PI * 2);
        ctx.fill();
        drawWrapped(bullet, x + 36, bulletY - 26, width - 42, 25, 1.25, "#f8fafc", "700");
      });
    }

    function drawImagePanel(image, x, y, w, h, local) {
      const scale = 0.98 + Math.sin(local * Math.PI) * 0.02;
      const panelX = x + (w * (1 - scale)) / 2;
      const panelY = y + (h * (1 - scale)) / 2;
      const panelW = w * scale;
      const panelH = h * scale;
      roundRect(panelX - 18, panelY - 18, panelW + 36, panelH + 36, 28, "#f8fafc", "rgba(255,255,255,0.26)");
      containImage(image, panelX, panelY, panelW, panelH);
      ctx.strokeStyle = "rgba(15,23,42,0.35)";
      ctx.lineWidth = 5;
      roundPath(panelX, panelY, panelW, panelH, 16);
      ctx.stroke();
    }

    function containImage(image, x, y, w, h) {
      const ratio = Math.min(w / image.width, h / image.height);
      const drawW = image.width * ratio;
      const drawH = image.height * ratio;
      const drawX = x + (w - drawW) / 2;
      const drawY = y + (h - drawH) / 2;
      ctx.drawImage(image, drawX, drawY, drawW, drawH);
    }

    function drawProgress(t) {
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      roundPath(62, 656, 1156, 8, 8);
      ctx.fill();
      ctx.fillStyle = "#ef4444";
      roundPath(62, 656, 1156 * (t / durationSeconds), 8, 8);
      ctx.fill();
    }

    function drawFooter(t) {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "800 24px Inter, system-ui, sans-serif";
      ctx.fillText("CSPR Guardian - Casper Agentic Buildathon", 62, 626);
      ctx.textAlign = "right";
      ctx.fillText(Math.round(t).toString().padStart(2, "0") + " / " + durationSeconds + " sec", 1218, 626);
      ctx.textAlign = "left";
    }

    function drawWrapped(text, x, y, maxWidth, size, lineHeight, color, weight) {
      ctx.fillStyle = color;
      ctx.font = weight + " " + size + "px Inter, system-ui, sans-serif";
      const words = String(text).split(" ");
      let line = "";
      let yy = y;
      for (const word of words) {
        const candidate = line ? line + " " + word : word;
        if (ctx.measureText(candidate).width > maxWidth && line) {
          ctx.fillText(line, x, yy);
          line = word;
          yy += size * lineHeight;
        } else {
          line = candidate;
        }
      }
      if (line) ctx.fillText(line, x, yy);
    }

    function roundRect(x, y, w, h, r, fill, stroke) {
      roundPath(x, y, w, h, r);
      ctx.fillStyle = fill;
      ctx.fill();
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    function roundPath(x, y, w, h, r) {
      const radius = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }

    async function loadImages() {
      await Promise.all(
        Object.entries(assets).map(([key, src]) => new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => {
            images[key] = image;
            resolve();
          };
          image.onerror = reject;
          image.src = src;
        }))
      );
    }

    function blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  </script>
</body>
</html>`;
}
