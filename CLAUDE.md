# OneMLLab — personal site & blog

A static site hosted on GitHub Pages (`kf-rahman.github.io/OneMLLab`). The blog is
Markdown-sourced; HTML is generated from it.

## Two ways to write a post

### 1. From the browser (the no-friction path)
Open **`/admin.html`** on the live site, click **Sign in with GitHub**, write in the
split-pane editor, and hit **Publish**. The page builds the post HTML in the browser and
commits everything — the `.md` source, the generated `.html`, any images, and an updated
`blog/index.json` — in a single atomic commit via the GitHub Git Data API. The post is
live within seconds; no waiting on CI.

- **Auth:** "Sign in with GitHub" (OAuth). The token swap is handled by a tiny Cloudflare
  Worker in `auth-worker/` (the project's only backend — set up once, see its README).
  `admin.html`'s `AUTH_BASE` constant must point at the deployed worker URL. The resulting
  access token lives only in this browser's localStorage.
- Images: click **🖼 Image**, drag-drop onto the editor, or paste a screenshot. They're
  held locally and uploaded as part of the Publish commit. Referenced as
  `uploads/<id>-<name>` and stored at `blog/uploads/`.
- Drafts autosave to localStorage, so a refresh won't lose work.

### 2. From your editor (optional)
```bash
npm run new-post -- "My Post Title"   # scaffolds blog/posts/<date>-<slug>.md
npm run build:blog                     # regenerates HTML + index.json
npm run dev                            # local preview server
```
On push of any `blog/posts/**.md`, `.github/workflows/build.yml` runs the same build and
commits the result — a safety net that matches the browser build (so it's a no-op when a
post was published from `admin.html`).

## Layout
- `blog/posts/*.md` — source of truth. Front matter: `title`, `date`, `slug`, `excerpt`.
- `blog/<slug>.html` — generated per post (don't hand-edit; rebuild instead).
- `blog/index.json` — generated post list, read by `index.html`.
- `blog/uploads/` — post images.
- `assets/styles.css` — single theme (cream + forest). `.post-content` styles rendered posts.
- `scripts/build-blog.mjs` — the Markdown→HTML build. **The post-page template here is
  mirrored in `admin.html`'s `renderPostPage()`; keep the two in sync** so browser and CI
  builds produce identical output.

## Theme
Cream `#FFF6E6`, forest `#2F5D50`, soft green `#7FAE93`. Defined as CSS variables at the
top of `assets/styles.css`.
