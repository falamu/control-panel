'use client';

import React, { useEffect, useState } from 'react';

export interface HealthSummary {
  resting_hr: number | null;
  average_sleep_hours: number | null;
  training_load: number | null;
  notes?: string | null;
  last_sync_at?: string | null;
}

interface HealthWidgetProps {
  token: string;
  apiBaseUrl?: string;
}

const DEFAULT_API_BASE_URL = 'http://localhost:8000';

export function HealthWidget({ token, apiBaseUrl }: HealthWidgetProps) {
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBaseUrl || DEFAULT_API_BASE_URL}/health/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Unable to load health summary');
        }

        const data = await response.json();
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unexpected error');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [token, apiBaseUrl]);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Health</h2>
          <p className="text-sm text-slate-600">Summary of recent metrics</p>
        </div>
      </div>
      {loading && <p className="mt-4 text-sm text-slate-600">Loading summary...</p>}
      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && summary && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Metric label="Resting HR" value={summary.resting_hr ? `${summary.resting_hr} bpm` : 'N/A'} />
          <Metric
            label="Average Sleep"
            value={summary.average_sleep_hours ? `${summary.average_sleep_hours} hrs` : 'N/A'}
          />
          <Metric label="Training Load" value={summary.training_load ? `${summary.training_load}` : 'N/A'} />
          <Metric label="Notes" value={summary.notes || '—'} />
          <Metric
            label="Last Sync"
            value={summary.last_sync_at ? new Date(summary.last_sync_at).toLocaleString() : 'Not available'}
          />
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}
