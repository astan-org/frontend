'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { classify } from './classifier';
import { DETECTED_POOL } from './constants';
import type { CPARResult } from './types';

interface FeedItem {
  id: string;
  result: CPARResult;
  platform: string;
  detectedAt: string; // ISO string so sessionStorage round-trips cleanly
}

const ITEMS_KEY = 'cpar_feed_items';
const COUNT_KEY = 'cpar_feed_count';
const MAX_VISIBLE = 6;

function loadItems(): FeedItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(ITEMS_KEY);
    return raw ? (JSON.parse(raw) as FeedItem[]) : [];
  } catch { return []; }
}

function loadCount(): number {
  if (typeof window === 'undefined') return 0;
  try { return parseInt(sessionStorage.getItem(COUNT_KEY) ?? '0', 10) || 0; }
  catch { return 0; }
}

const RISK_BORDER: Record<string, string> = {
  critical: 'border-l-rose-500',
  high: 'border-l-orange-400',
  medium: 'border-l-amber-400',
  low: 'border-l-emerald-400',
};

const RISK_BADGE: Record<string, string> = {
  critical: 'bg-rose-50 text-rose-600',
  high: 'bg-orange-50 text-orange-500',
  medium: 'bg-amber-50 text-amber-600',
  low: 'bg-emerald-50 text-emerald-600',
};

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 8) return 'just now';
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function FeedCard({ item, onClick }: { item: FeedItem; onClick: () => void }) {
  const [ago, setAgo] = useState(() => timeAgo(item.detectedAt));

  useEffect(() => {
    const t = setInterval(() => setAgo(timeAgo(item.detectedAt)), 5000);
    return () => clearInterval(t);
  }, [item.detectedAt]);

  const dispatchCount =
    item.result.dispatch_targets.length + (item.result.ncmec_required ? 1 : 0);

  return (
    <div
      onClick={onClick}
      className={`group bg-white border border-slate-200 border-l-4 ${RISK_BORDER[item.result.risk_level]} rounded-xl p-4 cursor-pointer hover:shadow-md hover:-translate-y-px transition-all duration-200`}
    >
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${RISK_BADGE[item.result.risk_level]}`}>
            {item.result.risk_level}
          </span>
          <span className="text-xs font-semibold text-slate-800 leading-snug">
            {item.result.harm_type}
          </span>
        </div>
        <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      <p className="font-mono text-[10px] text-slate-400 mb-2">
        {item.platform} · {dispatchCount} platform{dispatchCount !== 1 ? 's' : ''} notified
        {item.result.ncmec_required && <span className="text-rose-500"> · NCMEC filed</span>}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400">Sev</span>
          <div className="h-1 w-14 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-slate-400 to-slate-700 rounded-full"
              style={{ width: `${item.result.severity * 10}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-slate-600 font-medium">{item.result.severity}/10</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">{ago}</span>
      </div>
    </div>
  );
}

interface Props {
  onIncident?: (result: CPARResult) => void;
}

export default function DetectedFeed({ onIncident }: Props) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const router = useRouter();
  const lastIndexRef = useRef(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalRef = useRef(0);
  const onIncidentRef = useRef(onIncident);
  onIncidentRef.current = onIncident;

  // Persist items to sessionStorage whenever they change
  useEffect(() => {
    try { sessionStorage.setItem(ITEMS_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const generateIncident = useCallback(() => {
    let i: number;
    do { i = Math.floor(Math.random() * DETECTED_POOL.length); }
    while (i === lastIndexRef.current && DETECTED_POOL.length > 1);
    lastIndexRef.current = i;

    const scenario = DETECTED_POOL[i];
    const result = classify({ text: scenario.text, platform: scenario.platform, harm: null });
    const id =
      `CPAR-DET-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}` +
      `-${Date.now().toString(36).slice(-4).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`;
    result._id = id;
    result._time = new Date().toISOString().slice(11, 19) + ' UTC';

    try {
      sessionStorage.setItem(`cpar_incident_${id}`, JSON.stringify({
        result,
        sourcePlatform: scenario.platform,
        sourceMode: 'detected',
      }));
    } catch {}

    totalRef.current += 1;
    try { sessionStorage.setItem(COUNT_KEY, String(totalRef.current)); } catch {}

    onIncidentRef.current?.(result);

    const newItem: FeedItem = { id, result, platform: scenario.platform, detectedAt: new Date().toISOString() };
    setItems(prev => [newItem, ...prev].slice(0, MAX_VISIBLE));
  }, []);

  const scheduleNext = useCallback(() => {
    const delay = 1800 + Math.random() * 1500;
    timerRef.current = setTimeout(() => {
      generateIncident();
      scheduleNext();
    }, delay);
  }, [generateIncident]);

  useEffect(() => {
    // Load persisted state after mount to avoid SSR/client hydration mismatch
    const stored = loadItems();
    const hasStored = stored.length > 0;
    if (hasStored) setItems(stored);
    totalRef.current = loadCount();

    let first: ReturnType<typeof setTimeout> | null = null;
    if (!hasStored) {
      first = setTimeout(() => {
        generateIncident();
        scheduleNext();
      }, 2500);
    } else {
      scheduleNext();
    }

    return () => {
      if (first) clearTimeout(first);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col min-h-[280px] md:min-h-[420px]">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-semibold text-slate-900">Auto-Detected</span>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-xs text-slate-400">AI monitoring · live</span>
        <div className="flex-1" />
        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase tracking-wider">
          Detected
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs text-center"
            >
              <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-emerald-400 animate-spin mb-3" />
              Awaiting first detection…
            </motion.div>
          ) : (
            items.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <FeedCard item={item} onClick={() => router.push(`/incident/${item.id}`)} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {items.length > 0 && (
        <p className="text-[10px] text-slate-400 font-mono mt-3 pt-3 border-t border-slate-100">
          {totalRef.current} detected this session · click any to view full analysis
        </p>
      )}
    </div>
  );
}
