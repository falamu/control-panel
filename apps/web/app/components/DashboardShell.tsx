'use client';

import React from 'react';

interface DashboardShellProps {
  title: string;
  children: React.ReactNode;
  onReset?: () => void;
}

export function DashboardShell({ title, children, onReset }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-600">Control panel dashboard</p>
          </div>
          {onReset && (
            <button
              onClick={onReset}
              className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Reset Layout
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4 space-y-4">{children}</main>
    </div>
  );
}
