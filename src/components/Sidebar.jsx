import {
  Activity,
  ChevronRight,
  Database,
  FileText,
  LayoutDashboard,
  ScanLine,
  Stethoscope,
  UserCircle2,
  Wifi,
} from 'lucide-react';
import { GdprBadge, SeverityDot } from './Badges';
import { PATIENTS, evaluateRequest } from '../data';

export default function Sidebar({ view, onNavigate }) {
  const counts = PATIENTS.reduce((acc, p) => {
    const sev = evaluateRequest(p).severity;
    acc[sev] = (acc[sev] || 0) + 1;
    return acc;
  }, {});

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-200">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm">
          <ScanLine className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="text-lg font-bold text-slate-900 tracking-tight">
            ScanTrack
          </div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Radiology Workflow
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            view === 'dashboard'
              ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </span>
          <ChevronRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />
        </button>

        <button
          onClick={() => onNavigate('dashboard')}
          className={`mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            view === 'dashboard'
              ? 'text-slate-700'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <FileText className="h-4 w-4" />
            Requests Queue
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            {PATIENTS.length}
          </span>
        </button>

        <div className="mt-5 px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Live Alerts
        </div>
        <div className="space-y-1">
          {(['RED', 'YELLOW', 'GREY', 'GREEN']).map((sev) => (
            <div
              key={sev}
              className="flex items-center justify-between rounded-md px-3 py-1.5 text-xs text-slate-600"
            >
              <span className="flex items-center gap-2">
                <SeverityDot severity={sev} />
                <span className="font-medium">{sev.charAt(0) + sev.slice(1).toLowerCase()}</span>
              </span>
              <span className="font-semibold text-slate-700">
                {counts[sev] || 0}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Integrations
        </div>
        <div className="space-y-2 px-2 text-xs">
          <div className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-2 ring-1 ring-slate-100">
            <span className="flex items-center gap-2 text-slate-700 font-medium">
              <Database className="h-3.5 w-3.5 text-sky-600" />
              PACS
            </span>
            <span className="text-emerald-600 font-semibold">Live</span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-2 ring-1 ring-slate-100">
            <span className="flex items-center gap-2 text-slate-700 font-medium">
              <Stethoscope className="h-3.5 w-3.5 text-sky-600" />
              RIS
            </span>
            <span className="text-emerald-600 font-semibold">Live</span>
          </div>
        </div>
      </nav>

      {/* System Status */}
      <div className="border-t border-slate-200 px-4 py-4 space-y-3">
        <div className="flex items-start gap-2.5 rounded-lg bg-emerald-50 px-3 py-2.5 ring-1 ring-emerald-200">
          <Wifi className="h-4 w-4 text-emerald-600 mt-0.5" />
          <div className="leading-tight">
            <div className="text-xs font-semibold text-emerald-800">
              System Status
            </div>
            <div className="text-[11px] text-emerald-700">
              Connected to RIS/PACS
              <span className="ml-1 text-emerald-500">(Simulation)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-700">
            <UserCircle2 className="h-5 w-5" />
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Active User
            </div>
            <div className="text-sm font-semibold text-slate-900 truncate">
              Dr. Alex Mercer
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Radiologist · #RD-4471
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 ring-1 ring-slate-200">
          <Activity className="h-3.5 w-3.5 text-slate-400" />
          <GdprBadge />
        </div>
      </div>
    </aside>
  );
}