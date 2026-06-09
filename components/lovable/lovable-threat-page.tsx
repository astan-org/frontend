"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LateralMovementTab from "./lateral-movement-tab";
import DispatchTab from "./dispatch-tab";
import ComplianceAuditTab from "./compliance-audit-tab";

const TABS = [
  {
    id: "lateral",
    label: "Lateral Movement",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 7l5 5m0 0l-5 5m5-5H6"
        />
      </svg>
    ),
  },
  {
    id: "dispatch",
    label: "Report Dispatch",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
        />
      </svg>
    ),
  },
  {
    id: "audit",
    label: "Compliance Audit",
    icon: (
      <svg
        className="w-4 h-4"
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
    ),
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

const HERO_STATS = [
  {
    label: "Apps flagged",
    value: "~18%",
    sub: "of published projects",
    color: "text-rose-600",
  },
  {
    label: "Malicious URLs",
    value: "100k+",
    sub: "per month at peak",
    color: "text-orange-600",
  },
  {
    label: "VibeScamming score",
    value: "1.8/10",
    sub: "lowest AI builder score",
    color: "text-rose-600",
  },
  {
    label: "CVE severity",
    value: "8.26",
    sub: "CVE-2025-48757",
    color: "text-amber-600",
  },
];

export default function LovableThreatPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("lateral");

  return (
    <div className="pb-16 space-y-0">
      {/* Top nav bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors shrink-0"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          CPAR Dashboard
        </button>
        <div className="w-px h-4 bg-slate-200 shrink-0" />
        <span className="font-mono text-[10px] text-slate-400">
          CPAR-DET-260602-D10D671
        </span>
        <div className="flex-1" />
        <span className="font-mono text-[10px] text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
          ● Critical
        </span>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Live
        </div>
      </div>

      {/* Pill tab bar */}
      <div
        className="flex items-center bg-slate-100 rounded-full p-1 mb-6 w-fit gap-0.5"
        style={{ marginBottom: 20 }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap z-10 ${
              activeTab === tab.id
                ? "text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="pill-bg"
                className="absolute inset-0 bg-white rounded-full shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Hero — only on lateral movement tab */}
      <AnimatePresence>
        {activeTab === "lateral" && (
          <motion.div
            key="hero"
            initial={{ opacity: 0, y: -12, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto", marginBottom: 24 }}
            exit={{ opacity: 0, y: -12, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 rounded-2xl p-5 sm:p-6 shadow-lg overflow-hidden relative">
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, white 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                }}
              />
              <div className="relative flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-sm">
                  <Image
                    src="/assets/lovable-icon-bg-light.png"
                    alt="Lovable"
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-semibold text-white mb-1">
                    Lovable.app — Cross-Platform Harm Campaign
                  </h1>
                  <p className="text-sm text-white/65 leading-relaxed">
                    Lovable AI builder weaponised to generate phishing kits at
                    scale. Harm spreading across 6 platforms via credential
                    exfiltration, social engineering, and child-safety attack
                    chains.
                  </p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                  {["6 platforms", "NCMEC filed", "DSA Art. 17"].map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[10px] text-white/60 bg-white/10 border border-white/20 px-2.5 py-1 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/20">
                {HERO_STATS.map((s) => (
                  <div
                    key={s.label}
                    className="bg-white/10 rounded-xl p-3 border border-white/10"
                  >
                    <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">
                      {s.label}
                    </p>
                    <p className="text-xl font-semibold text-white">
                      {s.value}
                    </p>
                    <p className="text-[10px] text-white/45 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {activeTab === "lateral" && <LateralMovementTab />}
          {activeTab === "dispatch" && <DispatchTab />}
          {activeTab === "audit" && <ComplianceAuditTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
