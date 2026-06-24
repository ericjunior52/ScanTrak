import { useEffect, useRef } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Info,
  PlayCircle,
  ScrollText,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

/* ----------------------------------------------------------------
 * Live Audit Log panel
 * ----------------------------------------------------------------
 * Pinned to the bottom of the dashboard scrollable column. Streams
 * newest entries at the top with an auto-scroll on insert.
 *
 * Visual rules:
 *   - Header: "Live Audit Log · {n}/100" + pulsing green dot.
 *   - Each row: monospace timestamp [HH:MM:SS AM/PM] <TYPE>: <message>.
 *   - Left border color = severity:
 *       INFO    -> slate
 *       SUCCESS -> emerald
 *       WARN    -> amber
 *       ACTION  -> sky
 *   - No edit/delete affordances. (Deliberately read-only — the demo
 *     is more impressive when the log accumulates.)
 *
 * The component does NOT mutate state. It receives `entries` from
 * the parent (Dashboard) which gets them from the App-level reducer.
 * Auto-scroll is implemented via a ref + scrollTop = 0 when a new
 * entry appears.
 * ---------------------------------------------------------------- */

// Severity → Tailwind classes (border + soft background tint + text).
const SEVERITY_STYLES = {
  INFO: {
    border: 'border-l-slate-400',
    bg: 'bg-slate-50/60',
    text: 'text-slate-700',
    chip: 'bg-slate-100 text-slate-700 ring-slate-200',
    Icon: Info,
  },
  SUCCESS: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-50/60',
    text: 'text-emerald-900',
    chip: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    Icon: CheckCircle2,
  },
  WARN: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-50/60',
    text: 'text-amber-900',
    chip: 'bg-amber-100 text-amber-800 ring-amber-200',
    Icon: AlertTriangle,
  },
  ACTION: {
    border: 'border-l-sky-500',
    bg: 'bg-sky-50/60',
    text: 'text-sky-900',
    chip: 'bg-sky-100 text-sky-800 ring-sky-200',
    Icon: PlayCircle,
  },
};

// "10:14:22 AM" — locale-aware 12-hour clock with seconds.
function formatClock(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export default function AuditLog({ entries }) {
  const listRef = useRef(null);

  // Auto-scroll to top whenever a new entry arrives. We key on the
  // newest id so this fires only when something changes (not on every
  // parent render).
  const topId = entries && entries.length > 0 ? entries[0].id : null;
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [topId]);

  return (
    <section
      aria-label="Live audit log"
      className="sticky bottom-0 z-20 overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-lg backdrop-blur"
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <Activity className="h-4 w-4 text-emerald-600" />
          <h2 className="text-sm font-bold tracking-tight text-slate-900">
            Live Audit Log
          </h2>
          <span className="text-xs font-medium text-slate-500">
            · {entries?.length ?? 0}/100
          </span>
          {entries && entries.length >= 100 && (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800 ring-1 ring-amber-200">
              <ShieldAlert className="h-3 w-3" />
              Capped
            </span>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
          <Sparkles className="h-3 w-3" />
          in-session · FIFO 100
        </div>
      </header>

      {/* Body */}
      <div
        ref={listRef}
        className="max-h-60 overflow-y-auto px-3 py-2"
      >
        {entries && entries.length > 0 ? (
          <ol className="space-y-1.5">
            {entries.map((entry) => (
              <AuditLogRow key={entry.id} entry={entry} />
            ))}
          </ol>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
}

function AuditLogRow({ entry }) {
  const style = SEVERITY_STYLES[entry.severity] || fallbackSeverity(entry.severity);
  const { Icon } = style;
  return (
    <li
      className={`flex items-start gap-3 rounded-r-md border-l-4 ${style.border} ${style.bg} px-3 py-2`}
    >
      <span
        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1 ${style.chip}`}
        aria-hidden
      >
        <Icon className="h-3 w-3" />
      </span>
      <div className="min-w-0 flex-1 font-mono text-xs leading-relaxed">
        <span className="text-slate-500">[{formatClock(entry.ts)}]</span>{' '}
        <span
          className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${style.chip}`}
        >
          {entry.type}
        </span>{' '}
        <span className={`font-sans ${style.text}`}>{entry.message}</span>
        {entry.actor && (
          <span className="ml-1 font-sans text-[11px] text-slate-400">
            — {entry.actor}
          </span>
        )}
      </div>
    </li>
  );
}

// Defensive helper for unknown severities.
function fallbackSeverity(sev) {
  if (typeof console !== 'undefined') {
    console.warn('[AuditLog] unknown severity, defaulting to INFO:', sev);
  }
  return SEVERITY_STYLES.INFO;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 ring-1 ring-slate-200">
        <ScrollText className="h-5 w-5" />
      </span>
      <p className="text-xs font-medium text-slate-500">
        No audit events yet. Resolve a request, flag a patient, or simulate an
        external upload to populate the log.
      </p>
    </div>
  );
}