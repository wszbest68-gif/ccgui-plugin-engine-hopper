#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const files = ["main.js", "manifest.json", "styles.css"].filter(existsSync);
if (!files.includes("main.js") || !files.includes("manifest.json")) {
  console.error("缺少 main.js 或 manifest.json");
  process.exit(1);
}
const output = files.map((file) => `${createHash("sha256").update(readFileSync(file)).digest("hex")}  ${file}`).join("\n") + "\n";
writeFileSync("checksums.txt", output);
console.log(output.trim());
