async function loadBlogPosts() {
  const list = document.getElementById("blog-list");
  if (!list) return;

  try {
    const res = await fetch("blog/index.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Could not load blog/index.json");

    const posts = await res.json();
    posts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

    if (!posts.length) {
      list.innerHTML = `
        <li class="list-item">
          <div class="meta">No posts yet.</div>
        </li>
      `;
      return;
    }

    list.innerHTML = posts.map(p => `
      <li class="list-item">
        <div class="title-row">
          <a class="item-title" href="${escapeAttr(p.url)}">${escapeHtml(p.title || "Untitled")}</a>
          <span class="meta">${formatDate(p.date)}</span>
        </div>
        <div class="meta">${escapeHtml(p.excerpt || "")}</div>
      </li>
    `).join("");
  } catch (err) {
    list.innerHTML = `
      <li class="list-item">
        <div class="meta">
          Could not load posts. Run a local server (VS Code Live Server or <code>python3 -m http.server</code>)
          and ensure <code>blog/index.json</code> exists.
        </div>
      </li>
    `;
    console.error(err);
  }
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(s) {
  return String(s)
    .replaceAll("&", "%26")
    .replaceAll('"', "%22")
    .replaceAll("'", "%27")
    .replaceAll("<", "%3C")
    .replaceAll(">", "%3E");
}

loadBlogPosts();
