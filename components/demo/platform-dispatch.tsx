'use client';

import type { CPARResult, DemoState, PlatformStatus } from './types';
import { PLATFORMS, NCMEC } from './constants';

interface Props {
  result: CPARResult | null;
  platformStates: Record<string, PlatformStatus>;
  isComplete: boolean;
  demoState: DemoState;
}

function statusLabel(s: PlatformStatus | undefined): string {
  if (s === 'notifying') return 'NOTIFYING';
  if (s === 'complete') return '✓ SENT';
  return 'STANDBY';
}

function statusClass(s: PlatformStatus | undefined): string {
  if (s === 'notifying') return 'bg-blue-600 text-white animate-pulse';
  if (s === 'complete') return 'bg-emerald-600 text-white';
  return 'bg-slate-100 text-slate-400';
}

function rowClass(s: PlatformStatus | undefined, dimmed: boolean, isNcmec: boolean): string {
  if (dimmed) return 'border-slate-100 bg-slate-50 opacity-40';
  if (isNcmec) {
    if (s === 'notifying') return 'border-rose-200 bg-rose-50';
    if (s === 'complete') return 'border-rose-200 bg-rose-50';
    return 'border-rose-100 bg-rose-50/50';
  }
  if (s === 'notifying') return 'border-blue-200 bg-blue-50';
  if (s === 'complete') return 'border-emerald-200 bg-emerald-50';
  return 'border-slate-100 bg-slate-50';
}

export default function PlatformDispatch({ result, platformStates, isComplete, demoState }: Props) {
  const isLoading = demoState === 'loading';

  // Build ordered display list: active targets first, NCMEC if required, then dimmed
  const ordered: Array<{ name: string; emoji: string; mandatory?: boolean }> = result
    ? [
        ...PLATFORMS.filter(p => result.dispatch_targets.includes(p.name)),
        ...(result.ncmec_required ? [NCMEC] : []),
        ...PLATFORMS.filter(p => !result.dispatch_targets.includes(p.name)),
      ]
    : [...PLATFORMS];

  const activeCount = result
    ? result.dispatch_targets.length + (result.ncmec_required ? 1 : 0)
    : 0;

  const dimmedCount = result ? PLATFORMS.length - result.dispatch_targets.length : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Platform Dispatch</h3>
        <span
          className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1 rounded-full transition-colors ${
            isComplete
              ? 'bg-emerald-50 text-emerald-600'
              : demoState === 'dispatching'
                ? 'bg-blue-50 text-blue-600'
                : isLoading
                  ? 'bg-slate-100 text-slate-400'
                  : 'bg-slate-100 text-slate-400'
          }`}
        >
          {isComplete ? 'COMPLETE' : demoState === 'dispatching' ? 'DISPATCHING…' : 'STANDBY'}
        </span>
      </div>

      <div className="space-y-2">
        {ordered.map(p => {
          const isTarget = result?.dispatch_targets.includes(p.name);
          const isNcmec = p.name === NCMEC.name;
          const isDimmed = !!result && !isTarget && !isNcmec;
          const status = platformStates[p.name];
          const action = result?.platform_actions[p.name];

          return (
            <div
              key={p.name}
              className={`grid items-center p-3 rounded-xl border transition-all duration-300 ${rowClass(status, isDimmed, isNcmec)}`}
              style={{ gridTemplateColumns: '32px 1fr auto' }}
            >
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-base leading-none">
                {p.emoji}
              </div>
              <div className="px-3 min-w-0">
                <p className="text-xs font-medium text-slate-800 flex items-center gap-2">
                  {p.name}
                  {isNcmec && (
                    <span className="font-mono text-[9px] text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
                      mandatory
                    </span>
                  )}
                </p>
                <p className="font-mono text-[10px] text-slate-400 mt-0.5 truncate">
                  {isDimmed ? '— not in dispatch envelope' : action ?? 'awaiting classification'}
                </p>
              </div>
              <span
                className={`font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md min-w-[88px] text-center transition-all duration-300 ${
                  isDimmed ? 'text-slate-300 bg-transparent' : statusClass(status)
                }`}
              >
                {isDimmed ? '—' : statusLabel(status)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-dashed border-slate-200 text-xs text-slate-400">
        {isComplete && result ? (
          <span>
            <span className="font-mono font-medium text-slate-700">{activeCount}</span> platforms notified
            {result.ncmec_required && (
              <>
                {' '}· <span className="font-mono font-medium text-slate-700">NCMEC</span> escalation filed
              </>
            )}
            {dimmedCount > 0 && (
              <>
                {' '}· <span className="font-mono font-medium text-slate-700">{dimmedCount}</span> platforms dimmed
              </>
            )}
          </span>
        ) : (
          <span>Awaiting classification…</span>
        )}
      </div>
    </div>
  );
}
