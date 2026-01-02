'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from './components/DashboardShell';
import { HealthWidget } from './components/HealthWidget';

const TOKEN_KEY = 'control-panel-token';
const DEFAULT_API_BASE_URL = 'http://localhost:8000';
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/'`~]/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72;

const getPasswordByteLength = (value: string): number => new TextEncoder().encode(value).length;

type AuthMode = 'login' | 'signup';

interface WidgetLayoutItem {
  type: 'health';
  position?: string;
}

const getPasswordValidationError = (password: string): string | null => {
  if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  if (getPasswordByteLength(password) > MAX_PASSWORD_BYTES)
    return `Password must be at most ${MAX_PASSWORD_BYTES} bytes (about ${MAX_PASSWORD_BYTES} ASCII characters) long.`;
  if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must include at least one number.';
  if (!SPECIAL_CHAR_REGEX.test(password)) return 'Password must include at least one special character.';
  return null;
};

export default function Page() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [layout, setLayout] = useState<WidgetLayoutItem[]>([{ type: 'health' }]);
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const baseUrl = useMemo(() => apiBaseUrl || DEFAULT_API_BASE_URL, [apiBaseUrl]);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchLayout = async () => {
      try {
        const response = await fetch(`${baseUrl}/widgets/layout`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Unable to load layout');
        const data = await response.json();
        setLayout(Array.isArray(data?.widgets) ? data.widgets : [{ type: 'health' }]);
      } catch (err) {
        console.error(err);
        setLayout([{ type: 'health' }]);
      }
    };

    fetchLayout();
  }, [token, baseUrl]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'signup') {
      if (password !== confirmPassword) {
        setStatus('Passwords do not match.');
        return;
      }
      const passwordError = getPasswordValidationError(password);
      if (passwordError) {
        setStatus(passwordError);
        return;
      }
    }
    const actionCopy = authMode === 'signup' ? 'Creating account...' : 'Logging in...';
    setStatus(actionCopy);
    try {
      const response = await fetch(`${baseUrl}/auth/${authMode === 'signup' ? 'signup' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          (data && typeof data.detail === 'string' && data.detail) ||
          (authMode === 'signup' ? 'Unable to create account' : 'Invalid credentials');
        throw new Error(message);
      }
      if (!data || typeof data.access_token !== 'string') {
        throw new Error('Unexpected response from server.');
      }
      setToken(data.access_token);
      localStorage.setItem(TOKEN_KEY, data.access_token);
      setStatus(authMode === 'signup' ? 'Account created and logged in.' : 'Logged in successfully');
      if (authMode === 'signup') {
        setAuthMode('login');
        setConfirmPassword('');
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Unable to login');
    }
  };

  const handleResetLayout = async () => {
    const defaultLayout = [{ type: 'health' }];
    setLayout(defaultLayout);
    if (!token) return;

    await fetch(`${baseUrl}/widgets/layout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ widgets: defaultLayout }),
    });
  };

  return (
    <DashboardShell title="Control Panel" onReset={token ? handleResetLayout : undefined}>
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="card p-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Access</h2>
            <div className="inline-flex rounded bg-slate-100 p-1 text-xs font-medium text-slate-600">
              {(['login', 'signup'] as AuthMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`rounded px-2 py-1 transition ${
                    authMode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                  onClick={() => {
                    setAuthMode(mode);
                    setStatus(null);
                    setConfirmPassword('');
                  }}
                >
                  {mode === 'login' ? 'Login' : 'Sign Up'}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-slate-600">
            {authMode === 'signup'
              ? 'Create a new account to save layouts and data.'
              : 'Authenticate to load your widgets.'}
          </p>
          <form className="mt-4 space-y-3" onSubmit={handleAuth}>
            <div className="space-y-1">
              <label className="text-sm text-slate-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            {authMode === 'signup' && (
              <>
                <div className="space-y-1">
                  <label className="text-sm text-slate-700" htmlFor="confirm-password">
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Passwords must be at least {MIN_PASSWORD_LENGTH} characters, under {MAX_PASSWORD_BYTES} bytes, and include uppercase, lowercase, number, and special symbols.
                </p>
              </>
            )}
            <div className="space-y-1">
              <label className="text-sm text-slate-700" htmlFor="api">
                API Base URL
              </label>
              <input
                id="api"
                type="text"
                placeholder={DEFAULT_API_BASE_URL}
                value={apiBaseUrl ?? ''}
                onChange={(e) => setApiBaseUrl(e.target.value || null)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {authMode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
            {status && <p className="text-sm text-slate-600">{status}</p>}
          </form>
        </div>
        <div className="lg:col-span-3 space-y-4">
          {layout.map((widget, index) => (
            <HealthWidget key={`${widget.type}-${index}`} token={token || ''} apiBaseUrl={baseUrl} />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
