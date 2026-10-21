import type { Dictionary, Locale } from "@/lib/i18n";
import { formatDate } from "@/lib/i18n";
import type { VerificationStatus } from "@/lib/data/types";
import { Icon } from "./Icon";

const STYLES: Record<VerificationStatus, string> = {
  verified: "bg-run-100 text-run-700",
  pending: "bg-go-100 text-go-700",
  unverified: "bg-slate-100 text-ink-soft",
  rejected: "bg-alert-100 text-alert-700",
};

export function VerificationBadge({ status, t }: { status: VerificationStatus; t: Dictionary }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${STYLES[status]}`}>
      {status === "verified" && <Icon name="check" className="h-3 w-3" />}
      {t.common[status]}
    </span>
  );
}

export function DemoBadge({ t }: { t: Dictionary }) {
  return (
    <span className="inline-flex rounded-full border border-dashed border-kneetie-500 bg-kneetie-50 px-2 py-0.5 text-xs font-bold tracking-wide text-kneetie-700">
      {t.common.demo}
    </span>
  );
}

export function DemoNotice({ t }: { t: Dictionary }) {
  return (
    <div role="note" className="flex gap-3 rounded-2xl border border-dashed border-kneetie-500 bg-kneetie-50 p-4 text-sm text-kneetie-700">
      <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0" />
      <p>{t.common.demoNotice}</p>
    </div>
  );
}

/** Renders a value, or an explicit "Not yet verified" label — never a blank or a guess. */
export function MissingValue({ value, t, children }: { value: unknown; t: Dictionary; children?: React.ReactNode }) {
  if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
    return <span className="italic text-ink-muted">{t.common.notVerified}</span>;
  }
  return <>{children ?? String(value)}</>;
}

export function ReviewedDate({ iso, lang, t }: { iso: string | null; lang: Locale; t: Dictionary }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
      <Icon name="clock" className="h-3.5 w-3.5" />
      {t.common.lastReviewed}: {iso ? formatDate(iso, lang) : t.common.neverReviewed}
    </span>
  );
}
