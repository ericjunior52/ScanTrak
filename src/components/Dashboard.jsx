import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Bone,
  Brain,
  Building2,
  Calendar,
  ExternalLink,
  FileSearch,
  Filter,
  Hospital,
  ScanLine,
  Search,
  Sparkles,
  TrendingUp,
  User,
  Users,
  Waves,
} from 'lucide-react';
import { SeverityBadge, SeverityDot } from './Badges';
import {
  BODY_PARTS,
  MODALITIES,
  PATIENTS,
  TODAY,
  evaluateRequest,
  formatRelative,
} from '../data';

const MODALITY_ICONS = {
  CT: ScanLine,
  MRI: Brain,
  XR: Bone,
  US: Waves,
};

function ModalityIcon({ modality, className = 'h-4 w-4' }) {
  const Icon = MODALITY_ICONS[modality] || ScanLine;
  const tone = MODALITIES[modality]?.tone || 'sky';
  const toneClass = {
    sky: 'bg-sky-100 text-sky-700',
    violet: 'bg-violet-100 text-violet-700',
    amber: 'bg-amber-100 text-amber-700',
    emerald: 'bg-emerald-100 text-emerald-700',
  }[tone];
  return (
    <span
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${toneClass} ring-1 ring-black/5`}
    >
      <Icon className={className} />
    </span>
  );
}

const SEVERITY_ORDER = { RED: 0, YELLOW: 1, GREY: 2, GREEN: 3 };

export default function Dashboard({ onSelectPatient }) {
  const [query, setQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const rows = useMemo(() => {
    return PATIENTS.map((p) => {
      const evalResult = evaluateRequest(p);
      return { patient: p, eval: evalResult };
    }).sort((a, b) => SEVERITY_ORDER[a.eval.severity] - SEVERITY_ORDER[b.eval.severity]);
  }, []);

  const filtered = rows.filter(({ patient, eval: ev }) => {
    if (severityFilter !== 'ALL' && ev.severity !== severityFilter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      patient.name.toLowerCase().includes(q) ||
      patient.id.toLowerCase().includes(q) ||
      patient.mrn.toLowerCase().includes(q) ||
      patient.incomingRequest.modality.toLowerCase().includes(q) ||
      BODY_PARTS[patient.incomingRequest.bodyPart].toLowerCase().includes(q)
    );
  });

  const stats = useMemo(() => {
    const total = rows.length;
    const flagged = rows.filter((r) => r.eval.severity !== 'GREEN').length;
    const red = rows.filter((r) => r.eval.severity === 'RED').length;
    const yellow = rows.filter((r) => r.eval.severity === 'YELLOW').length;
    return { total, flagged, red, yellow };
  }, [rows]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Calendar className="h-4 w-4" />
            {TODAY.toLocaleDateString('en-GB', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
            <span className="mx-1 text-slate-300">·</span>
            <FileSearch className="h-4 w-4" />
            RIS Sync 08:14
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Incoming Imaging Requests
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            ScanTrack automatically cross-references each request against the
            patient's imaging history (internal RIS/PACS + external records) to
            flag potentially unnecessary repeat exposures.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
            <Filter className="h-4 w-4" />
            Advanced Filters
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700">
            <Sparkles className="h-4 w-4" />
            New Request
          </button>
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Requests"
          value={stats.total}
          tone="sky"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Flagged"
          value={stats.flagged}
          tone="amber"
          hint="Require radiologist review"
        />
        <StatCard
          icon={<AlertDot severity="RED" />}
          label="Red Alerts"
          value={stats.red}
          tone="red"
          hint="≤ 30 days ionising repeat"
        />
        <StatCard
          icon={<AlertDot severity="YELLOW" />}
          label="Yellow Alerts"
          value={stats.yellow}
          tone="amber-strong"
          hint="≤ 6 months or external"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patient, MRN, modality…"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'RED', 'YELLOW', 'GREY', 'GREEN'].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                severityFilter === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s !== 'ALL' && <SeverityDot severity={s} />}
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <Th>Status</Th>
                <Th>Patient</Th>
                <Th>Requested Scan</Th>
                <Th>Indication</Th>
                <Th>Prior Match</Th>
                <Th>Priority</Th>
                <Th className="text-right">Action</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(({ patient, eval: ev }) => {
                const req = patient.incomingRequest;
                const prior = ev.matchedPrior[0];
                return (
                  <tr
                    key={patient.id}
                    onClick={() => onSelectPatient(patient.id)}
                    className="group cursor-pointer transition-colors hover:bg-sky-50/60"
                  >
                    {/* Status */}
                    <td className="whitespace-nowrap px-4 py-3.5 align-top">
                      <div className="flex items-center gap-2">
                        <SeverityDot severity={ev.severity} className="h-2.5 w-2.5" />
                        <SeverityBadge severity={ev.severity} />
                      </div>
                    </td>

                    {/* Patient */}
                    <td className="whitespace-nowrap px-4 py-3.5 align-top">
                      <div className="flex items-center gap-3">
                        <Avatar name={patient.name} />
                        <div>
                          <div className="font-semibold text-slate-900">
                            {patient.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {patient.id} · {ageFromDob(patient.dob)}y · {patient.sex}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                            <Hospital className="h-3 w-3" />
                            {patient.ward}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Requested scan */}
                    <td className="whitespace-nowrap px-4 py-3.5 align-top">
                      <div className="flex items-center gap-2.5">
                        <ModalityIcon modality={req.modality} />
                        <div>
                          <div className="font-semibold text-slate-900">
                            {MODALITIES[req.modality].label}{' '}
                            {BODY_PARTS[req.bodyPart]}
                          </div>
                          <div className="text-xs text-slate-500">
                            {req.id} · {req.contrast}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Indication */}
                    <td className="px-4 py-3.5 align-top max-w-[260px]">
                      <p className="line-clamp-2 text-sm text-slate-700">
                        {req.clinicalIndication}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        <StethoscopeMini /> {patient.requestingPhysician}
                      </p>
                    </td>

                    {/* Prior match */}
                    <td className="px-4 py-3.5 align-top">
                      {prior ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                            {MODALITIES[prior.modality].label}{' '}
                            {BODY_PARTS[prior.bodyPart]}
                            {prior.external && (
                              <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-indigo-200">
                                <ExternalLink className="h-3 w-3" />
                                External
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {formatRelative(prior.date)}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                            {prior.facility}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                          <SeverityDot severity="GREEN" />
                          No prior match
                        </span>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="whitespace-nowrap px-4 py-3.5 align-top">
                      <PriorityPill priority={req.priority} />
                    </td>

                    {/* Action */}
                    <td className="whitespace-nowrap px-4 py-3.5 align-top text-right">
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 opacity-70 transition-opacity group-hover:opacity-100">
                        Review
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No requests match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/60 px-4 py-3 text-xs text-slate-500">
          <span>
            Showing <span className="font-semibold text-slate-700">{filtered.length}</span>{' '}
            of <span className="font-semibold text-slate-700">{rows.length}</span> requests
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            Data refreshed from RIS · 2 min ago
          </span>
        </div>
      </div>
    </div>
  );
}

function Th({ children, className = '' }) {
  return (
    <th
      className={`whitespace-nowrap px-4 py-3 text-xs font-semibold ${className}`}
    >
      {children}
    </th>
  );
}

function StatCard({ icon, label, value, tone, hint }) {
  const tones = {
    sky: 'bg-sky-50 text-sky-700 ring-sky-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    'amber-strong': 'bg-amber-100 text-amber-800 ring-amber-300',
    red: 'bg-red-50 text-red-700 ring-red-200',
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1 ${tones[tone]}`}
        >
          {icon}
        </span>
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </div>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      {hint && <div className="mt-1 text-[11px] text-slate-400">{hint}</div>}
    </div>
  );
}

function AlertDot({ severity }) {
  const colors = {
    RED: 'bg-red-500',
    YELLOW: 'bg-amber-500',
    GREY: 'bg-slate-500',
    GREEN: 'bg-emerald-500',
  };
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white ${
        colors[severity]
      }`}
    />
  );
}

function Avatar({ name }) {
  const initials = name
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-xs font-bold text-slate-700 ring-1 ring-white shadow-sm">
      {initials}
    </div>
  );
}

function PriorityPill({ priority }) {
  const map = {
    Urgent: 'bg-rose-100 text-rose-800 ring-rose-200',
    Routine: 'bg-sky-100 text-sky-800 ring-sky-200',
    STAT: 'bg-red-100 text-red-800 ring-red-200',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${
        map[priority] || map.Routine
      }`}
    >
      {priority}
    </span>
  );
}

function StethoscopeMini() {
  return (
    <span className="inline-flex items-center" aria-hidden>
      <User className="h-3 w-3" />
    </span>
  );
}

function ageFromDob(dob) {
  const d = new Date(dob);
  const diff = TODAY.getFullYear() - d.getFullYear();
  const m = TODAY.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && TODAY.getDate() < d.getDate())) return diff - 1;
  return diff;
}