"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const LAW_STATUS = [
  {
    law: "DSA Art. 16",
    desc: "Illegal content notice",
    status: "compliant" as const,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    law: "DSA Art. 17",
    desc: "Statement of reasons",
    status: "compliant" as const,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    law: "REPORT Act",
    desc: "18 U.S.C. § 2258A",
    status: "compliant" as const,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  {
    law: "UK OSA s. 64",
    desc: "Record-keeping",
    status: "compliant" as const,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    law: "COPPA § 6502",
    desc: "Parental consent",
    status: "required" as const,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  {
    law: "GDPR Art. 33",
    desc: "Breach notification",
    status: "required" as const,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
];

const AUDIT_ENTRIES = [
  {
    id: "AUD-0001",
    ts: "2026-06-09 08:14:22",
    law: "REPORT Act 2024",
    article: "18 U.S.C. § 2258A",
    actor: "CPAR/Compliance",
    action: "NCMEC CyberTipline report filed — child safety signals (CSEA) detected in incident cluster originating from a Lovable-built app",
    status: "compliant" as const,
    hash: "3a7f2c…d9e1",
    color: "rose" as const,
  },
  {
    id: "AUD-0002",
    ts: "2026-06-09 08:15:03",
    law: "EU Digital Services Act",
    article: "Art. 16",
    actor: "CPAR/Dispatcher",
    action: "Illegal content notice dispatched to Telegram — credential exfiltration bot identified across 3 campaigns",
    status: "compliant" as const,
    hash: "b81c4a…0f23",
    color: "blue" as const,
  },
  {
    id: "AUD-0003",
    ts: "2026-06-09 08:15:44",
    law: "EU Digital Services Act",
    article: "Art. 17",
    actor: "CPAR/Compliance",
    action: "Statement of reasons generated — harm: credential phishing, severity 9/10, DSA compliant",
    status: "compliant" as const,
    hash: "e44d9b…a7c1",
    color: "blue" as const,
  },
  {
    id: "AUD-0004",
    ts: "2026-06-09 08:16:11",
    law: "Online Safety Act 2023",
    article: "s. 64",
    actor: "CPAR/Compliance",
    action: "UK record-keeping obligation satisfied — incident logged with full evidence chain and dispatch confirmation",
    status: "compliant" as const,
    hash: "f12e8c…3d55",
    color: "violet" as const,
  },
  {
    id: "AUD-0005",
    ts: "2026-06-09 08:22:30",
    law: "COPPA",
    article: "15 U.S.C. § 6502",
    actor: "ANALYST-IGR",
    action: "Minor data collection without verifiable parental consent — FTC filing required · action pending",
    status: "required" as const,
    hash: "cc73d1…9f04",
    color: "amber" as const,
  },
  {
    id: "AUD-0006",
    ts: "2026-06-09 08:22:45",
    law: "EU GDPR",
    article: "Art. 33",
    actor: "ANALYST-IGR",
    action: "Data breach notification — 72h DPA reporting window active. PII exposed via CVE-2025-48757. Action required.",
    status: "required" as const,
    hash: "5d84a0…b3e8",
    color: "amber" as const,
  },
  {
    id: "AUD-0007",
    ts: "2026-06-09 08:23:01",
    law: "Audit Integrity",
    article: "SHA-256 Seal",
    actor: "CPAR/Compliance",
    action: "Audit record sealed — SHA-256 content hash anchored. DSA Art. 17 compliant.",
    status: "sealed" as const,
    hash: "a91b3f…7c2e",
    color: "emerald" as const,
  },
];

const STATUS_STYLES = {
  compliant: "bg-emerald-50 text-emerald-700 border-emerald-200",
  required: "bg-amber-50 text-amber-700 border-amber-200",
  sealed: "bg-blue-50 text-blue-700 border-blue-200",
};

const ENTRY_COLORS = {
  rose: { dot: "bg-rose-500", text: "text-rose-400" },
  blue: { dot: "bg-blue-500", text: "text-blue-400" },
  violet: { dot: "bg-violet-500", text: "text-violet-400" },
  amber: { dot: "bg-amber-500", text: "text-amber-400" },
  emerald: { dot: "bg-emerald-500", text: "text-emerald-400" },
};

function handleDownload() {
  const payload = {
    incident_id: "CPAR-DET-260602-D10D671",
    generated_at_utc: new Date().toISOString(),
    source: "lovable.app",
    compliance: {
      "DSA-Art-16": "COMPLIANT",
      "DSA-Art-17": "COMPLIANT",
      "REPORT-Act-2024": "COMPLIANT",
      "UK-OSA-s64": "COMPLIANT",
      "COPPA-6502": "ACTION_REQUIRED",
      "GDPR-Art-33": "ACTION_REQUIRED",
    },
    audit_entries: AUDIT_ENTRIES,
    seal: { algorithm: "SHA-256", status: "SEALED" },
    spec_version: "v0.2",
    platform: "CPAR · Astan",
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "CPAR-DET-260602-D10D671-audit.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ComplianceAuditTab() {
  const [visibleCount, setVisibleCount] = useState(0);
  const terminalBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(0);
    const timers = AUDIT_ENTRIES.map((_, i) =>
      setTimeout(() => setVisibleCount(i + 1), i * 130)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTo({ top: terminalBodyRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [visibleCount]);

  const compliantCount = LAW_STATUS.filter((l) => l.status === "compliant").length;
  const requiredCount = LAW_STATUS.filter((l) => l.status === "required").length;

  return (
    <div className="space-y-5">
      {/* Compliance status overview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 className="text-sm font-semibold text-slate-900">Regulatory Compliance Status</h3>
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-emerald-600 font-medium">{compliantCount} compliant</span>
          <span className="text-slate-300">·</span>
          <span className="text-xs text-amber-600 font-medium">{requiredCount} action required</span>
        </div>
        <p className="text-xs text-slate-400 mb-4">Each obligation satisfied by actions recorded in the audit log below</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {LAW_STATUS.map((l, i) => (
            <motion.div
              key={l.law}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`border rounded-xl p-3.5 flex items-start gap-3 ${
                l.status === "compliant"
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className={`mt-0.5 shrink-0 ${l.status === "compliant" ? "text-emerald-500" : "text-amber-500"}`}>
                {l.icon}
              </div>
              <div>
                <p className={`font-mono text-xs font-bold ${l.status === "compliant" ? "text-emerald-800" : "text-amber-800"}`}>
                  {l.law}
                </p>
                <p className={`text-[10px] mt-0.5 ${l.status === "compliant" ? "text-emerald-600" : "text-amber-600"}`}>
                  {l.desc}
                </p>
                <p className={`text-[10px] font-semibold mt-1 uppercase tracking-wide ${l.status === "compliant" ? "text-emerald-600" : "text-amber-600"}`}>
                  {l.status === "compliant" ? "✓ Compliant" : "⚠ Action required"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Audit log */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-sm font-semibold text-slate-900">Immutable Audit Log</h3>
          <div className="flex-1 h-px bg-slate-100" />
          <span className="font-mono text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            ● SHA-256 Sealed
          </span>
        </div>

        <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-800">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
            </div>
            <span className="font-mono text-[10px] text-slate-500 ml-2 truncate">
              <span className="hidden sm:inline">CPAR-DET-260602-D10D671 · </span>compliance-audit.log
            </span>
            <div className="flex-1" />
            <span className="font-mono text-[10px] text-slate-600">{AUDIT_ENTRIES.length} entries</span>
          </div>

          {/* Entries */}
          <div ref={terminalBodyRef} className="p-5 space-y-0 max-h-[380px] overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}>
            {AUDIT_ENTRIES.slice(0, visibleCount).map((entry) => {
              const c = ENTRY_COLORS[entry.color];
              return (
                <div
                  key={entry.id}
                  className="flex gap-4 py-3.5 border-b border-slate-800/50 last:border-0 animate-in fade-in slide-in-from-left-1 duration-200"
                >
                  <div className="flex flex-col items-center shrink-0 pt-1.5">
                    <div className={`w-2 h-2 rounded-full ${c.dot} shrink-0`} />
                    <div className="w-px flex-1 mt-2 bg-slate-700" />
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1.5">
                      <span className="font-mono text-[10px] text-slate-500 shrink-0">{entry.ts}</span>
                      <span className={`font-mono text-[10px] font-bold shrink-0 ${c.text}`}>{entry.article}</span>
                      <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wide font-semibold shrink-0 ${STATUS_STYLES[entry.status]}`}>
                        {entry.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-2">{entry.action}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[10px] text-cyan-400">{entry.actor}</span>
                      <span className="font-mono text-[10px] text-slate-600">SHA-256: {entry.hash}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {visibleCount < AUDIT_ENTRIES.length && (
              <p className="font-mono text-xs text-slate-600 py-3 px-1 animate-pulse">
                Generating record…
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 mt-4 flex-wrap">
          <p className="text-xs text-slate-400 max-w-[52ch] leading-relaxed">
            Generated in accordance with{" "}
            <span className="font-medium text-slate-600">EU Digital Services Act, Article 17</span>. Record retained for statutory period. SHA-256 sealed.
          </p>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-full px-5 py-2 transition-all shadow-sm shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download audit bundle
          </button>
        </div>
      </div>
    </div>
  );
}
