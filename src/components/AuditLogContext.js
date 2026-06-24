import { createContext, useContext } from 'react';

/**
 * AuditLogContext
 * ----------------------------------------------------------------
 * Provides a single `logEvent({ type, severity, actor, message })`
 * function to any component in the tree. The provider lives in
 * App.jsx; consumers call `useAuditLog()` to get a stable reference
 * to the dispatcher.
 *
 * Why context?
 *   - Audit events can originate from any view (Dashboard, PatientDetail,
 *     ExternalUploadModal, etc.). Threading a callback through props
 *     would force us to change every parent/child boundary in App.jsx.
 *   - Context is already an idiomatic React primitive and keeps
 *     presentation components decoupled from the App-level reducer.
 *
 * The reducer in App.jsx is the single source of truth — it mints
 * `id` and `ts` for each entry and enforces the 100-entry FIFO cap.
 */
export const AuditLogContext = createContext(null);

/**
 * Hook: useAuditLog()
 *
 * Returns the value provided by <AuditLogContext.Provider>. The value
 * is `{ logEvent }`. If the hook is used outside the provider (e.g.
 * during isolated unit testing), returns a no-op fallback so calling
 * components do not blow up.
 */
export function useAuditLog() {
  const ctx = useContext(AuditLogContext);
  if (!ctx) {
    // Defensive fallback — log to console so the developer notices.
    return {
      logEvent: (entry) => {
        if (typeof console !== 'undefined') {
          console.warn(
            '[AuditLog] useAuditLog() called outside <AuditLogContext.Provider>. Dropping entry:',
            entry,
          );
        }
      },
    };
  }
  return ctx;
}