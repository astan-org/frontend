'use client';

import { useEffect, useRef } from 'react';
import type { CPARResult } from './types';

const RISK = {
  critical: {
    badge: 'bg-rose-50 text-rose-600',
    dot: 'bg-rose-500',
    bar: 'from-rose-500 to-rose-400',
  },
  high: {
    badge: 'bg-orange-50 text-orange-500',
    dot: 'bg-orange-500',
    bar: 'from-orange-500 to-orange-400',
  },
  medium: {
    badge: 'bg-amber-50 text-amber-600',
    dot: 'bg-amber-500',
    bar: 'from-amber-500 to-amber-400',
  },
  low: {
    badge: 'bg-emerald-50 text-emerald-600',
    dot: 'bg-emerald-500',
    bar: 'from-emerald-500 to-cyan-400',
  },
};

interface Props {
  result: CPARResult | null;
  isLoading: boolean;
}

export default function ClassificationCard({ result, isLoading }: Props) {
  const sevBarRef = useRef<HTMLDivElement>(null);
  const confBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!result) {
      if (sevBarRef.current) sevBarRef.current.style.width = '0%';
      if (confBarRef.current) confBarRef.current.style.width = '0%';
      return;
    }
    const t = setTimeout(() => {
      if (sevBarRef.current) sevBarRef.current.style.width = `${result.severity * 10}%`;
      if (confBarRef.current) confBarRef.current.style.width = `${result.confidence}%`;
    }, 80);
    return () => clearTimeout(t);
  }, [result]);

  if (isLoading || !result) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-24 bg-slate-100 rounded-full" />
          <div className="h-8 w-3/4 bg-slate-100 rounded-lg" />
          <div className="h-14 bg-slate-100 rounded-lg" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-14 bg-slate-100 rounded-xl" />
            <div className="h-14 bg-slate-100 rounded-xl" />
          </div>
          <div className="h-16 bg-slate-100 rounded-xl" />
          <div className="flex gap-2">
            {[1, 2, 3].map(i => <div key={i} className="h-6 w-20 bg-slate-100 rounded-full" />)}
          </div>
        </div>
      </div>
    );
  }

  const risk = RISK[result.risk_level];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between gap-4 mb-1">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-mono font-medium uppercase tracking-wider ${risk.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${risk.dot}`} />
          {result.risk_level.toUpperCase()}
        </div>
        <span className="font-mono text-[11px] text-slate-400 mt-1 shrink-0">{result._id}</span>
      </div>

      <h2 className="text-xl font-semibold text-slate-900 mt-4 mb-2 leading-snug">
        {result.harm_type}
      </h2>
      <p className="text-sm text-slate-500 leading-relaxed mb-5">{result.summary}</p>

      {/* Severity + Confidence */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: 'Severity', value: `${result.severity}/10`, ref: sevBarRef, barClass: `bg-gradient-to-r ${risk.bar}` },
          { label: 'Confidence', value: `${result.confidence}%`, ref: confBarRef, barClass: 'bg-gradient-to-r from-blue-600 to-cyan-400' },
        ].map(m => (
          <div key={m.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">{m.label}</span>
              <span className="font-mono text-xs font-semibold text-slate-800">{m.value}</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                ref={m.ref}
                className={`h-full rounded-full transition-all duration-1000 ease-out ${m.barClass}`}
                style={{ width: '0%' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* AI Reasoning — styled as a highlighted panel, not a blockquote */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
        <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse inline-block" />
          AI Reasoning
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">{result.ai_reasoning}</p>
      </div>

      {/* Policy chips */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {result.matched_policies.map(p => (
          <span
            key={p}
            className="font-mono text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-default"
          >
            {p}
          </span>
        ))}
      </div>

      {/* Legal basis */}
      <div className="border-t border-dashed border-slate-200 pt-3 flex gap-2 items-start">
        <svg
          className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-xs text-slate-400">
          <span className="font-medium text-slate-600">Legal basis: </span>
          {result.legal_basis}
        </p>
      </div>
    </div>
  );
}
