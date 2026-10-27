import React, { useState } from 'react';
import { Globe, Eye, Sliders, Shield, Trash2, Info, Check } from 'lucide-react';
import { translations } from '../locales/translations';

interface SettingsTabProps {
  lang: 'en' | 'ar';
  onLanguageChange: (lang: 'en' | 'ar') => void;
  floatingEnabled: boolean;
  onToggleFloating: (enabled: boolean) => void;
  floatingOpacity: number;
  onChangeOpacity: (opacity: number) => void;
  floatingSize: number;
  onChangeSize: (size: number) => void;
  dailyLimit: number;
  onChangeLimit: (limit: number) => void;
  onClearData: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  lang,
  onLanguageChange,
  floatingEnabled,
  onToggleFloating,
  floatingOpacity,
  onChangeOpacity,
  floatingSize,
  onChangeSize,
  dailyLimit,
  onChangeLimit,
  onClearData,
}) => {
  const t = translations[lang];
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <div className="space-y-5 pb-8">
      {/* Title */}
      <h2 className="text-xl font-extrabold text-white">{t.navSettings}</h2>

      {/* Language Switcher */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <Globe className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {t.languageSelect}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              lang === 'en'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {lang === 'en' && <Check className="w-3.5 h-3.5" />}
            English (LTR)
          </button>

          <button
            type="button"
            onClick={() => onLanguageChange('ar')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              lang === 'ar'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {lang === 'ar' && <Check className="w-3.5 h-3.5" />}
            العربية (RTL)
          </button>
        </div>
      </div>

      {/* Floating VR Goggles Controls */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-violet-400" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {t.floatingGoggles}
              </h3>
              <p className="text-[11px] text-slate-400">{t.floatingGogglesDesc}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleFloating(!floatingEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              floatingEnabled ? 'bg-cyan-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                floatingEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {floatingEnabled && (
          <div className="space-y-3 pt-3 border-t border-slate-800">
            {/* Opacity slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{t.floatingOpacity}</span>
                <span className="font-mono text-cyan-400 font-bold">{Math.round(floatingOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.05"
                value={floatingOpacity}
                onChange={(e) => onChangeOpacity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Size slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{t.floatingSize}</span>
                <span className="font-mono text-cyan-400 font-bold">{floatingSize} px</span>
              </div>
              <input
                type="range"
                min="44"
                max="72"
                step="4"
                value={floatingSize}
                onChange={(e) => onChangeSize(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Daily Video Limit Alert */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-2 text-amber-400">
          <Sliders className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {t.dailyLimit}
          </h3>
        </div>

        <div className="grid grid-cols-4 gap-2 text-xs font-bold">
          {[50, 100, 150, 200].map((lim) => (
            <button
              key={lim}
              type="button"
              onClick={() => onChangeLimit(lim)}
              className={`py-2 rounded-xl transition-all font-mono ${
                dailyLimit === lim
                  ? 'bg-violet-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {lim}
            </button>
          ))}
        </div>
      </div>

      {/* Privacy Policy Card */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-2">
        <div className="flex items-center gap-2 text-emerald-400">
          <Shield className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {t.privacyTitle}
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">{t.privacyBody}</p>
      </div>

      {/* Clear Data */}
      <div className="pt-2">
        {confirmDelete ? (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-3">
            <p className="text-xs text-rose-200">{t.clearConfirm}</p>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  onClearData();
                  setConfirmDelete(false);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                Yes, Wipe All History
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="py-2 px-4 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-rose-950/30 text-rose-400 border border-slate-800 hover:border-rose-800/50 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {t.clearData}
          </button>
        )}
      </div>
    </div>
  );
};
