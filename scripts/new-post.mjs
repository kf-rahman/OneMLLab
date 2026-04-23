import fs from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "blog", "posts");

const title = process.argv.slice(2).join(" ").trim();
if (!title) {
  console.error('Usage: npm run new-post -- "My Post Title"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const today = new Date().toISOString().slice(0, 10);
const fileName = `${today}-${slug}.md`;
const filePath = path.join(POSTS_DIR, fileName);

const template = `---
title: ${title}
date: ${today}
slug: ${slug}
excerpt:
---

Write your post here.
`;

await fs.mkdir(POSTS_DIR, { recursive: true });

try {
  await fs.access(filePath);
  console.error(`Post already exists: ${filePath}`);
  process.exit(1);
} catch {
  // file doesn't exist, good to create
}

await fs.writeFile(filePath, template, "utf8");
console.log(`Created: blog/posts/${fileName}`);

const editor = process.env.EDITOR || process.env.VISUAL || "code";
try {
  execSync(`${editor} "${filePath}"`, { stdio: "inherit" });
} catch {
  console.log(`Open manually: ${filePath}`);
}
