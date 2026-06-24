import { useMemo, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Database,
  ExternalLink,
  FileSignature,
  FileText,
  Hospital,
  Phone,
  Save,
  ShieldCheck,
  ShieldOff,
  Stethoscope,
} from 'lucide-react';
import { SEVERITY_META } from './severity';
import { SeverityBadge } from './Badges';
import {
  BODY_PARTS,
  MODALITIES,
  PATIENTS,
  TODAY,
  evaluateRequest,
  formatDate,
  formatRelative,
} from '../data';

/* Local copy of the dayDiff helper. We do not import it from data.js
 * because it is intentionally not exported there. The semantics match:
 * positive `result` means `b` is later than `a` by N whole days. */
const dayDiff = (a, b) => {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
};

/* ----------------------------------------------------------------
 * Audit form options
 * ---------------------------------------------------------------- */
const OUTCOME_OPTIONS = [
  {
    value: 'cancel',
    label: 'Previous scan sufficient — Cancel new scan',
  },
  {
    value: 'proceed',
    label: 'Repeat scan clinically justified',
  },
  {
    value: 'awaiting',
    label: 'Awaiting external documents',
  },
];

/* ----------------------------------------------------------------
 * PatientDetail
 * ----------------------------------------------------------------
 * Top-level patient detail view. The component owns only the local
 * form state (outcome, justification). Resolution is recorded in the
 * App-level reducer via `onResolve(patientId)`, then `onBack()` is
 * invoked to return to the dashboard.
 *
 * Props:
 *   patientId   - id of the patient being reviewed
 *   onBack      - () => void  (navigate back to dashboard)
 *   onResolve   - (id) => void  (commit resolution to app state)
 *   isResolved  - boolean  (already resolved in this session)
 *   resolvedAt  - ISO string | null  (timestamp of the resolution)
 * ---------------------------------------------------------------- */
export default function PatientDetail({
  patientId,
  onBack,
  onResolve,
  isResolved = false,
  resolvedAt = null,
}) {
  const patient = useMemo(
    () => PATIENTS.find((p) => p.id === patientId),
    [patientId],
  );
  const evalResult = useMemo(
    () => (patient ? evaluateRequest(patient) : null),
    [patient],
  );

  // Local form state for the audit documentation card.
  const [outcome, setOutcome] = useState('proceed');
  const [justification, setJustification] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [justificationError, setJustificationError] = useState(false);

  if (!patient) {
    return (
      <div className="space-y-6">
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
      </div>
    );
  }

  const sev = SEVERITY_META[evalResult.severity];
  const req = patient.incomingRequest;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (justification.trim().length === 0) {
      setJustificationError(true);
      return;
    }
    setJustificationError(false);
    setSubmitting(true);
    // In a real app this would POST to /api/audit-log before resolving.
    // Here we resolve synchronously then return to the dashboard.
    onResolve(patient.id);
    onBack();
  };

  return (
    <div className="space-y-6">
      {/* -------- Top bar (back + audit indicator) -------- */}
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
          Auto-saved {TODAY.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {/* -------- Patient header card (kept as-is) -------- */}
      <section
        className={`overflow-hidden rounded-2xl border ${sev.border} bg-white shadow-sm`}
      >
        <div className={`px-6 py-4 ${sev.headerBg} ${sev.headerText}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-700 text-lg font-bold ring-1 ring-slate-200 shadow-sm">
                {patient.name
                  .split(' ')
                  .map((n) => n[0])
                  .filter(Boolean)
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
      </section>

      {/* -------- Two-column grid -------- */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ============ LEFT COLUMN ============ */}
        <div className="space-y-6">
          <CurrentRequestCard
            patient={patient}
            req={req}
          />
          <PreviousImagingCard patient={patient} />
        </div>

        {/* ============ RIGHT COLUMN ============ */}
        <div className="space-y-6">
          <ScanTrackAlertCard
            patient={patient}
            evalResult={evalResult}
          />
          {isResolved ? (
            <ResolvedConfirmationCard
              resolvedAt={resolvedAt}
              onBack={onBack}
            />
          ) : (
            <AuditDocumentationCard
              outcome={outcome}
              onOutcomeChange={(v) => {
                setOutcome(v);
              }}
              justification={justification}
              onJustificationChange={(v) => {
                setJustification(v);
                if (justificationError && v.trim().length > 0) {
                  setJustificationError(false);
                }
              }}
              justificationError={justificationError}
              submitting={submitting}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
 *  Current Request Card
 * ================================================================ */
function CurrentRequestCard({ patient, req }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
        <h2 className="text-base font-bold tracking-tight text-slate-900">
          Current Request
        </h2>
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-semibold text-slate-700 ring-1 ring-slate-200">
          {req.id}
        </span>
      </header>
      <div className="space-y-4 px-5 py-5">
        {/* Patient metadata block */}
        <div>
          <div className="text-lg font-bold text-slate-900">{patient.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
            <span className="font-medium text-slate-700">{patient.mrn}</span>
            <span className="text-slate-300">·</span>
            <span>{patient.sex}</span>
            <span className="text-slate-300">·</span>
            <span>DOB {formatDate(patient.dob)}</span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1">
              <Hospital className="h-3.5 w-3.5 text-slate-500" />
              {patient.ward}
            </span>
          </div>
        </div>

        {/* Referring doctor */}
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Stethoscope className="h-4 w-4 text-slate-500" />
          <span>
            Requested by{' '}
            <strong className="font-semibold text-slate-900">
              {patient.requestingPhysician}
            </strong>
          </span>
        </div>

        {/* Clinical indication */}
        <div className="rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Clinical Indication
          </div>
          <p className="mt-1 text-sm italic leading-relaxed text-slate-700">
            {req.clinicalIndication}
          </p>
        </div>

        {/* Footer pills */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ring-1 ${
              req.priority === 'STAT'
                ? 'bg-red-100 text-red-800 ring-red-200'
                : req.priority === 'Urgent'
                ? 'bg-rose-100 text-rose-800 ring-rose-200'
                : 'bg-sky-100 text-sky-800 ring-sky-200'
            }`}
          >
            Priority: {req.priority}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700 ring-1 ring-slate-200">
            {MODALITIES[req.modality].label} · {BODY_PARTS[req.bodyPart]}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700 ring-1 ring-slate-200">
            {req.contrast}
          </span>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
 *  Previous Imaging Records Found
 * ================================================================ */
function PreviousImagingCard({ patient }) {
  const count = patient.history.length;
  return (
    <section
      id="prev-imaging"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
        <h2 className="text-base font-bold tracking-tight text-slate-900">
          Previous Imaging Records Found
        </h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
          {count} record{count === 1 ? '' : 's'}
        </span>
      </header>

      {count === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <h3 className="mt-3 text-sm font-semibold text-slate-900">
            No prior imaging on file
          </h3>
        </div>
      ) : (
        <ol className="relative">
          <span
            className="absolute left-[27px] top-2 bottom-2 w-px bg-slate-200"
            aria-hidden
          />
          {patient.history.map((entry) => (
            <HistoryTimelineItem
              key={entry.id}
              entry={entry}
              reqModality={patient.incomingRequest.modality}
              reqBodyPart={patient.incomingRequest.bodyPart}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

function HistoryTimelineItem({ entry, reqModality, reqBodyPart }) {
  const matched =
    entry.modality === reqModality && entry.bodyPart === reqBodyPart;
  const tone = MODALITIES[entry.modality]?.tone || 'sky';
  const dotTone = {
    sky: 'bg-sky-500',
    violet: 'bg-violet-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
  }[tone];

  return (
    <li className="relative flex gap-4 px-5 py-4">
      <div className="relative flex w-2 flex-col items-center pt-1">
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full ${dotTone} ring-4 ring-white`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-900">
              {formatDate(entry.date)}
            </span>
            <span className="text-xs text-slate-500">{entry.facility}</span>
          </div>
          <span className="text-xs text-slate-500">
            {formatRelative(entry.date)}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
            {MODALITIES[entry.modality].label}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
            {BODY_PARTS[entry.bodyPart]}
          </span>
          {matched && (
            <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800 ring-1 ring-amber-200">
              Matching study
            </span>
          )}
        </div>
        <p className="mt-1.5 text-sm text-slate-700">{entry.indication}</p>
        <div className="mt-2">
          <PacsAvailabilityBadge external={entry.external} />
        </div>
      </div>
    </li>
  );
}

function PacsAvailabilityBadge({ external }) {
  if (external) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
        <ExternalLink className="h-3 w-3" />
        External · Not in PACS
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
      <Database className="h-3 w-3" />
      Available in PACS
    </span>
  );
}

/* ================================================================
 *  Contextual ScanTrack Alert Card
 * ================================================================ */
function ScanTrackAlertCard({ patient, evalResult }) {
  switch (evalResult.severity) {
    case 'RED':
      return <RedAlertCard patient={patient} evalResult={evalResult} />;
    case 'YELLOW':
      return <YellowAlertCard patient={patient} evalResult={evalResult} />;
    case 'GREY':
      return <GreyAlertCard patient={patient} evalResult={evalResult} />;
    case 'GREEN':
    default:
      return <GreenAlertCard patient={patient} evalResult={evalResult} />;
  }
}

function RedAlertCard({ patient, evalResult }) {
  // Most recent matched prior is the first item in matchedPrior.
  const mostRecent = evalResult.matchedPrior[0];
  const dayGap = mostRecent
    ? dayDiff(mostRecent.date, TODAY)
    : evalResult.reasons[0]?.gapDays ?? 0;

  const handleViewPrevious = () => {
    const el = document.getElementById('prev-imaging');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const handleRequestPacs = () => {
    window.alert('PACS image request queued for ' + patient.name);
  };
  const handleContactDoctor = () => {
    window.alert('Calling ' + patient.requestingPhysician);
  };
  const handleOverride = () => {
    if (window.confirm('Override ScanTrack alert? This will be logged.')) {
      window.alert('Override recorded in audit log.');
    }
  };

  return (
    <section className="rounded-2xl border-2 border-red-300 bg-gradient-to-br from-red-50 via-white to-rose-50 shadow-md">
      <div className="flex items-start gap-3 border-b border-red-200/70 px-5 py-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 ring-1 ring-red-200">
          <AlertOctagon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight text-red-900">
            Possible repeated CT scan detected.
          </h2>
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-red-700">
            ScanTrack Alert · Red
          </p>
        </div>
      </div>
      <div className="space-y-3 px-5 py-4">
        <div className="rounded-xl bg-red-100/60 px-4 py-3 ring-1 ring-red-200">
          <p className="text-base font-bold text-red-900">
            A similar scan was recorded {dayGap} day{dayGap === 1 ? '' : 's'} ago.
          </p>
        </div>
        <p className="text-sm text-slate-700">
          Please check previous imaging before repeating. ScanTrack does not
          block scans or replace clinical judgment.
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleViewPrevious}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
          >
            <FileText className="h-4 w-4" />
            View Previous Report
          </button>
          <button
            type="button"
            onClick={handleRequestPacs}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Database className="h-4 w-4" />
            Request PACS Image
          </button>
          <button
            type="button"
            onClick={handleContactDoctor}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Phone className="h-4 w-4" />
            Contact Referring Doctor
          </button>
          <button
            type="button"
            onClick={handleOverride}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            <ShieldOff className="h-4 w-4" />
            Override &amp; Continue
          </button>
        </div>
      </div>
    </section>
  );
}

function YellowAlertCard({ evalResult }) {
  const prior = evalResult.matchedPrior[0];
  const handleView = () => {
    const el = document.getElementById('prev-imaging');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <section className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-white to-yellow-50 shadow-md">
      <div className="flex items-start gap-3 border-b border-amber-200/70 px-5 py-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 ring-1 ring-amber-200">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight text-amber-900">
            Recent or external scan on file
          </h2>
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
            ScanTrack Alert · Yellow
          </p>
        </div>
      </div>
      <div className="space-y-3 px-5 py-4">
        <p className="text-sm text-slate-700">
          {prior
            ? `A ${MODALITIES[prior.modality].label} of the ${BODY_PARTS[prior.bodyPart]} was performed at ${prior.facility} on ${formatDate(prior.date)} (${formatRelative(prior.date)}).`
            : 'A similar prior scan is on file. Please review before proceeding.'}
        </p>
        <button
          type="button"
          onClick={handleView}
          className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
        >
          <FileText className="h-4 w-4" />
          View prior study
        </button>
      </div>
    </section>
  );
}

function GreyAlertCard({ evalResult }) {
  return (
    <section className="rounded-2xl border-2 border-slate-300 bg-gradient-to-br from-slate-50 via-white to-slate-50 shadow-md">
      <div className="flex items-start gap-3 border-b border-slate-200/70 px-5 py-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight text-slate-900">
            Non-ionising repeat — informational
          </h2>
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            ScanTrack Alert · Grey
          </p>
        </div>
      </div>
      <div className="space-y-3 px-5 py-4">
        <p className="text-sm text-slate-700">
          {evalResult.reasons[0]?.text ??
            'A repeat of a non-ionising modality (e.g. MRI/Ultrasound) has been noted. There is no radiation dose penalty — this is informational only.'}
        </p>
      </div>
    </section>
  );
}

function GreenAlertCard() {
  return (
    <section className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-md">
      <div className="flex items-start gap-3 border-b border-emerald-200/70 px-5 py-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight text-emerald-900">
            No prior relevant imaging
          </h2>
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            ScanTrack Alert · Green
          </p>
        </div>
      </div>
      <div className="space-y-3 px-5 py-4">
        <p className="text-sm text-slate-700">
          No prior imaging of the same body part and modality was found on
          file. The requested scan can proceed as indicated.
        </p>
      </div>
    </section>
  );
}

/* ================================================================
 *  Audit Documentation Card
 * ================================================================ */
function AuditDocumentationCard({
  outcome,
  onOutcomeChange,
  justification,
  onJustificationChange,
  justificationError,
  submitting,
  onSubmit,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
        <FileSignature className="h-5 w-5 text-sky-600" />
        <h2 className="text-base font-bold tracking-tight text-slate-900">
          Audit Documentation
        </h2>
      </header>
      <form onSubmit={onSubmit} className="space-y-5 px-5 py-5">
        <div>
          <label
            htmlFor="audit-outcome"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            Outcome
          </label>
          <select
            id="audit-outcome"
            value={outcome}
            onChange={(e) => onOutcomeChange(e.target.value)}
            required
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            {OUTCOME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="audit-justification"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            Clinical Justification Note
          </label>
          <textarea
            id="audit-justification"
            value={justification}
            onChange={(e) => onJustificationChange(e.target.value)}
            rows={4}
            required
            placeholder="Document the clinical rationale for this decision…"
            className={`mt-1.5 w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
              justificationError
                ? 'border-red-300 ring-2 ring-red-100 focus:border-red-400 focus:ring-red-200'
                : 'border-slate-200 focus:border-sky-300 focus:ring-sky-200'
            }`}
          />
          {justificationError && (
            <p className="mt-1 text-xs font-medium text-red-600">
              A clinical justification note is required to submit the audit
              log entry.
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <Save className="h-4 w-4" />
          {submitting ? 'Submitting…' : 'Submit to Audit Log'}
        </button>
      </form>
    </section>
  );
}

/* ================================================================
 *  Resolved confirmation card (shown when isResolved === true)
 * ================================================================ */
function ResolvedConfirmationCard({ resolvedAt, onBack }) {
  return (
    <section className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-2 ring-emerald-200">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold tracking-tight text-emerald-900">
            Resolved
          </h2>
          <p className="mt-0.5 text-sm text-emerald-800">
            This patient was resolved on{' '}
            <strong>{resolvedAt ? formatDate(resolvedAt) : '—'}</strong>
            {resolvedAt && (
              <span className="text-emerald-700">
                {' '}
                at{' '}
                {new Date(resolvedAt).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
            .
          </p>
          <p className="mt-1 text-xs text-emerald-700">
            Entry recorded in audit log.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </section>
  );
}
