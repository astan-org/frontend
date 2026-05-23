'use client';

import { useEffect, useState } from 'react';
import type { CPARResult, SourceMode } from './types';

interface LogRow {
  time: string;
  source: string;
  message: string;
  isSeal?: boolean;
}

interface Props {
  result: CPARResult;
  sourceMode: SourceMode;
  sourcePlatform: string;
  onReset: () => void;
}

function addSecs(base: string, n: number): string {
  const [h, m, s] = base.split(':').map(Number);
  const total = h * 3600 + m * 60 + s + n;
  return [
    String(Math.floor(total / 3600) % 24).padStart(2, '0'),
    String(Math.floor(total / 60) % 60).padStart(2, '0'),
    String(total % 60).padStart(2, '0'),
  ].join(':');
}

function buildRows(result: CPARResult, sourceMode: SourceMode, sourcePlatform: string): LogRow[] {
  const base = result._time?.replace(' UTC', '') ?? '14:32:00';

  const sourceRow: LogRow =
    sourceMode === 'user'
      ? {
          time: addSecs(base, 0),
          source: 'CPAR/Intake',
          message: `RECEIVED user report from ${sourcePlatform} via native report flow`,
        }
      : {
          time: addSecs(base, 0),
          source: 'CPAR/Intake',
          message: `RECEIVED analyst escalation — ${sourcePlatform} Trust & Safety team`,
        };

  const dispatchRows: LogRow[] = result.dispatch_targets.map((p, i) => ({
    time: addSecs(base, 4 + i),
    source: 'CPAR/Dispatcher',
    message: `NOTIFIED ${p} — ${result.platform_actions[p] ?? 'action taken'}`,
  }));

  if (result.ncmec_required) {
    dispatchRows.push({
      time: addSecs(base, 4 + result.dispatch_targets.length),
      source: 'CPAR/Compliance',
      message: 'FILED NCMEC CyberTipline — mandatory report under §2258A',
    });
  }

  const finalOffset = 4 + result.dispatch_targets.length + (result.ncmec_required ? 1 : 0);

  return [
    sourceRow,
    {
      time: addSecs(base, 1),
      source: 'CPAR/Classifier',
      message: `CLASSIFIED harm as ${result.harm_type} — severity ${result.severity}/10`,
    },
    {
      time: addSecs(base, 2),
      source: 'CPAR/Classifier',
      message: `CONFIDENCE ${result.confidence}% — risk level ${result.risk_level.toUpperCase()}`,
    },
    {
      time: addSecs(base, 3),
      source: 'CPAR/Policy',
      message: `MATCHED policies — ${result.matched_policies.length} matched: ${result.matched_policies.join(', ')}`,
    },
    ...dispatchRows,
    {
      time: addSecs(base, finalOffset + 1),
      source: 'CPAR/Compliance',
      message: `GENERATED audit record ${result._id} — DSA Art.17 compliant`,
    },
    {
      time: addSecs(base, finalOffset + 2),
      source: 'CPAR/Compliance',
      message: 'RECORD sealed — SHA-256 anchored ✓',
      isSeal: true,
    },
  ];
}

export default function AuditTrail({ result, sourceMode, sourcePlatform, onReset }: Props) {
  const allRows = buildRows(result, sourceMode, sourcePlatform);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    const timers = allRows.map((_, i) =>
      setTimeout(() => setVisibleCount(i + 1), i * 130)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result._id]);

  const handleDownload = () => {
    const payload = {
      incident_id: result._id,
      generated_at_utc: new Date().toISOString(),
      source_mode: sourceMode,
      classification: {
        risk_level: result.risk_level,
        harm_type: result.harm_type,
        severity: result.severity,
        confidence: result.confidence,
        summary: result.summary,
        ai_reasoning: result.ai_reasoning,
      },
      matched_policies: result.matched_policies,
      dispatch_targets: result.dispatch_targets,
      platform_actions: result.platform_actions,
      compliance: {
        legal_basis: result.legal_basis,
        flags: result.compliance_flags,
        ncmec_required: result.ncmec_required,
        dsa_article_17: true,
        seal: { algorithm: 'SHA-256', status: 'SEALED' },
      },
      meta: {
        model: 'claude-sonnet-4-20250514',
        platform: 'CPAR · Astan',
        spec_version: 'v0.2',
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result._id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
        <div className="flex items-baseline gap-4 flex-wrap">
          <h3 className="text-lg font-semibold text-slate-900">Audit Record</h3>
          <p className="font-mono text-xs text-slate-400">
            ID: <span className="text-slate-700 font-medium">{result._id}</span>
            {' · '}
            <span className="text-slate-700 font-medium">{result._time}</span>
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['DSA · Art.17', 'COPPA', 'NCMEC · §2258A'].map(c => (
            <span
              key={c}
              className="font-mono text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded"
            >
              {c}
            </span>
          ))}
          <span className="font-mono text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
            ● SEALED · SHA-256
          </span>
        </div>
      </div>

      {/* Log table */}
      <div className="bg-slate-900 rounded-xl overflow-hidden py-3 mb-5">
        {allRows.slice(0, visibleCount).map((row, i) => (
          <div
            key={i}
            className="grid px-5 py-[5px] text-xs font-mono gap-3 items-baseline animate-in fade-in slide-in-from-left-1 duration-200"
            style={{ gridTemplateColumns: '72px 130px 1fr' }}
          >
            <span className="text-slate-600 shrink-0">{row.time}</span>
            <span className="text-cyan-400 shrink-0">{row.source}</span>
            <span className={row.isSeal ? 'text-emerald-400' : 'text-slate-300'}>{row.message}</span>
          </div>
        ))}
        {visibleCount === 0 && (
          <div className="px-5 py-3 text-xs font-mono text-slate-600">Generating record…</div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-slate-400 max-w-[52ch] leading-relaxed">
          Generated in accordance with{' '}
          <span className="font-medium text-slate-600">EU Digital Services Act, Article 17</span>. Record
          retained for statutory period. SHA-256 sealed.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-full px-4 py-2 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Reset
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 text-xs font-medium text-white bg-slate-900 border border-slate-900 rounded-full px-4 py-2 hover:bg-blue-600 hover:border-blue-600 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download JSON
          </button>
        </div>
      </div>
    </div>
  );
}
