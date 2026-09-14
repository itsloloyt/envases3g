import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const files = [];
const include = ["src", "public", "supabase", ".github", "scripts"];
const rootFiles = [
  "package.json",
  "pnpm-lock.yaml",
  "next.config.ts",
  "next-env.d.ts",
  "tsconfig.json",
  ".gitignore",
  ".env.example",
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
];
function add(file) {
  const bin = /\.(jpg|jpeg|png|woff2|ico|webp)$/.test(file);
  files.push({
    file: file.replaceAll("\\", "/"),
    data: fs.readFileSync(path.join(root, file), bin ? "base64" : "utf8"),
    encoding: bin ? "base64" : "utf-8",
  });
}
function walk(dir) {
  for (const name of fs.readdirSync(path.join(root, dir))) {
    const f = path.join(dir, name);
    if (fs.statSync(path.join(root, f)).isDirectory()) walk(f);
    else add(f);
  }
}
include.forEach(walk);
rootFiles.filter((f) => fs.existsSync(f)).forEach(add);
fs.writeFileSync("research/deploy-files.json", JSON.stringify(files));
console.log(`${files.length} files packaged`);
