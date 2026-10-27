import React, { useRef } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';
import { TabId } from '../types';
import { translations } from '../locales/translations';
import { VRGogglesBadge } from './VRGogglesBadge';

interface PhoneSimulatorProps {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
  lang: 'en' | 'ar';
  floatingCount: number;
  isPaused: boolean;
  floatingEnabled: boolean;
  floatingOpacity: number;
  floatingSize: number;
  onTogglePause: () => void;
  children: React.ReactNode;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  currentTab,
  onTabChange,
  lang,
  floatingCount,
  isPaused,
  floatingEnabled,
  floatingOpacity,
  floatingSize,
  onTogglePause,
  children,
}) => {
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const phoneBodyRef = useRef<HTMLDivElement>(null);

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'dashboard', label: t.navDashboard, icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
    { id: 'statistics', label: t.navStatistics, icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' },
    { id: 'applications', label: t.navApps, icon: 'M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z' },
    { id: 'permissions', label: t.navPermissions, icon: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z' },
    { id: 'settings', label: t.navSettings, icon: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z' },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[420px] select-none">
      {/* Outer Phone Shell */}
      <div
        ref={phoneBodyRef}
        dir={isRtl ? 'rtl' : 'ltr'}
        className="relative h-[840px] w-full rounded-[48px] bg-slate-950 p-3 shadow-[0_0_60px_rgba(6,182,212,0.15)] ring-1 ring-slate-800 border-4 border-slate-900 overflow-hidden flex flex-col"
      >
        {/* Status Bar */}
        <div className="relative z-30 flex items-center justify-between px-6 pt-2 pb-1 text-xs text-slate-300 font-medium">
          <span className="font-mono text-[13px] font-bold">13:11</span>

          {/* Camera Punch Hole */}
          <div className="w-4 h-4 rounded-full bg-black ring-1 ring-slate-800" />

          <div className="flex items-center gap-1.5 text-slate-400">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4" />
          </div>
        </div>

        {/* Floating VR Goggles HUD Overlay (inside phone screen) */}
        {floatingEnabled && (
          <VRGogglesBadge
            count={floatingCount}
            isPaused={isPaused}
            opacity={floatingOpacity}
            size={floatingSize}
            onTogglePause={onTogglePause}
            onOpenApp={() => onTabChange('dashboard')}
            containerRef={phoneBodyRef}
            isRtl={isRtl}
          />
        )}

        {/* Scrollable Screen Content */}
        <div className="relative flex-1 overflow-y-auto px-4 pt-2 pb-4 scroll-smooth">
          {children}
        </div>

        {/* Material 3 Bottom Navigation Bar */}
        <div className="relative z-30 border-t border-slate-900 bg-slate-950/95 backdrop-blur-md px-2 py-1.5 flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1 transition-all rounded-2xl ${
                  isActive ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div
                  className={`p-1.5 rounded-full transition-all ${
                    isActive ? 'bg-cyan-500/15' : 'bg-transparent'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d={tab.icon} />
                  </svg>
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Android Gesture Bar */}
        <div className="flex justify-center pb-1 pt-1 bg-slate-950">
          <div className="w-32 h-1 bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
};
