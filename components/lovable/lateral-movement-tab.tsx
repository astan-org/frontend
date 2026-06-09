"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const CHAIN = [
  {
    stage: "01",
    label: "App built on Lovable",
    role: "Threat actor entry point",
    desc: "Threat actor uses Lovable's AI builder to rapidly deploy a convincing phishing app — legitimate subdomain, free SSL, zero infrastructure cost.",
    icon: (
      <Image
        src="/assets/lovable-icon-bg-light.png"
        alt="Lovable"
        width={28}
        height={28}
        className="rounded-md object-cover"
      />
    ),
    num: "text-amber-500",
    label_color: "text-slate-900",
    iconBg: "bg-amber-50 border-amber-100",
    glow: "rgba(245,158,11,0.22)",
  },
  {
    stage: "02",
    label: "Email / SMS Blast",
    role: "Distribution vector",
    desc: "Malicious lovable.app URLs blasted via phishing emails and SMS. Legitimate domain reputation bypasses filters.",
    icon: (
      <svg
        className="w-6 h-6 text-orange-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    num: "text-orange-500",
    label_color: "text-slate-900",
    iconBg: "bg-orange-50 border-orange-100",
    glow: "rgba(249,115,22,0.22)",
  },
  {
    stage: "03",
    label: "Victim Interaction",
    role: "Credential harvest",
    desc: "Victim enters credentials, card data, or personal info on the convincing Lovable-hosted page.",
    icon: (
      <svg
        className="w-6 h-6 text-slate-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
    num: "text-slate-400",
    label_color: "text-slate-900",
    iconBg: "bg-slate-50 border-slate-100",
    glow: "rgba(148,163,184,0.28)",
  },
  {
    stage: "04",
    label: "Telegram Exfil",
    role: "Live data stream",
    desc: "Stolen data routed in real-time to attacker Telegram bots. Confirmed across 3 active campaigns.",
    icon: (
      <Image
        src="/assets/telegram.png"
        alt="Telegram"
        width={28}
        height={28}
        className="rounded-md object-contain"
      />
    ),
    num: "text-sky-500",
    label_color: "text-slate-900",
    iconBg: "bg-sky-50 border-sky-100",
    glow: "rgba(14,165,233,0.22)",
  },
  {
    stage: "05",
    label: "Account Takeover",
    role: "Lateral spread",
    desc: "Harvested credentials used for ATO across social, gaming, and banking. Templates remain publicly remixable.",
    icon: (
      <svg
        className="w-6 h-6 text-rose-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
    num: "text-rose-500",
    label_color: "text-slate-900",
    iconBg: "bg-rose-50 border-rose-100",
    glow: "rgba(239,68,68,0.22)",
  },
];

const PLATFORMS = [
  {
    name: "Telegram",
    logo: "/assets/telegram.png",
    role: "Primary exfil sink",
    risk: "critical" as const,
    stat: "3 active campaigns",
    detail:
      "Stolen credentials and card data routed live to Telegram bots controlled by threat actors.",
  },
  {
    name: "Meta (Facebook/Instagram)",
    logo: "/assets/meta.png",
    role: "Distribution vector",
    risk: "high" as const,
    stat: "Classiscam cross-posts",
    detail:
      "Malicious lovable.app URLs spread via Facebook Marketplace and sponsored Instagram posts.",
  },
  {
    name: "Discord",
    logo: "/assets/discord.png",
    role: "Credential resale hub",
    risk: "medium" as const,
    stat: "Low-level actor network",
    detail:
      "Stolen gaming credentials traded on Discord servers; downstream ATO victim platform.",
  },
  {
    name: "Roblox",
    logo: "/assets/roblox.png",
    role: "Child safety risk",
    risk: "critical" as const,
    stat: "NCMEC filing triggered",
    detail:
      "Children targeted via Roblox → Discord grooming chains. CSEA signals in incident cluster.",
  },
  {
    name: "WhatsApp / SMS",
    logo: "/assets/whatsapp.png",
    role: "Smishing delivery",
    risk: "high" as const,
    stat: "Multi-vector",
    detail:
      "Lovable URLs observed in investment fraud and banking credential phishing SMS campaigns.",
  },
  {
    name: "Google / Firebase",
    logo: "/assets/google.png",
    role: "Secondary data store",
    risk: "medium" as const,
    stat: "Credential dumps",
    detail:
      "Some kits write captured credentials to Firebase Realtime Database alongside Telegram.",
  },
];

const RISK = {
  critical: {
    badge: "bg-rose-50 text-rose-600 border-rose-200",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
  },
  high: {
    badge: "bg-orange-50 text-orange-500 border-orange-200",
    dot: "bg-orange-500",
    bar: "bg-orange-500",
  },
  medium: {
    badge: "bg-blue-50 text-blue-600 border-blue-200",
    dot: "bg-blue-400",
    bar: "bg-blue-400",
  },
};

const SEVERITY_WIDTH = { critical: "w-4/5", high: "w-3/5", medium: "w-2/5" };

export default function LateralMovementTab() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {/* Downstream platforms */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="5" r="2" />
            <circle cx="5" cy="19" r="2" />
            <circle cx="19" cy="19" r="2" />
            <path
              strokeLinecap="round"
              d="M12 7v4M6.5 17.5l4-3.5M17.5 17.5l-4-3.5"
            />
          </svg>
          <h3 className="text-sm font-semibold text-slate-900">
            Downstream Platforms
          </h3>
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400">6 implicated</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PLATFORMS.map((p, i) => {
            const r = RISK[p.risk];
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.3 }}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:bg-white hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-white rounded-xl border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                    <Image
                      src={p.logo}
                      alt={p.name}
                      width={22}
                      height={22}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 leading-tight truncate">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                      {p.role}
                    </p>
                  </div>
                  <span
                    className={`font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border shrink-0 ${r.badge}`}
                  >
                    {p.risk}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  {p.detail}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${r.dot}`} />
                    <span className="font-mono text-[10px] text-slate-400">
                      {p.stat}
                    </span>
                  </div>
                  <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${r.bar} ${SEVERITY_WIDTH[p.risk]} rounded-full`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Attack chain */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <svg
            className="w-4 h-4 text-slate-400"
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
          <h3 className="text-sm font-semibold text-slate-900">Attack Chain</h3>
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400">
            5 stages · lovable.app origin
          </span>
        </div>

        {/* Desktop horizontal */}
        <div
          className="hidden md:flex items-start overflow-x-auto gap-0"
          style={
            {
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            } as React.CSSProperties
          }
        >
          {CHAIN.map((node, i) => (
            <div key={node.stage} className="flex items-start shrink-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.09, duration: 0.3, ease: "easeOut" }}
                onMouseEnter={() => setHovered(node.stage)}
                onMouseLeave={() => setHovered(null)}
                className="w-[190px] bg-white border border-slate-100 rounded-2xl p-4 cursor-default"
                style={{
                  boxShadow:
                    hovered === node.stage
                      ? `0 10px 36px -6px ${node.glow}, 0 2px 8px -2px rgba(0,0,0,0.06)`
                      : "0 1px 4px rgba(0,0,0,0.05)",
                  transform:
                    hovered === node.stage
                      ? "translateY(-3px)"
                      : "translateY(0)",
                  transition: "box-shadow 0.25s ease, transform 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 border rounded-xl flex items-center justify-center shrink-0 ${node.iconBg}`}
                  >
                    {node.icon}
                  </div>
                  <div className="min-w-0">
                    <span
                      className={`font-mono text-[9px] font-bold uppercase tracking-widest ${node.num}`}
                    >
                      {node.stage}
                    </span>
                    <p className="text-sm font-semibold text-slate-900 leading-tight truncate">
                      {node.label}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {node.role}
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {hovered === node.stage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="border-t border-slate-100 pt-3">
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {node.desc}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {i < CHAIN.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.09 + 0.18 }}
                  className="pt-5 px-2 shrink-0"
                >
                  <svg
                    width="24"
                    height="14"
                    viewBox="0 0 24 14"
                    fill="none"
                    className="text-slate-300"
                  >
                    <line
                      x1="0"
                      y1="7"
                      x2="16"
                      y2="7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                    />
                    <polyline
                      points="12,3 20,7 12,11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile vertical */}
        <div className="md:hidden space-y-2">
          {CHAIN.map((node, i) => (
            <div key={node.stage}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3 shadow-sm"
              >
                <div
                  className={`w-9 h-9 border rounded-xl flex items-center justify-center shrink-0 ${node.iconBg}`}
                >
                  {node.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[9px] font-bold ${node.num}`}
                    >
                      {node.stage}
                    </span>
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {node.label}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{node.role}</p>
                </div>
              </motion.div>
              {i < CHAIN.length - 1 && (
                <div className="flex justify-center py-1">
                  <svg
                    width="12"
                    height="16"
                    viewBox="0 0 12 16"
                    fill="none"
                    className="text-slate-300"
                  >
                    <line
                      x1="6"
                      y1="0"
                      x2="6"
                      y2="10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                    />
                    <polyline
                      points="2,7 6,13 10,7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
