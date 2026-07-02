import { resolveOutputDir } from "../src/final-submission-seal.mjs";
import {
  generateScenarioMatrix,
  summarizeScenarioMatrix,
  writeScenarioMatrix
} from "../src/scenario-matrix.mjs";

const outputDir = await resolveOutputDir(process.cwd());
const matrix = await generateScenarioMatrix();
await writeScenarioMatrix(matrix, outputDir);
console.log(JSON.stringify(summarizeScenarioMatrix(matrix), null, 2));
