"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Recipient {
  id: string;
  name: string;
  logo?: string;
  type: "platform" | "regulatory";
  basis: string;
  article: string;
  action: string;
  risk: "critical" | "high" | "medium";
  mandatory?: boolean;
}

const RECIPIENTS: Recipient[] = [
  {
    id: "ncmec",
    name: "NCMEC CyberTipline",
    type: "regulatory",
    basis: "REPORT Act 2024",
    article: "18 U.S.C. § 2258A",
    action: "File mandatory CSEA report — child safety signals detected in incident cluster",
    risk: "critical",
    mandatory: true,
  },
  {
    id: "telegram",
    name: "Telegram Trust & Safety",
    logo: "/assets/telegram.png",
    type: "platform",
    basis: "EU Digital Services Act",
    article: "Art. 16 — Illegal content notice",
    action: "Remove credential exfiltration bots and associated channels",
    risk: "critical",
  },
  {
    id: "ofcom",
    name: "Ofcom (UK)",
    type: "regulatory",
    basis: "Online Safety Act 2023",
    article: "s. 64 — Record-keeping obligation",
    action: "File incident record — mandatory under UK OSA for regulated services",
    risk: "high",
  },
  {
    id: "meta",
    name: "Meta Trust & Safety",
    logo: "/assets/meta.png",
    type: "platform",
    basis: "EU Digital Services Act",
    article: "Art. 16 / UK OSA s. 179",
    action: "Remove sponsored posts and Marketplace listings distributing malicious URLs",
    risk: "high",
  },
  {
    id: "ftc",
    name: "FTC (COPPA Bureau)",
    type: "regulatory",
    basis: "COPPA",
    article: "15 U.S.C. § 6502",
    action: "File notice — minor data collection identified without verifiable parental consent",
    risk: "high",
  },
  {
    id: "discord",
    name: "Discord Trust & Safety",
    logo: "/assets/discord.png",
    type: "platform",
    basis: "EU Digital Services Act",
    article: "Art. 16",
    action: "Takedown credential resale servers and downstream ATO accounts",
    risk: "medium",
  },
  {
    id: "eu-dsc",
    name: "EU Digital Services Coordinator",
    type: "regulatory",
    basis: "EU Digital Services Act",
    article: "Art. 17 — Statement of reasons",
    action: "Submit statement of reasons for all content removal actions taken",
    risk: "medium",
  },
  {
    id: "google",
    name: "Google / Firebase",
    logo: "/assets/google.png",
    type: "platform",
    basis: "EU Digital Services Act",
    article: "Art. 16 — Data store takedown",
    action: "Remove credential dumps stored in Firebase Realtime Database",
    risk: "medium",
  },
];

const RISK_STYLES = {
  critical: { badge: "bg-rose-50 text-rose-600 border-rose-200", dot: "bg-rose-500", bar: "bg-rose-500" },
  high: { badge: "bg-orange-50 text-orange-500 border-orange-200", dot: "bg-orange-500", bar: "bg-orange-400" },
  medium: { badge: "bg-blue-50 text-blue-600 border-blue-200", dot: "bg-blue-400", bar: "bg-blue-400" },
};

type Status = "idle" | "sending" | "sent";

function ref(): string {
  return `REF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function RecipientRow({
  r,
  selected,
  status,
  sentRef,
  sentAt,
  onToggle,
}: {
  r: Recipient;
  selected: boolean;
  status: Status;
  sentRef?: string;
  sentAt?: string;
  onToggle: (id: string) => void;
}) {
  const s = RISK_STYLES[r.risk];
  const isSent = status === "sent";
  const isSending = status === "sending";

  return (
    <motion.div
      layout
      className={`border rounded-xl p-4 transition-all duration-300 ${
        isSent
          ? "border-emerald-200 bg-emerald-50/40"
          : selected
          ? "border-blue-200 bg-blue-50/20"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox / status */}
        <div className="shrink-0 pt-0.5">
          {isSent ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          ) : isSending ? (
            <div className="w-5 h-5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
          ) : r.mandatory ? (
            <div className="w-5 h-5 rounded bg-rose-50 border border-rose-300 flex items-center justify-center cursor-not-allowed" title="Mandatory — cannot deselect">
              <svg className="w-2.5 h-2.5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          ) : (
            <button
              onClick={() => onToggle(r.id)}
              className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                selected ? "bg-blue-600 border-blue-600" : "border-slate-300 hover:border-blue-400"
              }`}
            >
              {selected && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Logo / icon */}
        <div className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
          {r.logo ? (
            <Image src={r.logo} alt={r.name} width={22} height={22} className="object-contain" />
          ) : (
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <p className="text-sm font-semibold text-slate-900 leading-snug">{r.name}</p>
              <p className="font-mono text-[10px] text-slate-400 mt-0.5">{r.article}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {r.mandatory && (
                <span className="font-mono text-[9px] text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-full uppercase tracking-wide font-semibold">
                  Mandatory
                </span>
              )}
              <span className={`font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${s.badge}`}>
                {r.risk}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{r.action}</p>

          {isSent && sentRef && sentAt && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 pt-2 border-t border-emerald-200 flex items-center gap-3 flex-wrap"
            >
              <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Dispatched
              </span>
              <span className="font-mono text-[10px] text-slate-500">{sentAt} UTC</span>
              <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{sentRef}</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function DispatchTab() {
  const mandatoryIds = RECIPIENTS.filter((r) => r.mandatory).map((r) => r.id);
  const [selected, setSelected] = useState<Set<string>>(new Set(mandatoryIds));
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [refs, setRefs] = useState<Record<string, string>>({});
  const [times, setTimes] = useState<Record<string, string>>({});
  const [isDispatching, setIsDispatching] = useState(false);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const selectAll = () => setSelected(new Set(RECIPIENTS.map((r) => r.id)));

  const dispatch = useCallback(async () => {
    if (isDispatching) return;
    setIsDispatching(true);
    const targets = [...selected];
    for (let i = 0; i < targets.length; i++) {
      const id = targets[i];
      await new Promise<void>((res) => setTimeout(res, i * 400));
      setStatuses((p) => ({ ...p, [id]: "sending" }));
      await new Promise<void>((res) => setTimeout(res, 750));
      setStatuses((p) => ({ ...p, [id]: "sent" }));
      setRefs((p) => ({ ...p, [id]: ref() }));
      setTimes((p) => ({ ...p, [id]: new Date().toISOString().slice(11, 19) }));
    }
    setIsDispatching(false);
  }, [isDispatching, selected]);

  const sentCount = Object.values(statuses).filter((s) => s === "sent").length;
  const allSent = sentCount > 0 && sentCount === selected.size;
  const platforms = RECIPIENTS.filter((r) => r.type === "platform");
  const regulatory = RECIPIENTS.filter((r) => r.type === "regulatory");

  return (
    <div className="space-y-5">
      {/* Incident summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-semibold text-slate-900">Dispatching report for</p>
              <span className="font-mono text-xs text-slate-500">CPAR-DET-260602-D10D671</span>
            </div>
            <p className="text-xs text-slate-400">
              Harm type: Credential phishing + CSEA signals · Severity 9/10 · {selected.size} recipient{selected.size !== 1 ? "s" : ""} selected · {sentCount} dispatched
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!allSent && (
              <button
                onClick={selectAll}
                disabled={isDispatching}
                className="text-xs font-medium text-slate-600 border border-slate-200 px-4 py-2 rounded-full hover:bg-slate-50 transition-all disabled:opacity-40"
              >
                Select all
              </button>
            )}
            <button
              onClick={dispatch}
              disabled={isDispatching || selected.size === 0 || allSent}
              className="flex items-center gap-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2 rounded-full transition-all shadow-sm"
            >
              {isDispatching ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Dispatching…
                </>
              ) : allSent ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  All sent
                </>
              ) : (
                <>
                  Dispatch {selected.size > 0 && `(${selected.size})`}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* NCMEC mandatory notice */}
        <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 mt-4">
          <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <p className="text-xs font-semibold text-rose-700">NCMEC CyberTipline — mandatory reporting triggered</p>
            <p className="text-xs text-rose-600 mt-0.5 leading-relaxed">
              Child safety signals detected. Under 18 U.S.C. § 2258A (REPORT Act 2024), ESPs with actual knowledge must report to NCMEC as soon as reasonably possible. Pre-populated and ready to transmit.
            </p>
          </div>
        </div>
      </div>

      {/* Regulatory filings */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
          </svg>
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-widest">Regulatory filings</p>
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400">{regulatory.length} bodies</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {regulatory.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <RecipientRow
                r={r}
                selected={selected.has(r.id)}
                status={statuses[r.id] ?? "idle"}
                sentRef={refs[r.id]}
                sentAt={times[r.id]}
                onToggle={toggle}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Platform notifications */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" />
            <path strokeLinecap="round" d="M12 7v4M6.5 17.5l4-3.5M17.5 17.5l-4-3.5" />
          </svg>
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-widest">Platform notifications</p>
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400">{platforms.length} platforms</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {platforms.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 + 0.2 }}>
              <RecipientRow
                r={r}
                selected={selected.has(r.id)}
                status={statuses[r.id] ?? "idle"}
                sentRef={refs[r.id]}
                sentAt={times[r.id]}
                onToggle={toggle}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Success summary */}
      <AnimatePresence>
        {allSent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white border border-emerald-200 rounded-2xl p-5 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                {sentCount} report{sentCount !== 1 ? "s" : ""} dispatched successfully
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                All transmissions logged to compliance audit trail · SHA-256 sealed · DSA Art. 17 compliant
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
