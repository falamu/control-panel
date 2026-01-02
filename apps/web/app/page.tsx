'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from './components/DashboardShell';
import { HealthWidget } from './components/HealthWidget';

const TOKEN_KEY = 'control-panel-token';
const DEFAULT_API_BASE_URL = 'http://localhost:8000';

interface WidgetLayoutItem {
  type: 'health';
  position?: string;
}

export default function Page() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password');
  const [token, setToken] = useState<string | null>(null);
  const [layout, setLayout] = useState<WidgetLayoutItem[]>([{ type: 'health' }]);
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Logging in...');
    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error('Invalid credentials');
      const data = await response.json();
      setToken(data.access_token);
      localStorage.setItem(TOKEN_KEY, data.access_token);
      setStatus('Logged in successfully');
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
          <h2 className="text-lg font-semibold text-slate-900">Login</h2>
          <p className="text-sm text-slate-600">Authenticate to load your widgets.</p>
          <form className="mt-4 space-y-3" onSubmit={handleLogin}>
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
              Sign In
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
