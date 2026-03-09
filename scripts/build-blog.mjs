import fs from "node:fs/promises";
import path from "node:path";
import MarkdownIt from "markdown-it";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "blog", "posts");
const BLOG_DIR = path.join(ROOT, "blog");
const INDEX_PATH = path.join(BLOG_DIR, "index.json");

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

const htmlFilesToIgnore = new Set(["index.json"]);

async function main() {
  await fs.mkdir(POSTS_DIR, { recursive: true });

  const entries = await fs.readdir(POSTS_DIR, { withFileTypes: true });
  const sourceFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort();

  const posts = [];

  for (const fileName of sourceFiles) {
    const sourcePath = path.join(POSTS_DIR, fileName);
    const raw = await fs.readFile(sourcePath, "utf8");
    const { meta, body } = parsePost(raw, fileName);
    const slug = meta.slug || path.basename(fileName, ".md");
    const outputPath = path.join(BLOG_DIR, `${slug}.html`);
    const articleHtml = md.render(body.trim());

    await fs.writeFile(
      outputPath,
      renderPostPage({
        title: meta.title,
        author: meta.author || "Kazi Rahman",
        date: formatDisplayDate(meta.date),
        bodyHtml: articleHtml,
      }),
      "utf8",
    );

    posts.push({
      title: meta.title,
      date: meta.date,
      excerpt: meta.excerpt || "",
      url: `blog/${slug}.html`,
    });
  }

  posts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  await fs.writeFile(INDEX_PATH, JSON.stringify(posts, null, 2) + "\n", "utf8");

  const generatedFiles = new Set(posts.map((post) => path.basename(post.url)));
  const blogEntries = await fs.readdir(BLOG_DIR, { withFileTypes: true });
  const staleHtml = blogEntries.filter(
    (entry) =>
      entry.isFile() &&
      entry.name.endsWith(".html") &&
      !generatedFiles.has(entry.name) &&
      !htmlFilesToIgnore.has(entry.name),
  );

  if (staleHtml.length) {
    console.warn(
      "Unmanaged blog HTML files remain:",
      staleHtml.map((entry) => entry.name).join(", "),
    );
  }
}

function parsePost(raw, fileName) {
  if (!raw.startsWith("---\n")) {
    throw new Error(`${fileName} is missing front matter`);
  }

  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) {
    throw new Error(`${fileName} has invalid front matter`);
  }

  const frontMatter = raw.slice(4, end).trim();
  const body = raw.slice(end + 5);
  const meta = {};

  for (const line of frontMatter.split("\n")) {
    if (!line.trim()) continue;
    const separator = line.indexOf(":");
    if (separator === -1) {
      throw new Error(`${fileName} has invalid front matter line: ${line}`);
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    meta[key] = stripQuotes(value);
  }

  for (const key of ["title", "date"]) {
    if (!meta[key]) {
      throw new Error(`${fileName} is missing required field: ${key}`);
    }
  }

  return { meta, body };
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function formatDisplayDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderPostPage({ title, author, date, bodyHtml }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="../assets/styles.css">
</head>
<body id="top">
  <header>
    <div class="nav">
      <a class="brand" href="../index.html">YOUR NAME</a>
      <nav class="navlinks" aria-label="Primary navigation">
        <a href="../index.html#about">About</a>
        <a href="../index.html#blog">Blog</a>
      </nav>
    </div>
  </header>

  <main>
    <h1>${escapeHtml(title)}</h1>
    <div class="byline">
      <span>By ${escapeHtml(author)}</span>
      <span class="dot"></span>
      <span>${escapeHtml(date)}</span>
    </div>

    <div class="post-content">
${indentHtml(bodyHtml.trim(), 6)}
    </div>

    <div class="bottom-controls">
      <a href="../index.html#blog">← Back to blog</a>
      <a href="#top">Back to top ↑</a>
    </div>
  </main>

  <footer>
    <div class="footer-inner">
      <div>YOUR NAME © 2025</div>
      <div class="footer-links">
        <a href="#">Terms of Service</a>
        <a href="#">Privacy Notice</a>
      </div>
    </div>
  </footer>
</body>
</html>
`;
}

function indentHtml(html, spaces) {
  const padding = " ".repeat(spaces);
  return html
    .split("\n")
    .map((line) => `${padding}${line}`)
    .join("\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
