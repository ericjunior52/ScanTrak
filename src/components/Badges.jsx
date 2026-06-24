import { ShieldCheck } from 'lucide-react';
import { SEVERITY_META } from './severity';

export function SeverityBadge({ severity, size = 'sm', className = '' }) {
  const meta = SEVERITY_META[severity] || SEVERITY_META.GREEN;
  const Icon = meta.icon;
  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${meta.badge} ${sizes[size]} ${className}`}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} />
      {meta.label}
    </span>
  );
}

export function SeverityDot({ severity, className = '' }) {
  const meta = SEVERITY_META[severity] || SEVERITY_META.GREEN;
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${meta.dot} ${className}`}
      aria-hidden
    />
  );
}

export function GdprBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200">
      <ShieldCheck className="h-3.5 w-3.5" />
      GDPR Compliant
      <span className="mx-1 h-3 w-px bg-emerald-300" />
      <span className="text-emerald-700">Audit Logging Active</span>
    </span>
  );
}