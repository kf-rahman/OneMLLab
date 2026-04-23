import http from "node:http";
import fs from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";

const ROOT = process.cwd();
const PORT = 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// ── helpers ──────────────────────────────────────────────────────────────────

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function send(res, status, contentType, body) {
  res.writeHead(status, { "Content-Type": contentType });
  res.end(body);
}

function serveStatic(res, filePath) {
  if (!existsSync(filePath)) {
    send(res, 404, "text/plain", "Not found");
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": mime });
  createReadStream(filePath).pipe(res);
}

function runBuild() {
  return new Promise((resolve, reject) => {
    exec("node scripts/build-blog.mjs", { cwd: ROOT }, (err, _out, stderr) => {
      if (err) reject(new Error(stderr || err.message));
      else resolve();
    });
  });
}

// ── admin page HTML ───────────────────────────────────────────────────────────

function adminPage() {
  const today = new Date().toISOString().slice(0, 10);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>New Post — Kazi Rahman</title>
  <link rel="stylesheet" href="/assets/styles.css" />
  <style>
    .field { margin-bottom: 20px; }
    label { display: block; font-size: 13px; font-weight: 600; color: var(--primary); margin-bottom: 6px; letter-spacing: 0.03em; text-transform: uppercase; }
    input, textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: #fff;
      color: var(--text);
      font-family: inherit;
      font-size: 15px;
      outline: none;
      transition: border-color 0.15s;
    }
    input:focus, textarea:focus { border-color: var(--accent); }
    textarea {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 14px;
      min-height: 420px;
      resize: vertical;
      line-height: 1.6;
    }
    .row { display: flex; gap: 16px; }
    .row .field { flex: 1; }
    .actions { display: flex; align-items: center; gap: 16px; margin-top: 8px; }
    button {
      padding: 10px 24px;
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    button:hover:not(:disabled) { opacity: 0.85; }
    #status { font-size: 14px; }
    #status.ok { color: var(--primary); }
    #status.err { color: #c0392b; }
  </style>
</head>
<body>
  <header>
    <div class="nav">
      <a class="brand" href="/">Kazi Rahman</a>
      <nav class="navlinks">
        <a href="/">Home</a>
        <a href="/admin" style="color:var(--primary);font-weight:600">New Post</a>
      </nav>
    </div>
  </header>

  <main>
    <h1>New Post</h1>

    <form id="form">
      <div class="row">
        <div class="field">
          <label for="title">Title</label>
          <input id="title" name="title" type="text" placeholder="What are you writing about?" required autofocus />
        </div>
        <div class="field" style="max-width:160px">
          <label for="date">Date</label>
          <input id="date" name="date" type="date" value="${today}" required />
        </div>
      </div>

      <div class="field">
        <label for="excerpt">Excerpt <span style="font-weight:400;text-transform:none;font-size:12px">(optional)</span></label>
        <input id="excerpt" name="excerpt" type="text" placeholder="One sentence summary shown in the post list" />
      </div>

      <div class="field">
        <label for="body">Content <span style="font-weight:400;text-transform:none;font-size:12px">(Markdown)</span></label>
        <textarea id="body" name="body" placeholder="Write your post in Markdown…"></textarea>
      </div>

      <div class="actions">
        <button type="submit" id="btn">Publish</button>
        <span id="status"></span>
      </div>
    </form>
  </main>

  <script>
    document.getElementById("form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("btn");
      const status = document.getElementById("status");
      btn.disabled = true;
      btn.textContent = "Publishing…";
      status.className = "";
      status.textContent = "";

      const payload = {
        title:   document.getElementById("title").value.trim(),
        date:    document.getElementById("date").value,
        excerpt: document.getElementById("excerpt").value.trim(),
        body:    document.getElementById("body").value,
      };

      try {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Unknown error");
        status.className = "ok";
        status.innerHTML = \`Published! <a href="/\${json.url}">\${payload.title}</a>\`;
        document.getElementById("form").reset();
        document.getElementById("date").value = new Date().toISOString().slice(0, 10);
      } catch (err) {
        status.className = "err";
        status.textContent = "Error: " + err.message;
      } finally {
        btn.disabled = false;
        btn.textContent = "Publish";
      }
    });
  </script>
</body>
</html>`;
}

// ── API: create post ──────────────────────────────────────────────────────────

async function handleCreatePost(req, res) {
  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch {
    send(res, 400, "application/json", JSON.stringify({ error: "Invalid JSON" }));
    return;
  }

  const { title, date, excerpt = "", body = "" } = payload;

  if (!title || !date) {
    send(res, 400, "application/json", JSON.stringify({ error: "title and date are required" }));
    return;
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const fileName = `${date}-${slug}.md`;
  const filePath = path.join(ROOT, "blog", "posts", fileName);

  const frontMatter = [
    "---",
    `title: ${title}`,
    `date: ${date}`,
    `slug: ${slug}`,
    excerpt ? `excerpt: ${excerpt}` : "excerpt:",
    "---",
    "",
    body,
  ].join("\n");

  try {
    await fs.writeFile(filePath, frontMatter, "utf8");
    await runBuild();
    const url = `blog/${slug}.html`;
    send(res, 200, "application/json", JSON.stringify({ ok: true, url }));
  } catch (err) {
    send(res, 500, "application/json", JSON.stringify({ error: err.message }));
  }
}

// ── router ────────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  if (req.method === "POST" && pathname === "/api/posts") {
    return handleCreatePost(req, res);
  }

  if (req.method !== "GET") {
    send(res, 405, "text/plain", "Method not allowed");
    return;
  }

  if (pathname === "/admin") {
    send(res, 200, "text/html; charset=utf-8", adminPage());
    return;
  }

  // Static files
  let filePath;
  if (pathname === "/" || pathname === "/index.html") {
    filePath = path.join(ROOT, "index.html");
  } else {
    filePath = path.join(ROOT, pathname.slice(1));
  }

  serveStatic(res, filePath);
});

server.listen(PORT, () => {
  console.log(`Running at http://localhost:${PORT}`);
  console.log(`Write posts at http://localhost:${PORT}/admin`);
});
