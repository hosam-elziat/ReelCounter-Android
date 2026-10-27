import React, { useState } from 'react';
import { Terminal, Play, Zap, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { VideoEventRecord } from '../types';
import { translations } from '../locales/translations';

interface EventHarnessProps {
  onInjectEvent: (
    pkg: string,
    options: {
      creator?: string;
      isShortFeed?: boolean;
      inComments?: boolean;
      forceRapid?: boolean;
      forceDuplicate?: boolean;
    }
  ) => void;
  logs: VideoEventRecord[];
  lang: 'en' | 'ar';
}

export const EventHarness: React.FC<EventHarnessProps> = ({ onInjectEvent, logs, lang }) => {
  const t = translations[lang];
  const [selectedApp, setSelectedApp] = useState('com.zhiliaoapp.musically');

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <Terminal className="w-5 h-5" />
          <h3 className="font-extrabold text-sm text-white tracking-wide">{t.simulatorTitle}</h3>
        </div>
        <span className="text-[11px] font-mono text-cyan-400/90 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800/40">
          Synthetic Event Engine
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">{t.simulatorDesc}</p>

      {/* App Target Selection */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'com.zhiliaoapp.musically', label: 'TikTok' },
          { id: 'com.instagram.android', label: 'IG Reels' },
          { id: 'com.google.android.youtube', label: 'YT Shorts' },
          { id: 'com.facebook.katana', label: 'FB Reels' },
          { id: 'com.snapchat.android', label: 'Spotlight' },
        ].map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => setSelectedApp(app.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedApp === app.id
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {app.label}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
        {/* Valid new video */}
        <button
          type="button"
          onClick={() =>
            onInjectEvent(selectedApp, {
              creator: `creator_${Math.floor(Math.random() * 899 + 100)}`,
              isShortFeed: true,
            })
          }
          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-950/30"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          {t.triggerEvent}
        </button>

        {/* Rapid swipe (< 1500ms) */}
        <button
          type="button"
          onClick={() =>
            onInjectEvent(selectedApp, {
              creator: `rapid_fling_${Math.floor(Math.random() * 50)}`,
              isShortFeed: true,
              forceRapid: true,
            })
          }
          className="py-2.5 px-3 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white flex items-center justify-center gap-1.5 transition-colors"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          {t.rapidScrollTest}
        </button>

        {/* Duplicate rebound */}
        <button
          type="button"
          onClick={() =>
            onInjectEvent(selectedApp, {
              creator: 'fixed_duplicate_creator',
              isShortFeed: true,
              forceDuplicate: true,
            })
          }
          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {t.duplicateTest}
        </button>

        {/* Long video or comments reject */}
        <button
          type="button"
          onClick={() =>
            onInjectEvent(selectedApp, {
              isShortFeed: false, // Standard video
            })
          }
          className="py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-950/60 text-rose-300 border border-rose-800/50 flex items-center justify-center gap-1.5 transition-colors"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          {t.nonReelTest}
        </button>
      </div>

      {/* Live Event Log */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold uppercase tracking-wider">{t.liveEventLog}</span>
          <span className="font-mono text-[11px] text-cyan-400">{logs.length} logged</span>
        </div>

        <div className="h-44 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
          {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              No simulated events fired yet. Click buttons above to test.
            </div>
          ) : (
            logs.map((log) => {
              const isCounted = log.status === 'COUNTED';
              const isFiltered = log.status === 'FILTERED';

              return (
                <div
                  key={log.id}
                  className={`p-2 rounded-xl border flex items-start justify-between gap-2 transition-all ${
                    isCounted
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                      : isFiltered
                      ? 'bg-amber-950/20 border-amber-500/20 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      {isCounted ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                      )}
                      <span className="font-bold">{log.appName}</span>
                      <span className="text-[10px] text-slate-500">[{log.timeString}]</span>
                    </div>
                    <p className="text-[10px] text-slate-400">{log.reason}</p>
                  </div>

                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                      isCounted
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
