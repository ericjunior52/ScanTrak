import { useState } from 'react';
import { Eye, EyeOff, Lock, ScanLine, ShieldCheck, User } from 'lucide-react';
import { DEMO_USERS, findUser } from '../data';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = username.trim();
    const trimmedPassword = password;

    if (!trimmedUsername || !trimmedPassword) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    // Simulate a brief, deterministic authentication round-trip for realism.
    setTimeout(() => {
      const user = findUser(trimmedUsername, trimmedPassword);
      setIsLoading(false);

      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials. Please use one of the demo accounts below.');
      }
    }, 400);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-100 to-scantrak-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-200/60 ring-1 ring-slate-200">
        {/* Header band */}
        <div className="relative bg-gradient-to-br from-sky-600 to-indigo-700 px-8 py-8 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_40%)]" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
              <ScanLine className="h-6 w-6 text-white" />
            </div>
            <div className="leading-tight">
              <h1 className="text-2xl font-bold tracking-tight">ScanTrack</h1>
              <p className="text-sm font-medium text-sky-100">Radiology Workflow</p>
            </div>
          </div>
          <div className="relative mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-100/90">
            <ShieldCheck className="h-4 w-4" />
            Hospital Portal — Secure Authentication Environment
          </div>
        </div>

        {/* Form body */}
        <div className="px-8 pb-8 pt-7">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Username
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <User className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setError('')}
                  placeholder="e.g. mercer.rad"
                  className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setError('')}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-200 transition-colors hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-sky-300"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Authenticating…
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo accounts help block */}
          <div className="mt-7 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-md bg-sky-100 px-2 py-1 text-xs font-bold text-sky-700">
                DEMO
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Demo Accounts
              </h2>
            </div>
            <div className="space-y-2.5">
              {DEMO_USERS.map((user) => (
                <div
                  key={user.userId}
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 shadow-sm ring-1 ring-slate-100"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {user.name}
                    </div>
                    <div className="truncate text-xs text-slate-500">{user.role}</div>
                  </div>
                  <div className="ml-3 shrink-0 text-right">
                    <div className="text-xs font-medium text-slate-700">{user.userId}</div>
                    <div className="text-[11px] text-slate-400">password</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-slate-400">
            Mock authentication environment for demonstration purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}
