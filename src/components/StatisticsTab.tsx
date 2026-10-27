import React, { useState } from 'react';
import { Download, Calendar, Award, BarChart2, CheckCircle2 } from 'lucide-react';
import { AppStat, DayRecord } from '../types';
import { translations } from '../locales/translations';
import { generateCsvExport } from '../utils/detectorLogic';

interface StatisticsTabProps {
  apps: AppStat[];
  history7Days: DayRecord[];
  totalToday: number;
  lang: 'en' | 'ar';
}

export const StatisticsTab: React.FC<StatisticsTabProps> = ({
  apps,
  history7Days,
  totalToday,
  lang,
}) => {
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const [selectedRange, setSelectedRange] = useState<'today' | 'yesterday' | '7days' | '30days'>('7days');
  const [exportedNotice, setExportedNotice] = useState(false);

  const total7Days = history7Days.reduce((acc, curr) => acc + curr.totalVideos, 0);
  const avgDaily = Math.round(total7Days / history7Days.length);
  const highestDay = [...history7Days].sort((a, b) => b.totalVideos - a.totalVideos)[0];

  const handleDownloadCsv = () => {
    const csvContent = generateCsvExport(
      apps.map((a) => ({
        date: '2026-10-26',
        packageName: a.packageId,
        appName: a.name,
        videoCount: a.videoCount,
        estimatedMinutes: a.estimatedMinutes,
        uncertainEvents: a.uncertainCount,
      }))
    );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ReelCounter_Stats_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportedNotice(true);
    setTimeout(() => setExportedNotice(false), 3000);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Title & CSV Export */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-white">{t.navStatistics}</h2>

        <button
          type="button"
          onClick={handleDownloadCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600/80 hover:bg-cyan-500 text-slate-950 font-bold transition-all shadow-md shadow-cyan-900/30 active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          {t.exportCsv}
        </button>
      </div>

      {exportedNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{t.exportSuccess}</span>
        </div>
      )}

      {/* Timeframe Chips */}
      <div className="flex rounded-2xl bg-slate-900/90 p-1 border border-slate-800 text-xs font-medium">
        {(['today', 'yesterday', '7days', '30days'] as const).map((r) => {
          const label =
            r === 'today'
              ? t.timeframeToday
              : r === 'yesterday'
              ? t.timeframeYesterday
              : r === '7days'
              ? t.timeframe7Days
              : t.timeframe30Days;
          const active = selectedRange === r;

          return (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRange(r)}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                active
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <BarChart2 className="w-4 h-4" />
            <span className="text-xs text-slate-400 font-medium">{t.dailyAverage}</span>
          </div>
          <p className="text-2xl font-black text-white font-mono">{avgDaily}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">videos / day</p>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <Award className="w-4 h-4" />
            <span className="text-xs text-slate-400 font-medium">{t.highestDay}</span>
          </div>
          <p className="text-2xl font-black text-white font-mono">{highestDay?.totalVideos ?? 0}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isRtl ? highestDay?.dayLabelAr : highestDay?.dayLabel}
          </p>
        </div>
      </div>

      {/* 7-Day History Bars */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            {t.timeframe7Days}
          </h3>
          <span className="text-xs font-mono text-cyan-400 font-semibold">{total7Days} total</span>
        </div>

        <div className="space-y-2.5">
          {history7Days.map((d) => {
            const maxVal = Math.max(...history7Days.map((x) => x.totalVideos), 1);
            const widthPct = Math.round((d.totalVideos / maxVal) * 100);
            const label = isRtl ? d.dayLabelAr : d.dayLabel;
            const isToday = d.dayLabel === 'Today';

            return (
              <div key={d.date} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${isToday ? 'text-cyan-400 font-bold' : 'text-slate-300'}`}>
                    {label} ({d.date.slice(5)})
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">{d.estimatedMinutes}m</span>
                    <span className="font-mono font-bold text-white">{d.totalVideos}</span>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isToday
                        ? 'bg-gradient-to-r from-cyan-400 to-violet-400'
                        : 'bg-indigo-600/70'
                    }`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* App Distribution Share */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Share by Application
        </h3>

        <div className="space-y-2">
          {apps.map((app) => {
            const share = totalToday > 0 ? Math.round((app.videoCount / totalToday) * 100) : 0;
            const appLabel = isRtl ? app.nameAr : app.name;

            return (
              <div
                key={app.packageId}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: app.color }} />
                  <span className="font-semibold text-slate-200">{appLabel}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-mono">{app.estimatedMinutes}m</span>
                  <span className="font-bold text-white font-mono">{app.videoCount} ({share}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
