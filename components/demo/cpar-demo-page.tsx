"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import type {
  CPARResult,
  DemoState,
  IncidentInput,
  PlatformStatus,
  SourceMode,
} from "./types";
import { classify } from "./classifier";
import { NCMEC, CHART_DATA } from "./constants";
import VolumeChart from "./volume-chart";
import IncidentInputForm from "./incident-input";
import ClassificationCard from "./classification-card";
import PlatformDispatch from "./platform-dispatch";
import AuditTrail from "./audit-trail";
import DetectedFeed from "./detected-feed";

type Step = "dashboard" | "input" | "results" | "audit";

function extractStreamingReasoning(buf: string): string {
  const keyIdx = buf.indexOf('"ai_reasoning"');
  if (keyIdx === -1) return '';
  const afterKey = buf.slice(keyIdx + '"ai_reasoning"'.length);
  const colonMatch = afterKey.match(/^\s*:\s*"/);
  if (!colonMatch) return '';
  const valueStart = afterKey.slice(colonMatch[0].length);
  let result = '';
  for (let i = 0; i < valueStart.length; i++) {
    if (valueStart[i] === '\\' && i + 1 < valueStart.length) {
      const next = valueStart[i + 1];
      if (next === 'n') { result += '\n'; i++; }
      else if (next === 't') { result += '\t'; i++; }
      else if (next === '"') { result += '"'; i++; }
      else if (next === '\\') { result += '\\'; i++; }
      else { result += next; i++; }
    } else if (valueStart[i] === '"') {
      break;
    } else {
      result += valueStart[i];
    }
  }
  return result;
}

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
  changeKey,
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  delta?: string;
  iconBg: string;
  icon: React.ReactNode;
  changeKey?: React.Key;
}) {
  const controls = useAnimation();
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    void controls.start({
      scale: [1, 0.9, 1],
      opacity: [1, 0.28, 1],
      transition: { duration: 0.38, times: [0, 0.4, 1], ease: "easeInOut" },
    });
  }, [changeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 flex flex-col justify-between min-h-[110px] sm:min-h-[136px]">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <motion.p
          animate={controls}
          className="text-3xl font-semibold text-slate-900 flex items-baseline gap-2 leading-none tabular-nums"
        >
          {value}
          {delta && (
            <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {delta}
            </span>
          )}
        </motion.p>
        <p className="font-mono text-[10px] text-slate-400 mt-1.5 uppercase tracking-wide">
          {sub}
        </p>
      </div>
    </div>
  );
}

export default function CparDemoPage() {
  const [step, setStep] = useState<Step>("dashboard");
  const [sourceMode, setSourceMode] = useState<SourceMode>("user");
  const [demoState, setDemoState] = useState<DemoState>("idle");
  const [result, setResult] = useState<CPARResult | null>(null);
  const [platformStates, setPlatformStates] = useState<
    Record<string, PlatformStatus>
  >({});
  const [dispatchComplete, setDispatchComplete] = useState(false);
  const [sourcePlatform, setSourcePlatform] = useState("");

  const [streamingReasoning, setStreamingReasoning] = useState('');

  const [liveCount, setLiveCount] = useState(3247);
  const [ncmecCount, setNcmecCount] = useState(142);
  const [detectedToday, setDetectedToday] = useState(0);
  const [medianTime, setMedianTime] = useState("2.4s");
  const [chartData, setChartData] = useState(() => [...CHART_DATA]);

  const isRunning = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleSubmit = async (input: IncidentInput) => {
    if (isRunning.current) return;
    isRunning.current = true;

    setDemoState("loading");
    setResult(null);
    setStreamingReasoning('');
    setPlatformStates({});
    setDispatchComplete(false);
    setSourcePlatform(input.platform);
    setStep("results");

    let classification: CPARResult;
    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok || !res.body) throw new Error("api failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const reasoning = extractStreamingReasoning(buffer);
        if (reasoning) setStreamingReasoning(reasoning);
      }

      const cleaned = buffer.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      const json = JSON.parse(cleaned);
      if (json.error) throw new Error(json.error);
      classification = json as CPARResult;
    } catch {
      classification = classify(input);
    }
    setStreamingReasoning('');

    const incidentId = `CPAR-INC-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 900 + 100)}`;
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
    setStep("dashboard");
    setDemoState("idle");
    setResult(null);
    setStreamingReasoning('');
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
        {/* ── DASHBOARD ── */}
        {step === "dashboard" && (
          <motion.div
            key="dashboard"
            {...page}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Header */}
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
                  Cross-Platform AI Response · Live Command Center
                </p>
              </div>
              <button
                onClick={() => setStep("input")}
                className="flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all shadow-sm"
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
                    d="M12 5v14M5 12h14"
                  />
                </svg>
                Submit Report
              </button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                label="Incidents Dispatched"
                value={liveCount.toLocaleString()}
                sub="Cross-platform · last 24h"
                delta={`+${liveCount - 3223} today`}
                iconBg="bg-blue-50"
                changeKey={liveCount}
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
                label="Platforms Connected"
                value="6"
                sub="TikTok · Meta · Discord · more"
                iconBg="bg-violet-50"
                icon={
                  <svg
                    className="w-5 h-5 text-violet-600"
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
                }
              />
              <StatCard
                label="Median Response"
                value={medianTime}
                sub="Classify → dispatch"
                delta="↓18%"
                changeKey={medianTime}
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
              <StatCard
                label="NCMEC Reports"
                value={ncmecCount}
                sub="Filed today · mandatory"
                iconBg="bg-rose-50"
                changeKey={ncmecCount}
                icon={
                  <svg
                    className="w-5 h-5 text-rose-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    />
                  </svg>
                }
              />
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
              {/* Left: chart + submit CTA */}
              <div className="md:col-span-3 space-y-4">
                <VolumeChart data={chartData} />

                {/* Submit CTA */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Submit a Cross-Platform Report
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Classified by Claude AI in ~2s · dispatched across all
                      relevant platforms automatically
                    </p>
                  </div>
                  <button
                    onClick={() => setStep("input")}
                    className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 border border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-full transition-all"
                  >
                    Submit Report
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Compliance badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                    Compliance:
                  </span>
                  {[
                    "EU DSA · Art.17",
                    "COPPA",
                    "NCMEC · §2258A",
                    "FTC · §5",
                    "UK Online Safety Act",
                  ].map((b) => (
                    <span
                      key={b}
                      className="font-mono text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: detected feed */}
              <div className="md:col-span-2">
                <DetectedFeed
                  onIncident={(result) => {
                    setLiveCount((c) => c + 1);
                    if (result.ncmec_required) setNcmecCount((c) => c + 1);
                    setDetectedToday((n) => n + 1);
                    setMedianTime(`${(2.1 + Math.random() * 0.4).toFixed(1)}s`);
                    setChartData((prev) => {
                      const next = [...prev];
                      const last = next[next.length - 1];
                      next[next.length - 1] = { ...last, incidents: last.incidents + Math.floor(Math.random() * 6 + 3) };
                      return next;
                    });
                  }}
                />
              </div>
            </div>

            {/* Detected today footer note */}
            {detectedToday > 0 && (
              <p className="text-xs text-slate-400 text-right font-mono">
                <span className="font-medium text-slate-600">
                  {detectedToday}
                </span>{" "}
                auto-detected this session
              </p>
            )}
          </motion.div>
        )}

        {/* ── STAGE 01: Incident Input ── */}
        {step === "input" && (
          <motion.div
            key="input"
            {...page}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <PageNav
              back="Dashboard"
              onBack={() => setStep("dashboard")}
              step="STAGE 01"
              title="Incident Input"
              meta="Dual entry point — user / analyst"
            />
            <IncidentInputForm
              sourceMode={sourceMode}
              onSwitchMode={setSourceMode}
              onSubmit={handleSubmit}
              disabled={isProcessing}
              liveCount={liveCount}
            />
          </motion.div>
        )}

        {/* ── STAGE 02 · 03: Classification & Dispatch ── */}
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
              meta="claude-haiku-4-5 · live"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ClassificationCard
                result={result}
                isLoading={demoState === "loading"}
                streamingReasoning={streamingReasoning}
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

        {/* ── STAGE 04: Audit Trail ── */}
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
