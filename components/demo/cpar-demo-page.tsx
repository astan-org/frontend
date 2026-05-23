"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  CPARResult,
  DemoState,
  IncidentInput,
  PlatformStatus,
  SourceMode,
} from "./types";
import { classify } from "./classifier";
import { NCMEC } from "./constants";
import VolumeChart from "./volume-chart";
import IncidentInputForm from "./incident-input";
import ClassificationCard from "./classification-card";
import PlatformDispatch from "./platform-dispatch";
import AuditTrail from "./audit-trail";

type Step = "input" | "results" | "audit";

const page = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function PageNav({
  back,
  onBack,
  backDisabled,
  step,
  title,
  meta,
}: {
  back: string;
  onBack: () => void;
  backDisabled?: boolean;
  step: string;
  title: string;
  meta: string;
}) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <button
        onClick={onBack}
        disabled={backDisabled}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
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
        {back}
      </button>
      <div className="w-px h-4 bg-slate-200 shrink-0" />
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded uppercase tracking-wider shrink-0">
          {step}
        </span>
        <span className="text-base font-semibold text-slate-900 truncate">
          {title}
        </span>
        <div className="flex-1 h-px bg-slate-100 hidden sm:block" />
        <span className="text-xs text-slate-400 shrink-0 hidden sm:block">
          {meta}
        </span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  delta,
  iconBg,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  delta?: string;
  iconBg: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col justify-between min-h-[148px]">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className="text-3xl font-semibold text-slate-900 flex items-baseline gap-2 leading-none">
          {value}
          {delta && (
            <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {delta}
            </span>
          )}
        </p>
        <p className="font-mono text-[10px] text-slate-400 mt-1.5 uppercase tracking-wide">
          {sub}
        </p>
      </div>
    </div>
  );
}

export default function CparDemoPage() {
  const [step, setStep] = useState<Step>("input");
  const [sourceMode, setSourceMode] = useState<SourceMode>("user");
  const [demoState, setDemoState] = useState<DemoState>("idle");
  const [result, setResult] = useState<CPARResult | null>(null);
  const [platformStates, setPlatformStates] = useState<
    Record<string, PlatformStatus>
  >({});
  const [dispatchComplete, setDispatchComplete] = useState(false);
  const [liveCount, setLiveCount] = useState(3247);
  const [sourcePlatform, setSourcePlatform] = useState("");

  const isRunning = useRef(false);

  const handleSubmit = async (input: IncidentInput) => {
    if (isRunning.current) return;
    isRunning.current = true;

    setDemoState("loading");
    setResult(null);
    setPlatformStates({});
    setDispatchComplete(false);
    setSourcePlatform(input.platform);
    setStep("results");

    await new Promise<void>((r) => setTimeout(r, 2000));

    const classification = classify(input);
    const incidentId = `CPAR-INC-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Math.floor(
      Math.random() * 900 + 100,
    )}`;
    classification._id = incidentId;
    classification._time = new Date().toISOString().slice(11, 19) + " UTC";

    setResult(classification);
    setDemoState("classified");

    await new Promise<void>((r) => setTimeout(r, 600));
    setDemoState("dispatching");

    const targets = [
      ...classification.dispatch_targets,
      ...(classification.ncmec_required ? [NCMEC.name] : []),
    ];

    targets.forEach((name, i) => {
      setTimeout(() => {
        setPlatformStates((prev) => ({ ...prev, [name]: "notifying" }));
        setTimeout(() => {
          setPlatformStates((prev) => ({ ...prev, [name]: "complete" }));
        }, 900);
      }, i * 500);
    });

    const totalDispatch = (targets.length - 1) * 500 + 900 + 400;
    await new Promise<void>((r) => setTimeout(r, totalDispatch));

    setDispatchComplete(true);
    setDemoState("complete");
    setLiveCount((c) => c + 1);
    isRunning.current = false;
  };

  const handleReset = () => {
    isRunning.current = false;
    setStep("input");
    setDemoState("idle");
    setResult(null);
    setPlatformStates({});
    setDispatchComplete(false);
  };

  const isProcessing =
    demoState === "loading" ||
    demoState === "classified" ||
    demoState === "dispatching";

  return (
    <div className="pb-16">
      <AnimatePresence mode="wait">
        {/* ── PAGE 1: Incident Input ── */}
        {step === "input" && (
          <motion.div
            key="input"
            {...page}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                  CPAR
                </h1>
                <p className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Cross-Platform AI Response · live
                </p>
              </div>
              <p className="text-xs text-slate-400">
                <span className="font-mono font-semibold text-slate-700">
                  {liveCount.toLocaleString()}
                </span>{" "}
                incidents dispatched today
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <VolumeChart />
              </div>
              <StatCard
                label="Incidents dispatched"
                value={liveCount.toLocaleString()}
                sub="Cross-platform · last 24h"
                delta={`+${liveCount - 3223} today`}
                iconBg="bg-blue-50"
                icon={
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 2 3 7v6c0 5 4 9 9 10 5-1 9-5 9-10V7l-9-5z"
                    />
                  </svg>
                }
              />
              <StatCard
                label="Median response"
                value="2.4s"
                sub="Classify → Dispatch"
                delta="↓18%"
                iconBg="bg-cyan-50"
                icon={
                  <svg
                    className="w-5 h-5 text-cyan-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                }
              />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-[10px] text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded uppercase tracking-wider">
                  STAGE 01
                </span>
                <span className="text-base font-semibold text-slate-900">
                  Incident Input
                </span>
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400">
                  Dual entry point — user / analyst
                </span>
              </div>
              <IncidentInputForm
                sourceMode={sourceMode}
                onSwitchMode={setSourceMode}
                onSubmit={handleSubmit}
                disabled={isProcessing}
                liveCount={liveCount}
              />
            </div>
          </motion.div>
        )}

        {/* ── PAGE 2: Classification + Dispatch ── */}
        {step === "results" && (
          <motion.div
            key="results"
            {...page}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <PageNav
              back="New incident"
              onBack={handleReset}
              backDisabled={isProcessing}
              step="STAGE 02 · 03"
              title="Classification & Dispatch"
              meta="claude-sonnet-4 · simulated"
            />

            <div className="grid grid-cols-2 gap-4">
              <ClassificationCard
                result={result}
                isLoading={demoState === "loading"}
              />
              <PlatformDispatch
                result={result}
                platformStates={platformStates}
                isComplete={dispatchComplete}
                demoState={demoState}
              />
            </div>

            <AnimatePresence>
              {dispatchComplete && (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-end"
                >
                  <button
                    onClick={() => setStep("audit")}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white text-sm font-medium px-6 py-3 rounded-full transition-all shadow-sm"
                  >
                    View Audit Trail
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── PAGE 3: Audit Trail ── */}
        {step === "audit" && result && (
          <motion.div
            key="audit"
            {...page}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <PageNav
              back="Dispatch"
              onBack={() => setStep("results")}
              step="STAGE 04"
              title="Audit Trail"
              meta="DSA Article 17 compliant · SHA-256 sealed"
            />
            <AuditTrail
              result={result}
              sourceMode={sourceMode}
              sourcePlatform={sourcePlatform}
              onReset={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
