"""Six-month retention for website enquiries (privacy policy, POL-010 v1.1).

Policy wording (owner-approved 2026-10-19): "Enquiries from families who do not
enrol are deleted six months after they are received."

SAFE BY DEFAULT — nothing here deletes anything unless ALL of these hold:
  * the caller asks for a real run (dry_run=False),
  * RETENTION_DELETE_ENABLED=true is set in the environment,
  * the record's status is in RETENTION_ELIGIBLE_STATUSES (default: only an
    explicit "not_enrolling"/"closed" marking — today every record is "new",
    so nothing qualifies until the owner decides how non-enrolment is recorded),
  * the run would delete no more than RETENTION_MAX_DELETE records.

Nothing schedules this module; see docs/RETENTION_DESIGN.md for the plan.
Logs and the audit record contain counts and record ids only, never personal data.
"""
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List, Optional

logger = logging.getLogger(__name__)

# Website enquiry forms covered by the retention sentence. The newsletter has
# its own retention rule (kept while subscribed) and is deliberately excluded.
ENQUIRY_COLLECTIONS = ("admissions", "enrollment", "inquiry")

# Statuses that are never deleted, whatever the configuration.
PROTECTED_STATUSES = frozenset({"enrolled", "retain", "legal_hold"})

# The approved wording starts the clock when an enquiry is "received". The
# owner has not yet confirmed this (see docs/OWNER_CONFIRMATIONS.md), so the
# clock field is explicit and only "created_at" (= received) is supported.
SUPPORTED_CLOCK_FIELDS = ("created_at",)


def _env_flag(name: str, default: bool = False) -> bool:
    return os.environ.get(name, str(default)).strip().lower() in ("1", "true", "yes")


def settings() -> Dict[str, Any]:
    eligible = os.environ.get("RETENTION_ELIGIBLE_STATUSES", "not_enrolling,closed")
    return {
        "months": int(os.environ.get("RETENTION_MONTHS", "6")),
        "clock_field": os.environ.get("RETENTION_CLOCK_FIELD", "created_at"),
        "eligible_statuses": frozenset(s.strip() for s in eligible.split(",") if s.strip()) - PROTECTED_STATUSES,
        "delete_enabled": _env_flag("RETENTION_DELETE_ENABLED"),
        "max_delete": int(os.environ.get("RETENTION_MAX_DELETE", "200")),
    }


def months_before(moment: datetime, months: int) -> datetime:
    """Calendar-aware subtraction (31 Aug minus 6 months -> 28/29 Feb)."""
    year, month = moment.year, moment.month - months
    while month <= 0:
        month += 12
        year -= 1
    days_in_month = [31, 29 if (year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)) else 28,
                     31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]
    return moment.replace(year=year, month=month, day=min(moment.day, days_in_month))


def _parse_time(value: Any) -> Optional[datetime]:
    if isinstance(value, datetime):
        parsed = value
    elif isinstance(value, str):
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    else:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


async def plan(db: Any, now: Optional[datetime] = None, collections: Iterable[str] = ENQUIRY_COLLECTIONS,
               config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Classify every enquiry record. Read-only."""
    cfg = config or settings()
    if cfg["clock_field"] not in SUPPORTED_CLOCK_FIELDS:
        raise ValueError(f"Unsupported retention clock field: {cfg['clock_field']}")
    now = now or datetime.now(timezone.utc)
    cutoff = months_before(now, cfg["months"])
    result: Dict[str, Any] = {"cutoff": cutoff.isoformat(), "months": cfg["months"], "collections": {}}
    for name in collections:
        rows = await getattr(db, name).find({}, {"_id": 0}).to_list(100000)
        summary = {"total": len(rows), "eligible": [], "protected": 0, "younger_than_cutoff": 0,
                   "not_marked_non_enrolling": 0, "unreadable_date": 0, "by_status": {}}
        for row in rows:
            status = str(row.get("status") or "new")
            summary["by_status"][status] = summary["by_status"].get(status, 0) + 1
            received = _parse_time(row.get(cfg["clock_field"]))
            if status in PROTECTED_STATUSES or row.get("retention_hold"):
                summary["protected"] += 1
            elif received is None:
                summary["unreadable_date"] += 1  # never guess: skip and report
            elif received >= cutoff:
                summary["younger_than_cutoff"] += 1
            elif status not in cfg["eligible_statuses"]:
                summary["not_marked_non_enrolling"] += 1
            elif row.get("id"):
                summary["eligible"].append(row["id"])
        result["collections"][name] = summary
    result["eligible_total"] = sum(len(c["eligible"]) for c in result["collections"].values())
    return result


async def run(db: Any, dry_run: bool = True, now: Optional[datetime] = None,
              config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Plan, then delete only if every safeguard allows it. Always records an audit entry."""
    cfg = config or settings()
    report = await plan(db, now=now, config=cfg)
    report.update(run_id=str(uuid.uuid4()), dry_run=dry_run, deleted={}, outcome="dry_run")

    if not dry_run:
        if not cfg["delete_enabled"]:
            report["outcome"] = "blocked_delete_disabled"
        elif report["eligible_total"] > cfg["max_delete"]:
            report["outcome"] = "blocked_over_limit"
        else:
            for name, summary in report["collections"].items():
                ids: List[str] = summary["eligible"]
                if ids:
                    result = await getattr(db, name).delete_many({"id": {"$in": ids}})
                    report["deleted"][name] = getattr(result, "deleted_count", 0)
            report["outcome"] = "deleted"

    audit = {
        "run_id": report["run_id"],
        "at": (now or datetime.now(timezone.utc)).isoformat(),
        "dry_run": dry_run,
        "outcome": report["outcome"],
        "cutoff": report["cutoff"],
        "months": report["months"],
        "eligible_ids": {n: s["eligible"] for n, s in report["collections"].items()},
        "deleted": report["deleted"],
    }
    await db.retention_runs.insert_one(audit)
    logger.info(
        "Retention run %s: outcome=%s dry_run=%s eligible=%s deleted=%s",
        report["run_id"], report["outcome"], dry_run, report["eligible_total"], report["deleted"],
    )
    return report
