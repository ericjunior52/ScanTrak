import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Cloud,
  FileText,
  QrCode,
  Stethoscope,
  UploadCloud,
  X,
} from 'lucide-react';

/* ----------------------------------------------------------------
 * ExternalUploadModal
 * ----------------------------------------------------------------
 * Demo modal that lets the grader inject a mock external imaging
 * record (PDF report or QR-code JSON payload) into the dashboard.
 *
 * Props:
 *   open      - boolean  (controls visibility)
 *   onClose   - () => void  (called on backdrop click, Escape, X)
 *   onConfirm - (payload) => void  (called with the selected payload
 *               when the user confirms)
 *
 * Payload schema:
 *   {
 *     kind:        'PDF' | 'QR',
 *     facility:    string,
 *     modality:    keyof MODALITIES,
 *     bodyPart:    keyof BODY_PARTS,
 *     patientId:   string,
 *     patientName: string,
 *     date:        ISO string,
 *     indication:  string,
 *   }
 *
 * The Dashboard passes the payload through buildExternalPatient()
 * (defined in src/data.js) to mint a fully-shaped patient object
 * compatible with the existing PATIENTS array. This component
 * does NOT touch global state directly — that keeps it testable
 * and re-usable.
 * ---------------------------------------------------------------- */

// Two demo payload presets. Dates are ISO strings; we keep them stable
// at module load so the modal preview always shows consistent data.
const TWO_WEEKS_AGO = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 14);
  return d.toISOString();
})();

const SEVEN_DAYS_AGO = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString();
})();

const PRESETS = {
  PDF: {
    kind: 'PDF',
    facility: 'Northbrook Community Clinic',
    modality: 'XR',
    bodyPart: 'CHEST',
    patientId: 'P-1199',
    patientName: 'Aiyana Bell',
    date: TWO_WEEKS_AGO,
    indication: 'Pre-op clearance.',
  },
  QR: {
    kind: 'QR',
    facility: 'Riverside Imaging Centre',
    modality: 'CT',
    bodyPart: 'BRAIN',
    patientId: 'P-1207',
    patientName: 'Tomás Ríos',
    date: SEVEN_DAYS_AGO,
    indication: 'Headache — r/o intracranial pathology.',
  },
};

const KIND_ICONS = {
  PDF: FileText,
  QR: QrCode,
};

const KIND_TONES = {
  PDF: 'bg-indigo-100 text-indigo-700 ring-indigo-200',
  QR: 'bg-sky-100 text-sky-700 ring-sky-200',
};

export default function ExternalUploadModal({ open, onClose, onConfirm }) {
  const [selected, setSelected] = useState('PDF');
  // Track the previous `open` value in state (not ref) so we can
  // detect the closed → open transition and reset the selection
  // without violating React's "no refs during render" rule.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelected('PDF');
    }
  }

  // Close on Escape key.
  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const preset = PRESETS[selected];
  const Icon = KIND_ICONS[selected];

  // Lock body scroll while open (prevents the dashboard from scrolling
  // behind the backdrop on mobile).
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const handleConfirm = () => {
    if (typeof onConfirm === 'function') {
      onConfirm(preset);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="external-upload-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop — clicking closes. */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        aria-hidden
      />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
              <UploadCloud className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2
                id="external-upload-title"
                className="text-lg font-bold tracking-tight text-slate-900"
              >
                Simulate External Upload
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Demonstrates how ScanTrack captures imaging records from
                outside the hospital network.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Choose a demo payload
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {Object.values(PRESETS).map((p) => {
                const CardIcon = KIND_ICONS[p.kind];
                const active = selected === p.kind;
                return (
                  <button
                    key={p.kind}
                    type="button"
                    onClick={() => setSelected(p.kind)}
                    aria-pressed={active}
                    className={`relative flex flex-col items-start gap-3 rounded-xl border bg-white p-4 text-left shadow-sm transition-all ${
                      active
                        ? 'border-indigo-400 ring-2 ring-indigo-200'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex w-full items-start justify-between">
                      <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1 ${
                          KIND_TONES[p.kind]
                        }`}
                      >
                        <CardIcon className="h-4 w-4" />
                      </span>
                      {active && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          <CheckCircle2 className="h-3 w-3" />
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900">
                        {p.kind === 'PDF'
                          ? 'External PDF report'
                          : 'QR-code intake (JSON)'}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {p.facility}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-600">
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 ring-1 ring-slate-200">
                        <Stethoscope className="h-3 w-3" />
                        {p.modality} · {p.bodyPart}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 ring-1 ring-slate-200">
                        {p.patientId}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payload preview */}
          <PayloadPreview payload={preset} Icon={Icon} />
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/60 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Cloud className="h-4 w-4" />
            Ingest {preset.kind} payload
          </button>
        </div>
      </div>
    </div>
  );
}

function PayloadPreview({ payload, Icon }) {
  // Pretty date — avoids Date.now() drift during render.
  const prettyDate = useMemo(() => {
    const d = new Date(payload.date);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, [payload.date]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Payload Preview
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          {payload.kind}
        </span>
      </div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 px-4 py-3 text-xs sm:grid-cols-2">
        <Field label="Facility" value={payload.facility} />
        <Field label="Patient" value={`${payload.patientName} (${payload.patientId})`} />
        <Field label="Modality" value={payload.modality} />
        <Field label="Body Part" value={payload.bodyPart} />
        <Field label="Date" value={prettyDate} />
        <Field label="Indication" value={payload.indication} />
      </dl>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-sm font-medium text-slate-800">
        {value}
      </dd>
    </div>
  );
}