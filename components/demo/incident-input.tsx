'use client';

import { useState } from 'react';
import type { IncidentInput, SourceMode } from './types';
import { SCENARIOS } from './constants';

const USER_PLATFORMS = ['TikTok', 'Instagram', 'Discord', 'Roblox', 'Zoom', 'Snapchat'];
const HARM_CATEGORIES = ['Scam', 'Fake account', 'Harmful content', 'Safety concern', 'Child safety', 'Other'];

interface Props {
  sourceMode: SourceMode;
  onSwitchMode: (mode: SourceMode) => void;
  onSubmit: (input: IncidentInput) => void;
  disabled: boolean;
  liveCount: number;
}

export default function IncidentInput({ sourceMode, onSwitchMode, onSubmit, disabled, liveCount }: Props) {
  const [userPlatform, setUserPlatform] = useState('TikTok');
  const [userHarm, setUserHarm] = useState('Scam');
  const [userNote, setUserNote] = useState('');
  const [analystText, setAnalystText] = useState<string>(SCENARIOS[0].text);
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);

  const handleSwitchMode = (mode: SourceMode) => {
    if (mode === sourceMode || disabled) return;
    onSwitchMode(mode);
    setUserPlatform('TikTok');
    setUserHarm('Scam');
    setUserNote('');
    setSelectedScenario(null);
    setAnalystText(SCENARIOS[0].text);
  };

  const handleSubmit = () => {
    if (disabled) return;
    if (sourceMode === 'user') {
      const parts = [
        `Platform: ${userPlatform}`,
        `Harm type reported by user: ${userHarm}`,
        userNote.trim() ? `User note: ${userNote.trim()}` : null,
        'Report source: end user via platform native report flow',
      ].filter(Boolean);
      onSubmit({ text: parts.join('\n'), platform: userPlatform, harm: userHarm });
    } else {
      const text = analystText.trim();
      if (!text) return;
      onSubmit({ text, platform: 'Multi-platform', harm: null });
    }
  };

  const pickScenario = (i: number) => {
    setSelectedScenario(i);
    setAnalystText(SCENARIOS[i].text);
  };

  const selectClass =
    'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
  const textareaClass =
    'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      {/* Toggle + counter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-full gap-1">
          {(['user', 'analyst'] as SourceMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => handleSwitchMode(mode)}
              disabled={disabled}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 disabled:cursor-not-allowed ${
                sourceMode === mode
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  sourceMode === mode
                    ? mode === 'user' ? 'bg-cyan-400' : 'bg-blue-600'
                    : 'bg-slate-300'
                }`}
              />
              {mode === 'user' ? 'User Report' : 'Analyst Review'}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400">
          <span className="font-mono font-medium text-slate-700">{liveCount.toLocaleString()}</span>{' '}
          incidents dispatched today
        </p>
      </div>

      {/* User Report form */}
      {sourceMode === 'user' && (
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2">
                Platform
              </label>
              <select value={userPlatform} onChange={e => setUserPlatform(e.target.value)} className={selectClass}>
                {USER_PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2">
                Harm Category
              </label>
              <select value={userHarm} onChange={e => setUserHarm(e.target.value)} className={selectClass}>
                {HARM_CATEGORIES.map(h => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2">
                Note (optional)
              </label>
              <textarea
                value={userNote}
                onChange={e => setUserNote(e.target.value)}
                placeholder="Describe what happened, e.g. 'This account messaged me asking for gift cards'…"
                className={`${textareaClass} h-[72px]`}
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-5">
            <p className="text-xs text-slate-400">
              Report routes to CPAR · classified in ~2s · dispatched across platforms
            </p>
            <button
              onClick={handleSubmit}
              disabled={disabled}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-sm"
            >
              {disabled ? 'Processing…' : 'Submit Report'}
              {!disabled && <span aria-hidden>→</span>}
            </button>
          </div>
        </div>
      )}

      {/* Analyst Review form */}
      {sourceMode === 'analyst' && (
        <div>
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {SCENARIOS.map((s, i) => (
              <button
                key={i}
                onClick={() => pickScenario(i)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  selectedScenario === i
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white hover:-translate-y-px'
                }`}
              >
                <p
                  className={`text-[9px] font-mono uppercase tracking-wide mb-1 ${
                    selectedScenario === i ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  {s.tag}
                </p>
                <p className="text-xs font-medium text-slate-800 leading-snug">{s.title}</p>
              </button>
            ))}
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2">
              Custom Incident Description
            </label>
            <textarea
              value={analystText}
              onChange={e => setAnalystText(e.target.value)}
              placeholder="Paste or describe the incident in your own words…"
              className={`${textareaClass} h-24`}
            />
          </div>
          <div className="flex items-center justify-between mt-5">
            <p className="text-xs text-slate-400">
              Same classifier · same dispatch · audit trail logs analyst origin
            </p>
            <button
              onClick={handleSubmit}
              disabled={disabled}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-sm"
            >
              {disabled ? 'Processing…' : 'Analyze & Dispatch'}
              {!disabled && <span aria-hidden>→</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
