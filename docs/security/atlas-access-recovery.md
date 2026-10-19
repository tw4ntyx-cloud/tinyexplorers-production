# Regaining MongoDB Atlas access (credential rotation C1 blocked)

_Opened 2026-10-19. **Status: CRITICAL, outstanding.** The possibly leaked database password cannot be rotated until someone with Atlas access signs in._

## Situation

- The owner normally signs in to Atlas with **"Sign in with GitHub"**. It fails repeatedly, including in a private Safari window. The GitHub email is verified.
- Cloud Run is accessible and reads `MONGO_URL` from Secret Manager `mongo_url:latest`.
- Rotation needs Atlas, to create a new database user and remove the old one. Nothing in Google Cloud can do it.

**Rules for recovery:** no secret values are read, copied, displayed or changed. No production settings change. Everything below is either sign-in troubleshooting or a read-only check.

## 1. Find out which identity owns the Atlas account (read-only)

Atlas accounts are tied to an **email address**. "Sign in with GitHub" only works if it resolves to the same email the Atlas account was created with.

1. Search your mailboxes for messages from MongoDB / MongoDB Atlas: welcome email, cluster alerts, invoices, invitations. The address they were sent to is the Atlas login email, and they often name the organization and project.
2. Note every email address that has been used for this project. The GitHub account's addresses (Settings → Emails, including the private `@users.noreply.github.com` address) and the address on the earliest commits in this repository can all be candidates.
3. On GitHub → Settings → Applications → **Authorized OAuth Apps**: is a MongoDB app listed? Its presence and last-used date show whether GitHub sign-in to Atlas ever succeeded from this GitHub account.

## 2. Sign-in troubleshooting (no account changes)

Try these in order; stop when one works.

1. **Different browser.** Try Chrome or Firefox with extensions disabled. Safari's tracking prevention and content blockers can break the cross-site redirect that "Sign in with GitHub" uses, even in a private window.
2. **Sign out of GitHub first,** then sign in to GitHub directly. Then use "Sign in with GitHub" on the Atlas login page. This rules out a different GitHub account being signed in.
3. **Use the email route** on the Atlas login page with the email found in step 1, and use its **"Forgot password"** link. If the account was created through GitHub it may have no password. In that case MongoDB's login help (linked from the sign-in page) is the next step. This step creates no password for anything production uses; it only concerns your own login.
4. **Check MFA.** If the account has multi-factor authentication enabled, check that you still have the authenticator or backup codes.

## 3. Other people with access

- If anyone else was ever invited to the Atlas organization or project (a previous developer, an agency, a co-owner), an **Organization Owner** among them can sign in and do the rotation, or invite your current email as an owner.
- The original developer may also hold the Atlas login. The early commits in this repository are by a different author name from later ones.

## 4. MongoDB support

If you can't get in and nobody else has access, contact MongoDB support through the help or support links on the Atlas sign-in page. Explain that you own the organization but cannot sign in.
- Be ready to prove ownership: the billing email, last invoice details, organization or project name, cluster name (likely `tiny-explorers-newsletter`).
- **Never send a database password or connection string to support.** They do not need it.

## 5. Safe checks while access is blocked (metadata only, no secret values)

| Check | Where | What it tells us |
|---|---|---|
| Creation date of each version of `mongo_url` | Secret Manager → `mongo_url` → **Versions** tab (dates are shown without revealing the value) | If the current version was created **after 2026-08-28** (the leak commit), the database password may already have been changed since the leak. If on or before, assume the leaked password is live. |
| Cloud Run logs for MongoDB errors | Cloud Run → Logs, filter `MongoDB` | Confirms the API is still connecting normally (no lockouts) |
| GitHub secret scanning alerts | Repo → Security → Secret scanning (enable it first: free for public repos) | Whether GitHub also flagged the string |

## 6. Interim risk reduction (each needs your decision)

None of these replaces rotation.

| Option | Effect | Trade-off |
|---|---|---|
| **Make the repository private** | Stops new people finding the old commit | Anyone who already copied it keeps it. **The GitHub Pages preview stops working** on a free plan (Pages from private repos needs a paid plan). |
| **Do nothing until Atlas access is back** | No disruption | The possibly valid credential stays public |
| Rewrite git history | Removes the string from GitHub's current history | **Not recommended:** forks and caches keep copies, it needs a force-push, and rotation is still required. Not authorised. |

**Recommendation:** pursue sections 1–3 today, since recovery usually comes down to finding the right email address. Run the section 5 metadata check to judge urgency. Decide on making the repo private only if recovery takes more than a few days.

## When access is restored

Continue the runbook at Step 1a in `2026-10-mongodb-credential-exposure.md`, using the new secret `mongo_url_2026_10`. **Do not** add versions to `mongo_url`.
