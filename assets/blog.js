// Loads the blog list on the homepage from Supabase.
const sb = supabase.createClient(window.SUPA.url, window.SUPA.anonKey);

async function loadBlogPosts() {
  const list = document.getElementById("blog-list");
  if (!list) return;

  const { data, error } = await sb
    .from("posts")
    .select("slug,title,excerpt,post_date")
    .order("post_date", { ascending: false });

  if (error) {
    list.innerHTML = `<li class="list-item"><div class="meta">Could not load posts: ${escapeHtml(error.message)}</div></li>`;
    return;
  }
  if (!data.length) {
    list.innerHTML = `<li class="list-item"><div class="meta">No posts yet.</div></li>`;
    return;
  }

  list.innerHTML = data
    .map(
      (p) => `
      <li class="list-item">
        <div class="title-row">
          <a class="item-title" href="post.html?slug=${encodeURIComponent(p.slug)}">${escapeHtml(p.title || "Untitled")}</a>
          <span class="meta">${formatDate(p.post_date)}</span>
        </div>
        <div class="meta">${escapeHtml(p.excerpt || "")}</div>
      </li>`
    )
    .join("");
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

loadBlogPosts();
