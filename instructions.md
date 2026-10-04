# Nitter

## Before You Start: You Need an X Account

X removed all anonymous access, so **every Nitter instance needs session cookies from a real, logged-in X account**. Nitter uses that account behind the scenes to fetch data.

> **Use a burner account.** X may restrict or suspend accounts used for scraping. Do not use an account you care about. A fresh account works fine — it does not need followers or a verified phone number (email is usually enough).

## Documentation

- [Nitter on GitHub](https://github.com/zedeus/nitter) — the upstream project's README and documentation.

## Getting Set Up

### 1. Get your session cookies

1. In a desktop browser, log in to <https://x.com> with your (burner) account.
2. Open the browser's developer tools (`F12`) and find the cookies for `x.com`:
   - **Firefox:** Storage tab → Cookies → `https://x.com`
   - **Chrome/Brave:** Application tab → Cookies → `https://x.com`
3. Copy the values of these two cookies:
   - `auth_token`
   - `ct0`

Keep the browser session logged in — logging out invalidates the cookies.

### 2. Add the session to Nitter

1. Go to Nitter's **Actions** tab in StartOS.
2. Run **Add X Account Session** and paste the two cookie values. The username field is optional and only labels the session.
3. Start the service (or it restarts automatically if already running).

You can add multiple sessions from different accounts — Nitter spreads requests across them, which helps avoid rate limits.

### 3. Open the web UI

Open the **Web UI** from Nitter's Dashboard tab. Search for any account (e.g. `elonmusk`) to confirm data loads.

## RSS Feeds

Every profile, search, and list has an RSS feed — append `/rss` to the URL (e.g. `/<username>/rss`). Feed links are generated from your **primary URL**; change it with the **Set Primary URL** action if you access Nitter from a different address (e.g. Tor).

## Optional: Basic Auth

By default your Nitter instance is open to anyone who can reach it (LAN, Tor, or a custom domain). To require a login:

1. Run the **Configure Basic Auth** action (an install task also prompts you to decide).
2. Switch the toggle on and submit. The credentials are displayed — username `admin`, with a generated password. Save them.
3. The service restarts, and browsers will prompt for the credentials.

Notes:

- **RSS readers need the credentials too** — most support Basic Auth natively or via `https://username:password@your-address/...` URLs.
- Re-running the action with the toggle on shows the same credentials again; turning it off keeps them stored, so re-enabling restores the same login.
- Use **Reset Basic Auth Password** to rotate the password (only visible while Basic Auth is on).

## Display Preferences

Theme, media, and layout preferences live on Nitter's own `/settings` page (the gear icon). They are stored per-browser in cookies, not on the server.

## Troubleshooting

- **Pages show errors or "no sessions" messages:** your session was likely invalidated (logged out, password change, or X-side restriction). Run **Remove X Account Sessions**, then **Add X Account Session** with fresh cookies.
- **Rate limit errors:** add one or more additional sessions from other accounts.
- **The service won't start after install:** complete the required **Add X Account Session** task first.
