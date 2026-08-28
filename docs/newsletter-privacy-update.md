# Newsletter privacy policy update

**DRAFT — REQUIRES HUMAN APPROVAL**

This is a proposed addition to `docs/policies/privacy-confidentiality-policy.md`
covering the newsletter signup feature. It is **not** legal advice and has
**not** been applied to the approved policy — a human (ideally with legal
review) should adapt the wording and merge it into the actual policy
document.

---

## Proposed section: "Newsletter Sign-Up"

> **What we collect:** If you subscribe to Tiny Explorers updates using the
> newsletter form on our website, we collect only the email address you
> provide. We do not require or collect your name, phone number, or any
> other personal information to subscribe.
>
> **Why we collect it:** Your email address is used solely to send you Tiny
> Explorers newsletter content (open house dates, parenting essays,
> community updates) that you have opted in to receive.
>
> **Where it is stored:** Subscription requests are stored securely in our
> database. Access is restricted to authorized Tiny Explorers staff and is
> never publicly viewable or searchable.
>
> **Google Workspace processing:** To deliver the newsletter, approved
> subscriber email addresses are added to our internal "Tiny Explorers
> Newsletter" Google Group (`newsletter@tinyexplorersbda.com`), managed
> through Google Workspace. Google processes this data as our service
> provider, under Google Workspace's own data processing terms.
>
> **Withdrawing consent / unsubscribing:** You may ask to be removed from
> the newsletter at any time by contacting us at [hello@tinyexplorers.bm /
> equivalent contact address — confirm final contact email]. Once we
> process your request, your email address will be marked unsubscribed in
> our records and removed from the Google Group, and you will not receive
> further newsletter emails.
>
> **Retention:** We retain newsletter subscription records for as long as
> you remain subscribed. If you unsubscribe, we retain a minimal record
> (email address and unsubscribed status) only as needed to ensure we do
> not re-add you in error; you may request full deletion of this record by
> contacting us.
>
> **No sale or public disclosure:** We do not sell, rent, or publicly
> disclose newsletter subscriber email addresses, and we do not provide any
> way for one subscriber to view another subscriber's information.

---

## Open questions for whoever approves this

1. What is the correct public-facing contact address for unsubscribe /
   privacy requests? (`hello@tinyexplorers.bm` appears elsewhere on the
   site — confirm this is the right one to publish for this purpose.)
2. Does Tiny Explorers Bermuda Ltd. want to state a specific retention
   period (e.g. "deleted after 24 months of inactivity") rather than
   indefinite retention while subscribed?
3. Should this reference Google Workspace/Google by name in the public
   policy, or use generic language like "a trusted email service provider"?
4. Confirm whether this section should live inside the existing
   `privacy-confidentiality-policy.md` or as its own linked policy — the
   existing document currently has no mention of newsletter/email
   collection at all.

Until this is approved and merged, the live privacy policy does not
describe the newsletter feature. Please prioritize reviewing this before
enabling Google Workspace automation in production, since automation means
subscriber data will actually leave our database and enter a third-party
system (Google Workspace).
