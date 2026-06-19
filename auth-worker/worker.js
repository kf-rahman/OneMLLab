/**
 * OneMLLab blog — GitHub OAuth helper.
 *
 * This is the only "backend" in the project. Its single job is the OAuth
 * handshake that browsers are not allowed to do themselves: swap the GitHub
 * login `code` for an access token. Everything else (hosting, committing,
 * building) stays on GitHub.
 *
 * Routes:
 *   GET /auth     -> redirect the user to GitHub's login/consent screen
 *   GET /callback -> exchange the returned code for a token, hand it back to
 *                    the opener window via postMessage, then close.
 *
 * Config (set with wrangler — see README.md):
 *   GITHUB_CLIENT_ID      (var)    OAuth App client id
 *   GITHUB_CLIENT_SECRET  (secret) OAuth App client secret
 *   ALLOWED_ORIGIN        (var)    your site origin, e.g. https://kf-rahman.github.io
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      const authorize = new URL("https://github.com/login/oauth/authorize");
      authorize.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      authorize.searchParams.set("redirect_uri", `${url.origin}/callback`);
      authorize.searchParams.set("scope", "repo");
      authorize.searchParams.set("state", crypto.randomUUID());
      return Response.redirect(authorize.toString(), 302);
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      let payload;
      try {
        if (!code) throw new Error("missing_code");
        const res = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
          }),
        });
        const data = await res.json();
        if (!data.access_token) throw new Error(data.error || "no_token");
        payload = { source: "oneml-oauth", token: data.access_token };
      } catch (err) {
        payload = { source: "oneml-oauth", error: String(err.message || err) };
      }

      const html = `<!doctype html><html><body>
<p>You can close this window.</p>
<script>
  (function () {
    var payload = ${JSON.stringify(payload)};
    if (window.opener) {
      window.opener.postMessage(payload, ${JSON.stringify(env.ALLOWED_ORIGIN)});
    }
    window.close();
  })();
</script>
</body></html>`;
      return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
    }

    return new Response("OneMLLab auth helper. Use /auth to sign in.", {
      headers: { "content-type": "text/plain" },
    });
  },
};
