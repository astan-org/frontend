'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { CPARResult, PlatformStatus, SourceMode } from './types';
import ClassificationCard from './classification-card';
import PlatformDispatch from './platform-dispatch';
import AuditTrail from './audit-trail';
import { NCMEC } from './constants';

interface StoredIncident {
  result: CPARResult;
  sourcePlatform: string;
  sourceMode: SourceMode;
}

function PageNav({ id, onBack }: { id: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors shrink-0"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Live Dashboard
      </button>
      <div className="w-px h-4 bg-slate-200 shrink-0" />
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded uppercase tracking-wider shrink-0">
          DETECTED
        </span>
        <span className="text-base font-semibold text-slate-900 truncate">Incident Analysis</span>
        <div className="flex-1 h-px bg-slate-100 hidden sm:block" />
        <span className="font-mono text-[11px] text-slate-400 shrink-0 hidden sm:block">{id}</span>
      </div>
    </div>
  );
}

export default function IncidentDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<StoredIncident | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !id) return;
    try {
      const raw = sessionStorage.getItem(`cpar_incident_${id}`);
      if (!raw) { setNotFound(true); return; }
      setData(JSON.parse(raw) as StoredIncident);
    } catch {
      setNotFound(true);
    }
  }, [mounted, id]);

  if (!mounted) return null;

  if (notFound || (!data && mounted)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-slate-400 text-sm mb-4">Incident not found — it may have expired from session.</p>
        <button
          onClick={() => router.push('/')}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Return to Dashboard
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { result, sourcePlatform, sourceMode } = data;

  // All platforms already complete — incident was processed automatically
  const platformStates: Record<string, PlatformStatus> = Object.fromEntries([
    ...result.dispatch_targets.map(p => [p, 'complete' as PlatformStatus]),
    ...(result.ncmec_required ? [[NCMEC.name, 'complete' as PlatformStatus]] : []),
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="pb-16 space-y-5"
    >
      <PageNav id={id} onBack={() => router.push('/')} />

      {/* Auto-detected banner */}
      <div className="flex items-center gap-2 sm:gap-3 bg-slate-900 text-white rounded-xl px-4 sm:px-5 py-3 text-xs overflow-hidden">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-slate-400 hidden sm:inline">Auto-detected via</span>
        <span className="font-medium text-white truncate">{sourcePlatform} safety monitoring</span>
        <span className="text-slate-600 hidden sm:inline">·</span>
        <span className="text-slate-400 hidden sm:inline shrink-0">No human trigger</span>
        <div className="flex-1" />
        <span className="font-mono text-[10px] text-emerald-400 shrink-0">● DISPATCHED</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ClassificationCard result={result} isLoading={false} />
        <PlatformDispatch
          result={result}
          platformStates={platformStates}
          isComplete={true}
          demoState="complete"
        />
      </div>

      <div className="flex items-center gap-3 mb-1">
        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded uppercase tracking-wider">
          STAGE 04
        </span>
        <span className="text-base font-semibold text-slate-900">Audit Trail</span>
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-xs text-slate-400">DSA Article 17 compliant · SHA-256 sealed</span>
      </div>

      <AuditTrail
        result={result}
        sourceMode={sourceMode}
        sourcePlatform={sourcePlatform}
        onReset={() => router.push('/')}
      />
    </motion.div>
  );
}
