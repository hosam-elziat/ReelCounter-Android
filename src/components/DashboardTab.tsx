import React from 'react';
import { Play, Pause, Flame, Clock, Video, Sparkles, TrendingUp } from 'lucide-react';
import { AppStat } from '../types';
import { translations } from '../locales/translations';

interface DashboardTabProps {
  totalCount: number;
  yesterdayCount: number;
  dailyGoal: number;
  isPaused: boolean;
  apps: AppStat[];
  lang: 'en' | 'ar';
  onTogglePause: () => void;
  hourlyData: { hour: number; label: string; count: number }[];
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  totalCount,
  yesterdayCount,
  dailyGoal,
  isPaused,
  apps,
  lang,
  onTogglePause,
  hourlyData,
}) => {
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const totalMinutes = apps.reduce((acc, curr) => acc + curr.estimatedMinutes, 0);
  const avgSeconds = totalCount > 0 ? Math.round((totalMinutes * 60) / totalCount) : 0;
  const progressRatio = dailyGoal > 0 ? Math.min(totalCount / dailyGoal, 1) : 0;
  const isGoalReached = totalCount >= dailyGoal && dailyGoal > 0;

  const diffYesterday = totalCount - yesterdayCount;
  const diffSign = diffYesterday >= 0 ? `+${diffYesterday}` : `${diffYesterday}`;

  return (
    <div className="space-y-5 pb-8">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800/40">
            {t.today}
          </span>
          <h2 className="text-xl font-extrabold text-white mt-1.5 flex items-center gap-2">
            {t.appName}
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </h2>
        </div>

        <button
          type="button"
          onClick={onTogglePause}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isPaused
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
          }`}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
          {isPaused ? t.resumeCounting : t.pauseCounting}
        </button>
      </div>

      {/* Hero Counter Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-6 border border-cyan-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative text-center">
          <p className="text-xs font-semibold tracking-wider uppercase text-cyan-400/90 mb-1">
            {t.totalVideos}
          </p>

          <div className="flex items-baseline justify-center gap-1 my-1">
            <span className="text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 font-mono">
              {totalCount}
            </span>
          </div>

          {/* vs Yesterday delta */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-medium">
            <TrendingUp className={`w-3.5 h-3.5 ${diffYesterday >= 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span className={diffYesterday >= 0 ? 'text-amber-300 font-bold' : 'text-emerald-300 font-bold'}>
              {diffSign}
            </span>
            <span className="text-slate-400">
              {t.vsYesterday} ({yesterdayCount})
            </span>
          </div>

          {/* Goal Progress Bar */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 text-left">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-medium">{t.dailyGoal}</span>
              <span className={`font-semibold ${isGoalReached ? 'text-amber-400 font-bold' : 'text-slate-200'}`}>
                {t.goalProgress.replace('{current}', totalCount.toString()).replace('{goal}', dailyGoal.toString())}
              </span>
            </div>

            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isGoalReached
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                    : 'bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                }`}
                style={{ width: `${Math.round(progressRatio * 100)}%` }}
              />
            </div>

            {isGoalReached && (
              <div className="mt-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-[11px] text-amber-300 font-medium">
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t.goalReached} {t.takeBreak}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs text-slate-400 font-medium">{t.estimatedTime}</span>
          </div>
          <p className="text-2xl font-bold text-white font-mono">{totalMinutes} min</p>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-violet-400 mb-2">
            <Video className="w-4 h-4" />
            <span className="text-xs text-slate-400 font-medium">{t.avgDuration}</span>
          </div>
          <p className="text-2xl font-bold text-white font-mono">{avgSeconds} sec</p>
        </div>
      </div>

      {/* Per-App Video Breakdown */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t.appManagement}
          </h3>
          <span className="text-xs font-mono text-cyan-400 font-semibold">{apps.length} monitored</span>
        </div>

        <div className="space-y-3">
          {apps.map((app) => {
            const share = totalCount > 0 ? Math.round((app.videoCount / totalCount) * 100) : 0;
            const appLabel = isRtl ? app.nameAr : app.name;

            return (
              <div key={app.packageId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: app.color }}
                    />
                    {appLabel}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">{share}%</span>
                    <span className="font-bold text-white font-mono">{app.videoCount}</span>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${share}%`,
                      backgroundColor: app.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Activity Mini Bar Chart */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t.hourlyDistribution}
          </h3>
          <span className="text-[11px] text-cyan-400 font-medium">{t.peakHours}: 8 PM</span>
        </div>

        <div className="h-24 flex items-end gap-1 pt-2">
          {hourlyData.map((d) => {
            const maxVal = Math.max(...hourlyData.map((x) => x.count), 1);
            const heightPercent = Math.max(Math.round((d.count / maxVal) * 100), 6);
            const isPeak = d.count >= 20;

            return (
              <div
                key={d.hour}
                className="flex-1 flex flex-col items-center justify-end h-full group relative"
              >
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    isPeak
                      ? 'bg-gradient-to-t from-cyan-500 to-violet-500'
                      : d.count > 0
                      ? 'bg-slate-700 group-hover:bg-cyan-500/70'
                      : 'bg-slate-800/40'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
                {/* Tooltip on hover */}
                <span className="opacity-0 group-hover:opacity-100 absolute -top-6 bg-slate-800 px-1.5 py-0.5 rounded text-[9px] font-mono text-cyan-300 pointer-events-none transition-opacity z-10">
                  {d.label}: {d.count}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1.5 px-0.5">
          <span>12 AM</span>
          <span>6 AM</span>
          <span>12 PM</span>
          <span>6 PM</span>
          <span>11 PM</span>
        </div>
      </div>
    </div>
  );
};
