# Auth helper setup (one time)

This little Cloudflare Worker lets `/admin` use a **"Sign in with GitHub"** button
instead of a token. You set it up once and never touch it again. Free.

There are exactly three things only *you* can do (they need your GitHub / Cloudflare
login). Each is copy-paste. ~10 minutes total.

---

## 1. Deploy the worker (gets you its URL)

From this `auth-worker/` folder:

```bash
npx wrangler login        # opens browser, log into (or create) a free Cloudflare account
npx wrangler deploy       # deploys; prints a URL like https://oneml-blog-auth.<you>.workers.dev
```

**Copy that URL.** Call it `WORKER_URL` below.

---

## 2. Create the GitHub OAuth App

Open https://github.com/settings/applications/new and fill in:

| Field | Value |
|---|---|
| Application name | `OneMLLab blog` |
| Homepage URL | `https://kf-rahman.github.io/OneMLLab/` |
| Authorization callback URL | `WORKER_URL/callback`  ← the worker URL from step 1, plus `/callback` |

Click **Register application**. You'll see a **Client ID**. Click **Generate a new
client secret** and copy the **secret** too.

---

## 3. Give the worker its credentials, then redeploy

In `wrangler.toml`, set `GITHUB_CLIENT_ID` to your Client ID. Then:

```bash
npx wrangler secret put GITHUB_CLIENT_SECRET   # paste the client secret when prompted
npx wrangler deploy
```

---

## 4. Point the site at the worker

In `../admin.html`, set the one config line near the top of the script:

```js
const AUTH_BASE = "WORKER_URL";   // <- your worker URL from step 1 (no trailing slash)
```

Commit and push. Done — go to `/admin`, click **Sign in with GitHub**, and write.

---

### Notes
- `ALLOWED_ORIGIN` in `wrangler.toml` is already `https://kf-rahman.github.io` (your
  Pages origin). Only that origin can receive the login result.
- To rotate access later: regenerate the client secret on GitHub and rerun
  `wrangler secret put GITHUB_CLIENT_SECRET && wrangler deploy`.
