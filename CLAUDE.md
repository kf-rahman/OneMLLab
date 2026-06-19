# OneMLLab — personal site & blog

A personal site/diary. The public pages are static and hosted free on **GitHub
Pages** (`kf-rahman.github.io/OneMLLab`). Posts, login, and image storage are
handled by **Supabase** (a managed backend — no server code to deploy).

## Writing a post (the whole flow)
1. Go to **`/admin.html`** on the live site.
2. **Log in** (email + password — Supabase Auth).
3. Write in the split-pane Markdown editor. Add images by clicking 🖼, dragging, or
   pasting a screenshot — they upload to Supabase Storage and are inserted as
   Markdown image links.
4. Click **Publish**. The post is saved to the database and is live immediately —
   no build step, no commit, no waiting.
5. Edit or delete any post from the **Your posts** list at the bottom of `/admin`.

## How it fits together
- **GitHub Pages** serves the static files (`index.html`, `post.html`, `admin.html`,
  `assets/`). That's all that's hosted here.
- **Supabase** holds everything dynamic:
  - `posts` table — title, slug, excerpt, body (Markdown), date, author.
  - `post-images` storage bucket — uploaded images (public URLs).
  - Auth — email/password login.
  - Row Level Security — **anyone can read, only the owner can write** (restricted by
    email in the policies).
- `index.html` lists posts by querying Supabase (`assets/blog.js`).
- `post.html?slug=…` renders a single post: fetches it from Supabase and renders the
  Markdown body client-side with markdown-it.
- `admin.html` is the authoring app: Supabase login + create/edit/delete + image upload.

## Files
- `assets/config.js` — Supabase URL + anon key (the anon key is public by design;
  security comes from the RLS policies, not from hiding it).
- `assets/styles.css` — single theme (cream + forest). `.post-content` styles rendered posts.
- `assets/blog.js` — homepage post list.
- `SUPABASE_SETUP.sql` — one-time schema + storage + security setup (run in the
  Supabase SQL editor). The owner email is set here in the policies.
- `scripts/serve.mjs` — `npm run dev` static server for local preview.
- `blog/posts/diffusion-study-guide.md` — archived source of the original post (kept so
  it can be re-added through the editor; not used by the live site).

## Theme
Cream `#FFF6E6`, forest `#2F5D50`, soft green `#7FAE93`. CSS variables at the top of
`assets/styles.css`.
