"""Daily enquiry summary for nursery management (DEVELOPMENT ONLY: not scheduled, not sent).

Builds the subject, plain-text and HTML body of a once-a-day summary from
enquiry records. Nothing here sends email or is wired to a scheduler; see
docs/ENQUIRY_DIGEST_PROPOSAL.md for the approval steps.

Privacy by design: the summary carries reference ids, categories, times,
program and child age band, and the parent's FIRST NAME only. It never
includes email addresses, phone numbers, child names or message text; staff
open the full record via its reference id (notification email or admin export).
"""
import html
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Iterable, List, Optional

try:
    from zoneinfo import ZoneInfo

    LOCAL_TZ = ZoneInfo("Atlantic/Bermuda")
except Exception:  # pragma: no cover - tzdata missing; fall back to UTC labels
    LOCAL_TZ = timezone.utc

CATEGORIES = (
    ("admissions", "Admissions requests"),
    ("enrollment", "Program enquiries"),
    ("inquiry", "General enquiries"),
)
# The website promises a reply "within one business day"; the summary flags
# anything still 'new' after 24 hours (weekends are not excluded).
FOLLOW_UP_AFTER = timedelta(days=1)


def _when(value: Any) -> Optional[datetime]:
    if isinstance(value, datetime):
        moment = value
    elif isinstance(value, str):
        try:
            moment = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    else:
        return None
    return moment if moment.tzinfo else moment.replace(tzinfo=timezone.utc)


def _first_name(full_name: Any) -> str:
    parts = str(full_name or "").strip().split()
    return parts[0] if parts else "(no name)"


def _line(category: str, row: Dict[str, Any]) -> Dict[str, str]:
    received = _when(row.get("created_at"))
    return {
        "sort": received.isoformat() if received else "",
        "ref": str(row.get("id", ""))[:8],
        "received": received.astimezone(LOCAL_TZ).strftime("%a %d %b %H:%M") if received else "unknown time",
        "first_name": _first_name(row.get("parent_name")),
        "category": category,
        "program": str(row.get("program") or "—"),
        "child_age": str(row.get("child_age") or "—"),
        "contact": str(row.get("contact_method") or row.get("connect") or "email")[:40],
        "has_message": "yes" if (row.get("message") or row.get("child_focus")) else "no",
    }


def build_digest(
    records: Dict[str, Iterable[Dict[str, Any]]],
    now: datetime,
    since: datetime,
    newsletter: Iterable[Dict[str, Any]] = (),
    alerts: Iterable[str] = (),
) -> Dict[str, Any]:
    """Return {"subject", "text", "html", "counts"} for enquiries received in [since, now)."""
    new: List[Dict[str, str]] = []
    outstanding: List[Dict[str, str]] = []
    unanswered_messages = 0
    status_tracking_used = False
    counts: Dict[str, int] = {}

    for key, label in CATEGORIES:
        rows = list(records.get(key, ()))
        counts[key] = 0
        for row in rows:
            status = str(row.get("status") or "new")
            status_tracking_used |= status != "new"
            received = _when(row.get("created_at"))
            if received and since <= received < now:
                counts[key] += 1
                new.append(_line(label, row))
            if status == "new" and received and received <= now - FOLLOW_UP_AFTER:
                outstanding.append(_line(label, row))
                if row.get("message") or row.get("child_focus"):
                    unanswered_messages += 1

    newsletter_rows = list(newsletter)
    new_signups = sum(1 for r in newsletter_rows if (_when(r.get("created_at")) or since) >= since)
    pending_sync = sum(1 for r in newsletter_rows if r.get("status") == "pending")
    alert_lines = list(alerts)
    if pending_sync:
        alert_lines.append(f"{pending_sync} newsletter sign-up(s) are waiting to be added to the Google Group.")
    if not status_tracking_used:
        alert_lines.append(
            "Follow-up tracking is not switched on yet: every enquiry still shows as 'new', so the "
            "outstanding list below includes enquiries you may already have answered."
        )

    new.sort(key=lambda l: l["sort"])
    outstanding.sort(key=lambda l: l["sort"])
    total_new = len(new)
    day = now.astimezone(LOCAL_TZ).strftime("%a %d %b %Y")
    subject = f"Tiny Explorers: {total_new} new {'enquiry' if total_new == 1 else 'enquiries'} ({day})"

    text = [subject, "", "NEW SINCE YESTERDAY'S SUMMARY"]
    for key, label in CATEGORIES:
        text.append(f"  {label:<24}{counts[key]}")
    text.append(f"  {'Newsletter sign-ups':<24}{new_signups} (count only)")
    text += ["", "TOUR BOOKINGS", "  Tours are booked in Google Calendar; check the calendar for today's visits."]
    if new:
        text += ["", "NEW ENQUIRIES (first name only; open the full record by reference)"]
        text += [f"  {l['received']}  {l['category']}  ref {l['ref']}  {l['first_name']}  program: {l['program']}  "
                 f"child: {l['child_age']}  prefers: {l['contact']}  message: {l['has_message']}" for l in new]
    else:
        text += ["", "No new enquiries since the last summary."]
    text += ["", f"OUTSTANDING FOLLOW-UPS (received over 24 hours ago, still 'new'): {len(outstanding)}"]
    text += [f"  {l['received']}  {l['category']}  ref {l['ref']}  {l['first_name']}" for l in outstanding[:20]]
    if len(outstanding) > 20:
        text.append(f"  … and {len(outstanding) - 20} more")
    text.append(f"UNANSWERED MESSAGES (outstanding enquiries that include a message): {unanswered_messages}")
    if alert_lines:
        text += ["", "ALERTS"] + [f"  • {a}" for a in alert_lines]
    text += ["", "This summary deliberately leaves out email addresses, phone numbers, child names and messages.",
             "Find full details in the individual notification emails, matched by reference."]

    def rows_html(lines: List[Dict[str, str]], cols: List[str]) -> str:
        head = "".join(f"<th style='text-align:left;padding:6px 8px;border-bottom:1px solid #ddd'>{c}</th>" for c in cols)
        body = "".join(
            "<tr>" + "".join(f"<td style='padding:6px 8px;border-bottom:1px solid #eee'>{html.escape(l[k])}</td>"
                             for k in ("received", "category", "ref", "first_name", "program", "child_age", "contact", "has_message")[:len(cols)]) + "</tr>"
            for l in lines)
        return f"<table style='border-collapse:collapse;font-size:13px'>{'<tr>' + head + '</tr>'}{body}</table>"

    counts_html = "".join(f"<tr><td style='padding:3px 16px 3px 0'>{label}</td><td><b>{counts[key]}</b></td></tr>" for key, label in CATEGORIES)
    counts_html += f"<tr><td style='padding:3px 16px 3px 0'>Newsletter sign-ups</td><td><b>{new_signups}</b> (count only)</td></tr>"
    html_body = f"""<div style="font-family:Arial,sans-serif;color:#1F1F1F;max-width:720px">
<h2 style="font-family:Georgia,serif;font-weight:400">{html.escape(subject)}</h2>
<table>{counts_html}</table>
<p><b>Tour bookings:</b> tours are booked in Google Calendar. Check the calendar for today's visits.</p>
<h3>New enquiries</h3>{rows_html(new, ['Received', 'Type', 'Ref', 'First name', 'Program', 'Child age', 'Prefers', 'Message']) if new else '<p>No new enquiries since the last summary.</p>'}
<h3>Outstanding follow-ups ({len(outstanding)})</h3>{rows_html(outstanding[:20], ['Received', 'Type', 'Ref', 'First name']) if outstanding else '<p>None.</p>'}
<p><b>Unanswered messages:</b> {unanswered_messages}</p>
{('<h3>Alerts</h3><ul>' + ''.join(f'<li>{html.escape(a)}</li>' for a in alert_lines) + '</ul>') if alert_lines else ''}
<p style="color:#6f6a64;font-size:12px">This summary deliberately leaves out email addresses, phone numbers, child names and messages. Find full details in the individual notification emails, matched by reference.</p>
</div>"""
    return {"subject": subject, "text": "\n".join(text), "html": html_body,
            "counts": dict(counts, newsletter=new_signups, outstanding=len(outstanding), unanswered_messages=unanswered_messages)}
