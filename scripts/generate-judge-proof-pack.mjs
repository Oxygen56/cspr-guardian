import {
  generateJudgeProofPack,
  summarizeJudgeProofPack,
  writeJudgeProofPack
} from "../src/judge-proof-pack.mjs";

const outputDir = process.env.PROOF_OUTPUT_DIR || "submission";
const fileBaseName = process.env.PROOF_FILE_BASE || "judge-proof-pack";
const assetId = process.env.PROOF_ASSET_ID || "invoice-usdc-7d";
const requestedAmountUsd = Number(process.env.PROOF_AMOUNT_USD || 250000);

const proofPack = await generateJudgeProofPack({ assetId, requestedAmountUsd });
await writeJudgeProofPack(proofPack, outputDir, { fileBaseName });

console.log(
  JSON.stringify(
    {
      ...summarizeJudgeProofPack(proofPack),
      outputDir,
      fileBaseName
    },
    null,
    2
  )
);
