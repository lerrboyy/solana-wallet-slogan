// One-Line Slogan for a Solana Wallet Agent
// Writes the chosen slogan to /output/entry.txt and re-verifies the gate:
// one line, at most 20 words, 1-140 UTF-8 characters, not only whitespace.
import { mkdirSync, readdirSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const SLOGAN = "One wallet, one agent, zero waiting: Solana at the speed of a sentence.";

const outDir = process.env.OUTPUT_DIR ?? "/output";
const outFile = join(outDir, "entry.txt");

function gateCheck(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 140) throw new Error(`gate: ${chars} chars, must be 1-140`);
  if (text.trim().length === 0) throw new Error("gate: entry is only whitespace");
  const lines = text.split("\n");
  if (lines.length !== 1) throw new Error(`gate: ${lines.length} lines, must be exactly 1`);
  const words = text.trim().split(/\s+/).length;
  if (words > 20) throw new Error(`gate: ${words} words, max 20`);
  const bytes = Buffer.byteLength(text, "utf8");
  if (bytes > 140) throw new Error(`gate: ${bytes} bytes, must fit 140 chars`);
  if (text !== text.trim()) throw new Error("gate: leading/trailing whitespace");
}

function main(): void {
  gateCheck(SLOGAN);
  mkdirSync(outDir, { recursive: true });
  // Clear only the CONTENTS of the output dir; never remove the dir itself.
  for (const name of readdirSync(outDir)) {
    rmSync(join(outDir, name), { recursive: true, force: true });
  }
  writeFileSync(outFile, SLOGAN, "utf8");
  const back = readFileSync(outFile, "utf8");
  if (back !== SLOGAN) throw new Error("read-back mismatch");
  gateCheck(back);
  if (!existsSync(outDir)) throw new Error("output dir missing after write");
  const leftovers = readdirSync(outDir);
  if (leftovers.length !== 1 || leftovers[0] !== "entry.txt") {
    throw new Error(`unexpected files in output dir: ${leftovers.join(", ")}`);
  }
  const bytes = Buffer.byteLength(back, "utf8");
  const hash = createHash("sha256").update(back, "utf8").digest("hex");
  console.log(`wrote ${outFile}: ${bytes} bytes, ${[...back].length} chars, ${back.trim().split(/\s+/).length} words, sha256 ${hash}`);
  console.log(back);
}

main();
