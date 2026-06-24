// Mock dataset for ScanTrack
// Today is treated as 2026-06-23 for relative-date display purposes.

export const TODAY = new Date('2026-06-23T08:30:00');

export const MODALITIES = {
  'CT': { label: 'CT', ionizing: true, icon: 'ScanLine', tone: 'sky' },
  'MRI': { label: 'MRI', ionizing: false, icon: 'Brain', tone: 'violet' },
  'XR': { label: 'X-Ray', ionizing: true, icon: 'Bone', tone: 'amber' },
  'US': { label: 'Ultrasound', ionizing: false, icon: 'Waves', tone: 'emerald' },
};

export const BODY_PARTS = {
  'CHEST': 'Chest',
  'ABDOMEN': 'Abdomen',
  'BRAIN': 'Brain',
  'KNEE': 'Knee',
  'SPINE': 'Spine',
  'PELVIS': 'Pelvis',
};

// --- Helper to build ISO dates relative to TODAY ---
const daysAgo = (n) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const PATIENTS = [
  // ----- Patient 1023 — RED ALERT -----
  // CT Chest today, CT Chest 18 days ago (within 30d repeat window for ionising).
  {
    id: 'P-1023',
    name: 'Eleanor Whitfield',
    dob: '1958-03-12',
    sex: 'F',
    mrn: 'MRN-1023-A',
    requestingPhysician: 'Dr. M. Kapoor',
    ward: 'Pulmonology · W-3',
    incomingRequest: {
      id: 'REQ-2041',
      modality: 'CT',
      bodyPart: 'CHEST',
      clinicalIndication: 'Persistent productive cough, rule out recurrent infection.',
      priority: 'Urgent',
      requestedAt: TODAY.toISOString(),
      contrast: 'With IV contrast',
    },
    history: [
      {
        id: 'SCN-9921',
        date: daysAgo(18),
        modality: 'CT',
        bodyPart: 'CHEST',
        facility: 'St. Marian General — Internal',
        indication: 'Cough with hemoptysis, r/o PE protocol.',
        findings: 'No pulmonary embolism. Bilateral lower-lobe consolidation consistent with community-acquired pneumonia. Follow-up recommended in 6–8 weeks.',
        effectiveDose: 7.0, // mSv
        radiologist: 'Dr. A. Mercer',
      },
      {
        id: 'SCN-8402',
        date: daysAgo(412),
        modality: 'XR',
        bodyPart: 'CHEST',
        facility: 'St. Marian General — Internal',
        indication: 'Annual employment screening.',
        findings: 'Unremarkable cardiac silhouette. No focal consolidation.',
        effectiveDose: 0.05,
        radiologist: 'Dr. P. Singh',
      },
    ],
  },

  // ----- Patient 1045 — YELLOW ALERT -----
  // X-Ray Knee today, X-Ray Knee ~4 months ago (within 6-month ionising window).
  {
    id: 'P-1045',
    name: 'Marcus O\'Donnell',
    dob: '1991-08-04',
    sex: 'M',
    mrn: 'MRN-1045-B',
    requestingPhysician: 'Dr. L. Chen',
    ward: 'Orthopedics · OPD',
    incomingRequest: {
      id: 'REQ-2042',
      modality: 'XR',
      bodyPart: 'KNEE',
      clinicalIndication: 'Right knee pain, possible effusion after twisting injury.',
      priority: 'Routine',
      requestedAt: TODAY.toISOString(),
      contrast: 'No contrast',
    },
    history: [
      {
        id: 'SCN-7610',
        date: daysAgo(122), // ~4 months
        modality: 'XR',
        bodyPart: 'KNEE',
        facility: 'St. Marian General — Internal',
        indication: 'Post-fall knee pain.',
        findings: 'No acute fracture. Small joint effusion. Mild patellar tendinopathy.',
        effectiveDose: 0.001,
        radiologist: 'Dr. A. Mercer',
      },
    ],
  },

  // ----- Patient 1078 — GREY ALERT -----
  // MRI Brain today, MRI Brain 7 days ago (non-ionising, just informational).
  {
    id: 'P-1078',
    name: 'Sofia Rinaldi',
    dob: '1974-11-29',
    sex: 'F',
    mrn: 'MRN-1078-C',
    requestingPhysician: 'Dr. R. Oyelaran',
    ward: 'Neurology · W-5',
    incomingRequest: {
      id: 'REQ-2043',
      modality: 'MRI',
      bodyPart: 'BRAIN',
      clinicalIndication: 'New-onset right-sided weakness, follow-up on known demyelinating lesions.',
      priority: 'Urgent',
      requestedAt: TODAY.toISOString(),
      contrast: 'With gadolinium',
    },
    history: [
      {
        id: 'SCN-9113',
        date: daysAgo(7),
        modality: 'MRI',
        bodyPart: 'BRAIN',
        facility: 'St. Marian General — Internal',
        indication: 'Acute episode of left-sided paresthesia.',
        findings: 'Two new periventricular white matter lesions suggestive of demyelinating disease. No mass effect.',
        effectiveDose: 0, // MRI is non-ionising
        radiologist: 'Dr. A. Mercer',
      },
      {
        id: 'SCN-7880',
        date: daysAgo(380),
        modality: 'MRI',
        bodyPart: 'SPINE',
        facility: 'St. Marian General — Internal',
        indication: 'Cervical radiculopathy workup.',
        findings: 'Mild C5–C6 disc bulge, no cord compression.',
        effectiveDose: 0,
        radiologist: 'Dr. F. Albright',
      },
    ],
  },

  // ----- Patient 1102 — GREEN STATUS -----
  // CT Abdomen today, no history.
  {
    id: 'P-1102',
    name: 'Jamal Whitfield',
    dob: '1985-02-17',
    sex: 'M',
    mrn: 'MRN-1102-D',
    requestingPhysician: 'Dr. S. Vance',
    ward: 'General Surgery · W-2',
    incomingRequest: {
      id: 'REQ-2044',
      modality: 'CT',
      bodyPart: 'ABDOMEN',
      clinicalIndication: 'Right lower quadrant pain, suspected appendicitis.',
      priority: 'Urgent',
      requestedAt: TODAY.toISOString(),
      contrast: 'With IV + oral contrast',
    },
    history: [],
  },

  // ----- Patient 1150 — YELLOW ALERT (external) -----
  // X-Ray Chest today, historical scan from external clinic.
  {
    id: 'P-1150',
    name: 'Priya Anand',
    dob: '1962-07-09',
    sex: 'F',
    mrn: 'MRN-1150-E',
    requestingPhysician: 'Dr. K. Eze',
    ward: 'Cardiology · W-4',
    incomingRequest: {
      id: 'REQ-2045',
      modality: 'XR',
      bodyPart: 'CHEST',
      clinicalIndication: 'Worsening dyspnea on exertion, r/o pulmonary congestion.',
      priority: 'Routine',
      requestedAt: TODAY.toISOString(),
      contrast: 'No contrast',
    },
    history: [
      {
        id: 'SCN-EXT-4477',
        date: daysAgo(47), // ~1.5 months — well outside 30d RED window, but external = elevated caution
        modality: 'XR',
        bodyPart: 'CHEST',
        facility: 'Northbrook Community Clinic — EXTERNAL',
        indication: 'Pre-op clearance for cataract surgery.',
        findings: 'Mild cardiomegaly. No focal consolidation.',
        effectiveDose: 0.04,
        radiologist: 'Dr. I. Markou (external)',
        external: true,
      },
    ],
  },
];

// --- Clinical rule engine ---
// Returns the highest-severity alert level + matched prior scans + reasoning.

const SEVERITY = {
  GREEN: { level: 'GREEN', rank: 0 },
  GREY:  { level: 'GREY',  rank: 1 },
  YELLOW:{ level: 'YELLOW',rank: 2 },
  RED:   { level: 'RED',   rank: 3 },
};

const dayDiff = (a, b) => {
  const ms = new Date(a).getTime() - new Date(b).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
};

export function evaluateRequest(patient) {
  const req = patient.incomingRequest;
  const reqModality = MODALITIES[req.modality];
  const matches = patient.history.filter(
    (h) => h.modality === req.modality && h.bodyPart === req.bodyPart,
  );

  const reasons = [];
  let worst = SEVERITY.GREEN;

  for (const prior of matches) {
    const gap = dayDiff(TODAY, prior.date); // positive days between prior and today
    const isIonizing = reqModality.ionizing;

    if (isIonizing) {
      if (gap <= 30) {
        // Ionising scan repeated on same body part within 30 days.
        worst = maxSeverity(worst, SEVERITY.RED);
        reasons.push({
          severity: 'RED',
          prior,
          gapDays: gap,
          message: `Repeat ionising ${MODALITIES[prior.modality].label} of the ${BODY_PARTS[prior.bodyPart]} only ${gap} day${gap === 1 ? '' : 's'} ago. Consider deferring or substituting non-ionising imaging (e.g. MRI/Ultrasound).`,
        });
      } else if (gap <= 180) {
        worst = maxSeverity(worst, SEVERITY.YELLOW);
        reasons.push({
          severity: 'YELLOW',
          prior,
          gapDays: gap,
          message: `Ionising ${MODALITIES[prior.modality].label} of the ${BODY_PARTS[prior.bodyPart]} performed ${gap} days ago. Confirm clinical justification before re-exposing the patient.`,
        });
      } else {
        // > 6 months — no automatic flag, but external scans are special-cased below.
      }
    } else {
      // Non-ionising (MRI / Ultrasound). Informational only — no dose penalty.
      if (gap <= 30) {
        worst = maxSeverity(worst, SEVERITY.GREY);
        reasons.push({
          severity: 'GREY',
          prior,
          gapDays: gap,
          message: `Repeat ${MODALITIES[prior.modality].label} (non-ionising) of the ${BODY_PARTS[prior.bodyPart]} only ${gap} day${gap === 1 ? '' : 's'} ago. No radiation risk — informational match only.`,
        });
      }
    }

    // External-clinic scans always elevate to YELLOW regardless of modality/gap.
    if (prior.external && SEVERITY.YELLOW.rank > worst.rank) {
      worst = SEVERITY.YELLOW;
      reasons.push({
        severity: 'YELLOW',
        prior,
        gapDays: gap,
        message: `Prior scan originates from an external facility (${prior.facility}). Verify availability and review before repeating.`,
      });
    }
  }

  if (reasons.length === 0) {
    reasons.push({
      severity: 'GREEN',
      prior: null,
      gapDays: null,
      message: 'No prior imaging of the same body part/modality found on file. Proceed as requested.',
    });
  }

  // De-duplicate reasons by message, keep order: RED -> YELLOW -> GREY -> GREEN.
  const order = { RED: 0, YELLOW: 1, GREY: 2, GREEN: 3 };
  const seen = new Set();
  const unique = [];
  for (const r of reasons.sort((a, b) => order[a.severity] - order[b.severity])) {
    if (!seen.has(r.message)) {
      seen.add(r.message);
      unique.push(r);
    }
  }

  return {
    severity: worst.level,
    reasons: unique,
    matchedPrior: matches,
  };
}

function maxSeverity(a, b) {
  return a.rank >= b.rank ? a : b;
}

// Pretty date helper used across views.
export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRelative(iso) {
  if (!iso) return '—';
  const diff = dayDiff(TODAY, iso);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 30) return `${diff} days ago`;
  if (diff < 365) return `${Math.round(diff / 30)} months ago`;
  return `${Math.round(diff / 365)} year${diff < 730 ? '' : 's'} ago`;
}

/* ----------------------------------------------------------------
 * buildExternalPatient(payload)
 * ----------------------------------------------------------------
 * Mints a fully-shaped patient object compatible with the existing
 * PATIENTS[] array, from an external-upload payload produced by the
 * ExternalUploadModal. The returned object:
 *
 *   - has the same schema as a PATIENTS[] entry
 *   - is flagged `external: true` (used by Dashboard for the EXTERNAL
 *     tag and by the rule engine to elevate severity to YELLOW)
 *   - has history pre-seeded with ONE external prior scan so the new
 *     row naturally renders as YELLOW (or higher) for demo punch
 *   - does NOT mutate the existing PATIENTS array — pure factory
 *
 * Payload schema (mirrors ExternalUploadModal PRESETS):
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
 * ---------------------------------------------------------------- */
let __externalReqCounter = 9000; // monotonically increasing REQ id source
let __externalScanCounter = 7000; // monotonically increasing SCN id source

export function buildExternalPatient(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('buildExternalPatient: payload is required');
  }
  const modality = payload.modality in MODALITIES ? payload.modality : 'XR';
  const bodyPart = payload.bodyPart in BODY_PARTS ? payload.bodyPart : 'CHEST';
  const facility = payload.facility || 'External Facility';

  // Pre-seed an external prior scan so the row renders as YELLOW.
  // The special-case in evaluateRequest() bumps any external prior to
  // YELLOW regardless of modality/gap. We pick a date 45 days prior to
  // TODAY (safe — outside the 30-day RED window) and use the same
  // modality/bodyPart so the prior is also a "matched" prior.
  const priorDate = daysAgo(45);

  __externalReqCounter += 1;
  __externalScanCounter += 1;

  return {
    id: payload.patientId,
    name: payload.patientName,
    // We don't have true DOB from the demo payload — fabricate a
    // believable age based on a fixed reference so the UI shows a
    // stable "Age" value across renders. 1970-01-01 gives ~56y today.
    dob: '1970-01-01',
    sex: 'F',
    mrn: `MRN-${payload.patientId.replace(/^P-/, '')}-EXT`,
    requestingPhysician: 'External Intake',
    ward: `${facility} — EXTERNAL`,
    external: true,
    incomingRequest: {
      id: `REQ-${__externalReqCounter}`,
      modality,
      bodyPart,
      clinicalIndication: payload.indication,
      priority: 'Urgent',
      requestedAt: new Date().toISOString(),
      contrast: 'No contrast',
    },
    history: [
      {
        id: `SCN-EXT-${__externalScanCounter}`,
        date: priorDate,
        modality,
        bodyPart,
        facility: `${facility} — EXTERNAL`,
        indication: 'Imported from external record.',
        findings: 'External report ingested via ScanTrack gateway.',
        effectiveDose: 0.05,
        radiologist: 'External Radiologist',
        external: true,
      },
    ],
  };
}