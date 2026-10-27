/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import { initialApps, initial7Days, initialHourly } from './data/initialData';
import { TabId, AppStat, VideoEventRecord, DayRecord } from './types';
import { PhoneSimulator } from './components/PhoneSimulator';
import { DashboardTab } from './components/DashboardTab';
import { StatisticsTab } from './components/StatisticsTab';
import { ApplicationsTab } from './components/ApplicationsTab';
import { SettingsTab } from './components/SettingsTab';
import { PermissionWizardTab } from './components/PermissionWizardTab';
import { EventHarness } from './components/EventHarness';
import { ProjectArtifacts } from './components/ProjectArtifacts';
import { SourceViewer } from './components/SourceViewer';
import { GitHubDeployModal } from './components/GitHubDeployModal';
import { DetectorEngineSimulator } from './utils/detectorLogic';
import { translations } from './locales/translations';
import { Smartphone, Layers, Terminal, Sparkles, Github, ShieldCheck } from 'lucide-react';

export default function App() {
  // Application State
  const [currentTab, setCurrentTab] = useState<TabId>('dashboard');
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [apps, setApps] = useState<AppStat[]>(initialApps);
  const [isPaused, setIsPaused] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(100);
  const [minThresholdMs, setMinThresholdMs] = useState(1500);

  // Floating Overlay State
  const [floatingEnabled, setFloatingEnabled] = useState(true);
  const [floatingOpacity, setFloatingOpacity] = useState(0.95);
  const [floatingSize, setFloatingSize] = useState(56);

  // GitHub Modal State
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  // Historical data
  const [history7Days, setHistory7Days] = useState<DayRecord[]>(initial7Days);
  const [hourlyData, setHourlyData] = useState(initialHourly);

  // Simulated Detection Engine
  const detectorEngine = useMemo(() => new DetectorEngineSimulator(minThresholdMs), [minThresholdMs]);
  const [eventLogs, setEventLogs] = useState<VideoEventRecord[]>([]);

  const t = translations[lang];
  const isRtl = lang === 'ar';

  const totalCount = useMemo(() => {
    return apps.reduce((acc, curr) => acc + curr.videoCount, 0);
  }, [apps]);

  const yesterdayCount = 112;

  // Toggle app monitoring
  const handleToggleApp = (packageId: string) => {
    setApps((prev) =>
      prev.map((a) => (a.packageId === packageId ? { ...a, isEnabled: !a.isEnabled } : a))
    );
  };

  // Inject synthetic accessibility event from test harness
  const handleInjectEvent = (
    pkg: string,
    options: {
      creator?: string;
      isShortFeed?: boolean;
      inComments?: boolean;
      forceRapid?: boolean;
      forceDuplicate?: boolean;
    }
  ) => {
    const now = Date.now();
    const targetApp = apps.find((a) => a.packageId === pkg);
    if (!targetApp) return;

    if (!targetApp.isEnabled || isPaused) {
      const logRecord: VideoEventRecord = {
        id: `ev_${now}`,
        packageName: pkg,
        appName: targetApp.name,
        timestamp: now,
        timeString: new Date().toLocaleTimeString(),
        confidence: 'UNCERTAIN',
        method: 'SKIPPED',
        status: 'FILTERED',
        reason: isPaused ? 'Monitoring is paused by user' : `${targetApp.name} is disabled`,
      };
      setEventLogs((prev) => [logRecord, ...prev.slice(0, 49)]);
      return;
    }

    // Pass event to pure detector engine
    const result = detectorEngine.process({
      packageName: pkg,
      timestamp: options.forceRapid ? now - 300 : now,
      creatorHandle: options.forceDuplicate ? 'fixed_duplicate_creator' : options.creator,
      isInsideShortVideoFeed: options.isShortFeed ?? true,
      isInCommentsOrProfile: options.inComments ?? false,
    });

    const logRecord: VideoEventRecord = {
      id: `ev_${now}_${Math.random()}`,
      packageName: pkg,
      appName: targetApp.name,
      timestamp: now,
      timeString: new Date().toLocaleTimeString(),
      confidence: result.confidence,
      method: result.confidence === 'EXACT' ? 'EXACT_NODE_ID' : 'FEED_SCROLL_PAGER',
      creatorHandle: options.creator,
      dedupKey: result.deduplicationKey ?? undefined,
      status: result.isNewVideo ? 'COUNTED' : 'FILTERED',
      reason: result.reason,
    };

    setEventLogs((prev) => [logRecord, ...prev.slice(0, 49)]);

    if (result.isNewVideo) {
      // Increment app count
      setApps((prev) =>
        prev.map((a) =>
          a.packageId === pkg
            ? {
                ...a,
                videoCount: a.videoCount + 1,
                estimatedMinutes: a.estimatedMinutes + 1,
              }
            : a
        )
      );

      // Increment current hour count
      const currentHour = new Date().getHours();
      setHourlyData((prev) =>
        prev.map((h) => (h.hour === currentHour ? { ...h, count: h.count + 1 } : h))
      );
    }
  };

  // Clear data
  const handleClearData = () => {
    setApps((prev) =>
      prev.map((a) => ({
        ...a,
        videoCount: 0,
        estimatedMinutes: 0,
        uncertainCount: 0,
      }))
    );
    setEventLogs([]);
    detectorEngine.reset();
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 ${isRtl ? 'font-arabic' : 'font-sans'}`}>
      {/* Top Global Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 p-0.5 shadow-md shadow-cyan-900/40 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-white tracking-tight">ReelCounter</h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50 font-bold">
                  Android 14
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Native short-video counter with floating VR goggles overlay &amp; local Room persistence
              </p>
            </div>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-2.5">
            {/* Direct GitHub Upload Button in Header */}
            <button
              type="button"
              onClick={() => setIsGitHubModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 transition-all flex items-center gap-1.5 shadow-md shadow-cyan-950/40 active:scale-95 cursor-pointer"
            >
              <Github className="w-4 h-4" />
              <span>{isRtl ? 'رفع لـ GitHub وبناء الـ APK' : 'Push to GitHub & Build APK'}</span>
            </button>

            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>{lang === 'en' ? 'العربية' : 'English'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Center Column: Interactive Android Device */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="mb-3 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/40">
                Interactive Android Device
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Drag the floating VR goggles icon or tap to expand the HUD!
              </p>
            </div>

            <PhoneSimulator
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              lang={lang}
              floatingCount={totalCount}
              isPaused={isPaused}
              floatingEnabled={floatingEnabled}
              floatingOpacity={floatingOpacity}
              floatingSize={floatingSize}
              onTogglePause={() => setIsPaused((prev) => !prev)}
            >
              {currentTab === 'dashboard' && (
                <DashboardTab
                  totalCount={totalCount}
                  yesterdayCount={yesterdayCount}
                  dailyGoal={dailyGoal}
                  isPaused={isPaused}
                  apps={apps}
                  lang={lang}
                  onTogglePause={() => setIsPaused((prev) => !prev)}
                  hourlyData={hourlyData}
                />
              )}

              {currentTab === 'statistics' && (
                <StatisticsTab
                  apps={apps}
                  history7Days={history7Days}
                  totalToday={totalCount}
                  lang={lang}
                />
              )}

              {currentTab === 'applications' && (
                <ApplicationsTab
                  apps={apps}
                  onToggleApp={handleToggleApp}
                  minThresholdMs={minThresholdMs}
                  onThresholdChange={setMinThresholdMs}
                  lang={lang}
                />
              )}

              {currentTab === 'permissions' && (
                <PermissionWizardTab
                  lang={lang}
                  onAllCompleted={() => setCurrentTab('dashboard')}
                  onStartFloatingHud={() => setFloatingEnabled(true)}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsTab
                  lang={lang}
                  onLanguageChange={setLang}
                  floatingEnabled={floatingEnabled}
                  onToggleFloating={setFloatingEnabled}
                  floatingOpacity={floatingOpacity}
                  onChangeOpacity={setFloatingOpacity}
                  floatingSize={floatingSize}
                  onChangeSize={setFloatingSize}
                  dailyLimit={dailyGoal}
                  onChangeLimit={setDailyGoal}
                  onClearData={handleClearData}
                />
              )}
            </PhoneSimulator>
          </div>

          {/* Right Column: Event Harness, Artifacts, Source Explorer */}
          <div className="lg:col-span-7 space-y-6">
            {/* Deliverables Hub with Push to GitHub button */}
            <ProjectArtifacts
              lang={lang}
              onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
            />

            {/* Accessibility Event Test Harness */}
            <EventHarness
              onInjectEvent={handleInjectEvent}
              logs={eventLogs}
              lang={lang}
            />

            {/* Android Source Code Explorer */}
            <SourceViewer />
          </div>
        </div>
      </main>

      {/* GitHub 1-Click Push & Build APK Modal */}
      <GitHubDeployModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}
