import { watch } from "node:fs";
import { exec } from "node:child_process";
import path from "node:path";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "blog", "posts");

let building = false;
let pending = false;

function build() {
  if (building) {
    pending = true;
    return;
  }
  building = true;
  process.stdout.write("Building... ");
  exec("node scripts/build-blog.mjs", (err, _stdout, stderr) => {
    building = false;
    if (err) {
      console.error("failed.\n" + (stderr || err.message));
    } else {
      console.log("done.");
    }
    if (pending) {
      pending = false;
      build();
    }
  });
}

build();

console.log(`Watching blog/posts/ for changes. Press Ctrl+C to stop.\n`);

watch(POSTS_DIR, { recursive: true }, (_event, filename) => {
  if (filename?.endsWith(".md")) {
    console.log(`Changed: ${filename}`);
    build();
  }
});
