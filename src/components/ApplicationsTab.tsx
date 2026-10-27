import React from 'react';
import { ShieldCheck, Sliders, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { AppStat } from '../types';
import { translations } from '../locales/translations';

interface ApplicationsTabProps {
  apps: AppStat[];
  onToggleApp: (packageId: string) => void;
  minThresholdMs: number;
  onThresholdChange: (newThreshold: number) => void;
  lang: 'en' | 'ar';
}

export const ApplicationsTab: React.FC<ApplicationsTabProps> = ({
  apps,
  onToggleApp,
  minThresholdMs,
  onThresholdChange,
  lang,
}) => {
  const t = translations[lang];
  const isRtl = lang === 'ar';

  return (
    <div className="space-y-5 pb-8">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-white">{t.appManagement}</h2>
        <p className="text-xs text-slate-400 mt-1">{t.appManagementSub}</p>
      </div>

      {/* Threshold Config Card */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sliders className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t.minThreshold}
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400">{minThresholdMs} ms</span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">{t.minThresholdDesc}</p>

        <input
          type="range"
          min="500"
          max="3500"
          step="250"
          value={minThresholdMs}
          onChange={(e) => onThresholdChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />

        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>500ms (Sensitive)</span>
          <span>1500ms (Standard)</span>
          <span>3500ms (Strict)</span>
        </div>
      </div>

      {/* App List */}
      <div className="space-y-3">
        {apps.map((app) => {
          const appLabel = isRtl ? app.nameAr : app.name;

          return (
            <div
              key={app.packageId}
              className={`rounded-2xl border p-4 transition-all duration-200 ${
                app.isEnabled
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-slate-950/60 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="w-3.5 h-3.5 rounded-full ring-2 ring-slate-800"
                    style={{ backgroundColor: app.color }}
                  />
                  <div>
                    <h4 className="font-bold text-sm text-white">{appLabel}</h4>
                    <p className="text-[11px] font-mono text-slate-500">{app.packageId}</p>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => onToggleApp(app.packageId)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    app.isEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                      app.isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Status and Confidence */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      app.isEnabled
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <CheckCircle className="w-3 h-3" />
                    {app.isEnabled ? t.monitored : t.disabled}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      app.confidence === 'EXACT' || app.confidence === 'HIGH'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {app.confidence === 'EXACT' || app.confidence === 'HIGH' ? (
                      <ShieldCheck className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    {app.confidence === 'EXACT'
                      ? 'Exact Node ID'
                      : app.confidence === 'HIGH'
                      ? t.highAccuracy
                      : t.heuristicEst}
                  </span>
                </div>

                <span className="font-mono text-slate-300 font-bold">
                  {app.videoCount} today
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Critical limitation notice */}
      <div className="rounded-2xl bg-slate-900/50 border border-slate-800/80 p-3.5 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
          <Info className="w-3.5 h-3.5" />
          <span>Technical Transparency</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          ReelCounter uses permitted Android Accessibility events and never executes root commands. When an app updates its layout, detections temporarily adapt using viewport transition heuristics.
        </p>
      </div>
    </div>
  );
};
