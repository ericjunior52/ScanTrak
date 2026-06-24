import { useCallback, useMemo, useReducer, useState } from 'react';
import {
  ArrowLeft,
  LayoutDashboard,
  Menu,
  ScanLine,
  X,
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PatientDetail from './components/PatientDetail';
import { GdprBadge } from './components/Badges';
import { AuditLogContext } from './components/AuditLogContext';
import { PATIENTS } from './data';

/* ----------------------------------------------------------------
 * Simple finite state machine
 * ----------------------------------------------------------------
 * States:
 *   - 'dashboard'  : showing the imaging-requests table
 *   - 'patient'    : showing detail view for a specific patient
 *
 * Events:
 *   - NAVIGATE_DASHBOARD : go to dashboard (clears active patient)
 *   - OPEN_PATIENT       : go to detail for a specific patientId
 *   - BACK               : return to dashboard (alias for NAVIGATE_DASHBOARD)
 *   - RESOLVE_PATIENT    : record that a patient has been resolved
 *                          (audit-logged) and return to the dashboard.
 *                          The `resolutions` map is intentionally
 *                          preserved across BACK/NAVIGATE_DASHBOARD
 *                          events so resolved patients remain marked
 *                          in the dashboard for the whole session.
 *   - LOG_EVENT          : prepend a new entry to the audit log
 *                          (newest-first) and cap the array at 100.
 * ---------------------------------------------------------------- */

const MAX_AUDIT_ENTRIES = 100;

// `crypto.randomUUID()` is available in all modern browsers and in
// Node 19+, but we keep a defensive fallback for environments that
// may not expose it (older test runners, etc.).
const newId = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const initialState = {
  view: 'dashboard',
  activePatientId: null,
  resolutions: {},
  // auditLog: array of { id, ts (ISO), type, severity, actor, message }
  // - newest-first ordering
  // - capped at MAX_AUDIT_ENTRIES (FIFO: drop oldest)
  // - in-session only (not persisted)
  auditLog: [],
};

function reducer(state, event) {
  switch (event.type) {
    case 'NAVIGATE_DASHBOARD':
      return { ...state, view: 'dashboard', activePatientId: null };
    case 'BACK':
      return { ...state, view: 'dashboard', activePatientId: null };
    case 'OPEN_PATIENT':
      if (!event.patientId) return state;
      return { ...state, view: 'patient', activePatientId: event.patientId };
    case 'RESOLVE_PATIENT': {
      if (!event.patientId) return state;
      return {
        view: 'dashboard',
        activePatientId: null,
        resolutions: {
          ...state.resolutions,
          [event.patientId]: {
            status: 'RESOLVED',
            resolvedAt: new Date().toISOString(),
          },
        },
      };
    }
    case 'LOG_EVENT': {
      // Per spec: ignore falsy entries (defensive guard).
      if (!event || !event.entry) return state;
      const entry = {
        id: newId(),
        ts: new Date().toISOString(),
        ...event.entry,
      };
      // Prepend (newest-first) and cap at MAX_AUDIT_ENTRIES.
      const next = [entry, ...state.auditLog].slice(0, MAX_AUDIT_ENTRIES);
      return { ...state, auditLog: next };
    }
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Set of patient IDs resolved in the current session. Memoised so the
  // Dashboard does not re-render due to reference changes on unrelated
  // state updates.
  const resolvedIds = useMemo(
    () => new Set(Object.keys(state.resolutions)),
    [state.resolutions],
  );

  // Stable logEvent reference. All callers (Dashboard, PatientDetail,
  // ExternalUploadModal) receive the same function instance across
  // renders — important because every consumer is memoised and we don't
  // want spurious re-renders.
  const logEvent = useCallback((entry) => {
    dispatch({ type: 'LOG_EVENT', entry });
  }, []);

  // Provide logEvent to the entire tree via context. See
  // src/components/AuditLogContext.js for rationale.
  const auditCtxValue = useMemo(() => ({ logEvent }), [logEvent]);

  const handleNavigate = (view) => {
    if (view === 'dashboard') {
      dispatch({ type: 'NAVIGATE_DASHBOARD' });
    }
    setMobileNavOpen(false);
  };

  const handleSelectPatient = (patientId) => {
    dispatch({ type: 'OPEN_PATIENT', patientId });
    setMobileNavOpen(false);
  };

  const handleBack = () => dispatch({ type: 'BACK' });

  const handleResolve = (patientId) => {
    // Resolve first (sets view back to dashboard via reducer), then emit
    // a SUCCESS-severity audit log entry. We look the patient up so the
    // log message can include the human-friendly name.
    dispatch({ type: 'RESOLVE_PATIENT', patientId });
    const patient = PATIENTS.find((p) => p.id === patientId);
    if (patient) {
      logEvent({
        type: 'RESOLVE',
        severity: 'SUCCESS',
        actor: 'Dr. A. Mercer',
        message: `Dr. Mercer resolved Patient ${patient.id} (${patient.name}).`,
      });
    }
  };

  return (
    <AuditLogContext.Provider value={auditCtxValue}>
      <div className="flex h-screen w-full overflow-hidden bg-slate-100">
        {/* Persistent sidebar (desktop) — pinned, never scrolls with main */}
        <Sidebar
          view={state.view}
          activePatientId={state.activePatientId}
          onNavigate={handleNavigate}
        />

        {/* Mobile sidebar drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-slate-900/50"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
              <Sidebar
                view={state.view}
                activePatientId={state.activePatientId}
                onNavigate={handleNavigate}
              />
            </div>
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          {/* Top bar (mobile + persistent global header) */}
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex items-center gap-2">
              <button
                className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              {state.view === 'patient' ? (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 text-slate-700">
                  <LayoutDashboard className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-semibold">Dashboard</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2">
                <ScanLine className="h-4 w-4 text-sky-600" />
                <span className="text-sm font-bold tracking-tight text-slate-900">
                  ScanTrack
                </span>
              </div>
              <span className="hidden md:inline text-slate-300">·</span>
              <div className="hidden md:block">
                <GdprBadge />
              </div>
            </div>

            <button
              className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              {state.view === 'dashboard' && (
                <Dashboard
                  onSelectPatient={handleSelectPatient}
                  resolvedIds={resolvedIds}
                  auditLog={state.auditLog}
                />
              )}
              {state.view === 'patient' && (
                <PatientDetail
                  patientId={state.activePatientId}
                  onBack={handleBack}
                  onResolve={handleResolve}
                  isResolved={
                    state.activePatientId
                      ? resolvedIds.has(state.activePatientId)
                      : false
                  }
                  resolvedAt={
                    state.activePatientId
                      ? state.resolutions[state.activePatientId]?.resolvedAt ?? null
                      : null
                  }
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </AuditLogContext.Provider>
  );
}