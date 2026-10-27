import React, { useState } from 'react';
import {
  Download,
  FileArchive,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Github,
  Play,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { translations } from '../locales/translations';

interface ProjectArtifactsProps {
  lang: 'en' | 'ar';
  onOpenGitHubModal: () => void;
}

export const ProjectArtifacts: React.FC<ProjectArtifactsProps> = ({ lang, onOpenGitHubModal }) => {
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const [copiedCmd, setCopiedCmd] = useState(false);

  const copyBuildCommand = () => {
    navigator.clipboard.writeText('./gradlew assembleDebug');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <FileArchive className="w-5 h-5" />
          <h3 className="font-extrabold text-sm text-white tracking-wide">
            {isRtl ? 'المخرجات وبناء الـ APK عبر GitHub' : 'Deliverables & GitHub APK CI/CD'}
          </h3>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Ready
        </span>
      </div>

      {/* 1-Click Push to GitHub Button Requested by User */}
      <button
        type="button"
        onClick={onOpenGitHubModal}
        className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-cyan-950/50 hover:shadow-cyan-500/25 active:scale-[0.98] cursor-pointer group"
      >
        <Github className="w-5 h-5 transition-transform group-hover:scale-110" />
        <span>{t.pushToGitHub}</span>
        <span className="px-2 py-0.5 rounded-full bg-slate-950/20 text-slate-950 text-xs font-mono font-bold">
          CI/CD Flow
        </span>
      </button>

      {/* Direct Project ZIP Download */}
      <a
        href="/ReelCounter-Android-Project.zip"
        download="ReelCounter-Android-Project.zip"
        className="w-full py-3 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
      >
        <Download className="w-4 h-4 text-cyan-400" />
        {t.downloadProjectZip}
      </a>

      {/* Sub-downloads: README and Test Report */}
      <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
        <a
          href="/README.md"
          download="ReelCounter-README.md"
          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          {t.downloadReadme}
        </a>

        <a
          href="/TEST_REPORT.md"
          download="ReelCounter-TEST_REPORT.md"
          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-violet-400" />
          {t.downloadTestReport}
        </a>
      </div>

      {/* GitHub Actions Flow Explanation */}
      <div className="rounded-2xl bg-slate-950/70 border border-slate-800/90 p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
          <Zap className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>
            {isRtl
              ? 'إنشاء الـ APK المباشر عبر GitHub Actions (.yml)'
              : 'Direct APK Generation via GitHub Actions (.yml)'}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {isRtl
            ? 'تم تضمين ملف سير العمل `.github/workflows/build-apk.yml`. بمجرد رفع المشروع إلى حسابك على GitHub، يبدأ سير العمل تلقائياً بتجميع كود أندرويد عبر Gradle assembleDebug وإنتاج ملف ReelCounter-debug.apk للتحميل المباشر.'
            : 'Pre-configured `.github/workflows/build-apk.yml` automatically triggers on push to compile the Kotlin codebase with Gradle and produce downloadable `ReelCounter-debug.apk` in GitHub Releases and Artifacts.'}
        </p>

        {/* Copy command box */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300">
          <code>./gradlew assembleDebug</code>
          <button
            type="button"
            onClick={copyBuildCommand}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
          >
            {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copiedCmd ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};
