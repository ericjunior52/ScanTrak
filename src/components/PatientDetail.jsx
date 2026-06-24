import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bone,
  Brain,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileSignature,
  FileText,
  Hospital,
  Layers,
  Save,
  ScanLine,
  ShieldCheck,
  Stethoscope,
  User,
  Waves,
  XCircle,
  Zap,
} from 'lucide-react';
import { SEVERITY_META } from './severity';
import { SeverityBadge, SeverityDot } from './Badges';
import {
  BODY_PARTS,
  MODALITIES,
  PATIENTS,
  TODAY,
  evaluateRequest,
  formatDate,
  formatRelative,
} from '../data';

const MODALITY_ICONS = {
  CT: ScanLine,
  MRI: Brain,
  XR: Bone,
  US: Waves,
};

function ModalityIcon({ modality, className = 'h-5 w-5' }) {
  const Icon = MODALITY_ICONS[modality] || ScanLine;
  const tone = MODALITIES[modality]?.tone || 'sky';
  const toneClass = {
    sky: 'bg-sky-100 text-sky-700 ring-sky-200',
    violet: 'bg-violet-100 text-violet-700 ring-violet-200',
    amber: 'bg-amber-100 text-amber-700 ring-amber-200',
    emerald: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  }[tone];
  return (
    <span
      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${toneClass}`}
    >
      <Icon className={className} />
    </span>
  );
}

const DECISION_OPTIONS = [
  {
    value: 'proceed',
    label: 'Proceed with scan',
    description: 'Patient will receive the originally requested imaging.',
    icon: CheckCircle2,
    tone: 'emerald',
    swatch: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      ring: 'ring-emerald-200',
    },
    panel: {
      active: 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200',
      idle: 'border-slate-200 bg-white hover:bg-slate-50',
    },
  },
  {
    value: 'substitute',
    label: 'Substitute modality',
    description: 'Recommend non-ionising alternative (MRI / Ultrasound).',
    icon: ShieldCheck,
    tone: 'sky',
    swatch: {
      bg: 'bg-sky-100',
      text: 'text-sky-700',
      ring: 'ring-sky-200',
    },
    panel: {
      active: 'border-sky-300 bg-sky-50 ring-2 ring-sky-200',
      idle: 'border-slate-200 bg-white hover:bg-slate-50',
    },
  },
  {
    value: 'defer',
    label: 'Defer & review prior',
    description: 'Hold request while the prior study is formally reviewed.',
    icon: Clock,
    tone: 'amber',
    swatch: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      ring: 'ring-amber-200',
    },
    panel: {
      active: 'border-amber-300 bg-amber-50 ring-2 ring-amber-200',
      idle: 'border-slate-200 bg-white hover:bg-slate-50',
    },
  },
  {
    value: 'reject',
    label: 'Cancel request',
    description: 'Reject the request — duplicate exposure not justified.',
    icon: XCircle,
    tone: 'red',
    swatch: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      ring: 'ring-red-200',
    },
    panel: {
      active: 'border-red-300 bg-red-50 ring-2 ring-red-200',
      idle: 'border-slate-200 bg-white hover:bg-slate-50',
    },
  },
];

export default function PatientDetail({ patientId, onBack }) {
  const patient = useMemo(
    () => PATIENTS.find((p) => p.id === patientId),
    [patientId],
  );
  const evalResult = useMemo(
    () => (patient ? evaluateRequest(patient) : null),
    [patient],
  );

  // Form state
  const [decision, setDecision] = useState('proceed');
  const [justification, setJustification] = useState('');
  const [alternative, setAlternative] = useState('');
  const [reviewer, setReviewer] = useState('Dr. Alex Mercer (Radiologist)');
  const [submitted, setSubmitted] = useState(false);

  if (!patient) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-slate-600">Patient not found.</p>
        <button
          onClick={onBack}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  const sev = SEVERITY_META[evalResult.severity];
  const SevIcon = sev.icon;
  const req = patient.incomingRequest;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real app this would POST to /api/audit-log
  };

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          This view is audit-logged
          <span className="mx-1 text-slate-300">·</span>
          Auto-saved 14:02
        </div>
      </div>

      {/* Patient header card */}
      <section className={`overflow-hidden rounded-2xl border ${sev.border} bg-white shadow-sm`}>
        <div className={`px-6 py-4 ${sev.headerBg} ${sev.headerText}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-700 text-lg font-bold ring-1 ring-slate-200 shadow-sm">
                {patient.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider opacity-70">
                  Patient · {patient.id}
                </div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {patient.name}
                </h1>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm opacity-90">
                  <span>{patient.mrn}</span>
                  <span className="opacity-50">·</span>
                  <span>{patient.sex}</span>
                  <span className="opacity-50">·</span>
                  <span>DOB {formatDate(patient.dob)}</span>
                  <span className="opacity-50">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Hospital className="h-3.5 w-3.5" />
                    {patient.ward}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <SeverityBadge severity={evalResult.severity} size="lg" />
              <div className="text-xs opacity-80">{sev.description}</div>
            </div>
          </div>
        </div>

        {/* Requested scan summary */}
        <div className="grid gap-4 px-6 py-5 sm:grid-cols-[auto,1fr,auto] sm:items-center">
          <ModalityIcon modality={req.modality} className="h-6 w-6" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Requested Scan · {req.id}
            </div>
            <div className="text-lg font-bold text-slate-900">
              {MODALITIES[req.modality].label}{' '}
              {BODY_PARTS[req.bodyPart]}
              <span className="ml-2 text-sm font-medium text-slate-500">
                · {MODALITIES[req.modality].ionizing ? 'Ionising' : 'Non-ionising'}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate-600">{req.clinicalIndication}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Requested {formatDate(req.requestedAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Stethoscope className="h-3.5 w-3.5" />
                {patient.requestingPhysician}
              </span>
              <span className="inline-flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" />
                {req.contrast}
              </span>
              <span className="inline-flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" />
                Priority: <strong className="text-slate-700">{req.priority}</strong>
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
              <Building2 className="h-3.5 w-3.5" />
              Internal request
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN: Alerts + History */}
        <div className="space-y-6 lg:col-span-2">
          {/* Alerts */}
          <section className={`rounded-2xl border ${sev.border} ${sev.accent} ring-1`}>
            <div className="flex items-start gap-4 px-5 py-4">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${sev.pill} shadow-sm`}
              >
                <SevIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight">
                    {sev.label} · {evalResult.reasons.length} matching rule
                    {evalResult.reasons.length === 1 ? '' : 's'}
                  </h2>
                  <SeverityBadge severity={evalResult.severity} />
                </div>
                <p className="mt-0.5 text-sm opacity-90">{sev.description}</p>
                <ul className="mt-3 space-y-2.5">
                  {evalResult.reasons.map((r, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm ring-1 ring-black/5"
                    >
                      <SeverityDot
                        severity={r.severity}
                        className="mt-1.5 h-2 w-2"
                      />
                      <span className="text-slate-800">{r.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Imaging history */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-900">
                  Previous Imaging History
                </h2>
                <p className="text-xs text-slate-500">
                  Cross-referenced from internal PACS and registered external providers.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {patient.history.length} record{patient.history.length === 1 ? '' : 's'}
              </span>
            </header>

            {patient.history.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                  <CheckCircle2 className="h-6 w-6" />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">
                  No prior imaging on file
                </h3>
                <p className="mt-1 max-w-sm text-xs text-slate-500">
                  No studies of any modality on file for this patient. The
                  requested scan can be performed as indicated.
                </p>
              </div>
            ) : (
              <ol className="relative">
                <span
                  className="absolute left-[27px] top-2 bottom-2 w-px bg-slate-200"
                  aria-hidden
                />
                {patient.history.map((h) => {
                  const matched =
                    h.modality === req.modality && h.bodyPart === req.bodyPart;
                  return (
                    <li
                      key={h.id}
                      className={`relative flex gap-4 px-5 py-4 ${
                        matched ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <div className="relative">
                        <ModalityIcon
                          modality={h.modality}
                          className="h-4 w-4"
                        />
                        {matched && (
                          <span className="absolute -right-1 -top-1 inline-flex h-3 w-3 items-center justify-center rounded-full bg-amber-500 ring-2 ring-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {MODALITIES[h.modality].label}{' '}
                            {BODY_PARTS[h.bodyPart]}
                          </span>
                          {matched && (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800 ring-1 ring-amber-200">
                              Matching study
                            </span>
                          )}
                          {h.external && (
                            <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-700 ring-1 ring-indigo-200">
                              <ExternalLink className="h-3 w-3" />
                              External
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(h.date)} ({formatRelative(h.date)})
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {h.facility}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {h.id}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {h.radiologist}
                          </span>
                          {h.effectiveDose > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {h.effectiveDose} mSv
                            </span>
                          )}
                        </div>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                              Indication
                            </div>
                            <p className="text-sm text-slate-700">
                              {h.indication}
                            </p>
                          </div>
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                              Findings
                            </div>
                            <p className="text-sm text-slate-700">
                              {h.findings}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                            <Eye className="h-3.5 w-3.5" />
                            View DICOM
                          </button>
                          {h.external && (
                            <button className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100">
                              <ExternalLink className="h-3.5 w-3.5" />
                              Request external images
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: Documentation form */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
              <FileSignature className="h-5 w-5 text-sky-600" />
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-900">
                  Clinical Decision
                </h2>
                <p className="text-xs text-slate-500">
                  Document rationale — required by audit policy.
                </p>
              </div>
            </header>

            {submitted ? (
              <SubmittedConfirmation
                decision={decision}
                reviewer={reviewer}
                onReset={() => setSubmitted(false)}
              />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Decision
                  </label>
                  <div className="mt-2 space-y-2">
                    {DECISION_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const active = decision === opt.value;
                      return (
                        <label
                          key={opt.value}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                            active ? opt.panel.active : opt.panel.idle
                          }`}
                        >
                          <input
                            type="radio"
                            name="decision"
                            value={opt.value}
                            checked={active}
                            onChange={() => setDecision(opt.value)}
                            className="sr-only"
                          />
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${opt.swatch.bg} ${opt.swatch.text} ${opt.swatch.ring}`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {opt.label}
                            </div>
                            <div className="text-xs text-slate-500">
                              {opt.description}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {(decision === 'substitute' || decision === 'defer') && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {decision === 'substitute'
                        ? 'Recommended alternative modality'
                        : 'Reason for deferral'}
                    </label>
                    {decision === 'substitute' ? (
                      <select
                        value={alternative}
                        onChange={(e) => setAlternative(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
                      >
                        <option value="">Select alternative…</option>
                        <option value="MRI">MRI (non-ionising)</option>
                        <option value="US">Ultrasound (non-ionising)</option>
                        <option value="XR_LOW">Low-dose X-Ray</option>
                        <option value="CLINICAL">Clinical review only</option>
                      </select>
                    ) : (
                      <input
                        value={alternative}
                        onChange={(e) => setAlternative(e.target.value)}
                        placeholder="e.g. Awaiting prior study retrieval from PACS…"
                        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
                      />
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Clinical justification
                  </label>
                  <textarea
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    rows={4}
                    placeholder="Briefly explain why this scan is (or isn't) clinically justified, with reference to prior findings…"
                    className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Visible to referring physician and stored in audit log.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Reviewer
                  </label>
                  <input
                    value={reviewer}
                    onChange={(e) => setReviewer(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-sky-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-4">
                  <span className="text-[11px] text-slate-500">
                    Saved as draft at 14:02
                  </span>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
                  >
                    <Save className="h-4 w-4" />
                    Submit decision
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Quick facts */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quick Facts
            </h3>
            <dl className="mt-3 space-y-2.5 text-sm">
              <Fact label="Patient ID" value={patient.id} />
              <Fact label="MRN" value={patient.mrn} />
              <Fact label="Request ID" value={req.id} />
              <Fact label="Requested" value={formatDate(req.requestedAt)} />
              <Fact label="Referring physician" value={patient.requestingPhysician} />
              <Fact
                label="Records on file"
                value={`${patient.history.length} (${patient.history.filter((h) => h.external).length} external)`}
              />
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800 text-right">{value}</dd>
    </div>
  );
}

function SubmittedConfirmation({ decision, reviewer, onReset }) {
  const opt = DECISION_OPTIONS.find((o) => o.value === decision);
  const Icon = opt?.icon || CheckCircle2;
  return (
    <div className="px-5 py-8 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-2 ring-emerald-200">
        <CheckCircle2 className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-base font-bold text-slate-900">
        Decision recorded
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        <Icon className="-mt-0.5 mr-1 inline h-4 w-4" />
        <strong>{opt?.label}</strong> by {reviewer}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Audit log entry created at {TODAY.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}.
      </p>
      <button
        onClick={onReset}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        Edit decision
      </button>
    </div>
  );
}