import React, { useState, useEffect } from 'react';
import {
  X,
  Github,
  Play,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Key,
  FolderGit2,
  ShieldAlert,
  Terminal,
} from 'lucide-react';
import { translations } from '../locales/translations';

interface GitHubDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
}

interface WorkflowRunInfo {
  id: number;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
}

export const GitHubDeployModal: React.FC<GitHubDeployModalProps> = ({ isOpen, onClose, lang }) => {
  const isRtl = lang === 'ar';
  const t = translations[lang];

  const [token, setToken] = useState('');
  const [repoName, setRepoName] = useState('ReelCounter-Android');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success state
  const [deployResult, setDeployResult] = useState<{
    owner: string;
    repo: string;
    repoUrl: string;
    actionsUrl: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'auto' | 'manual'>('auto');
  const [workflowRun, setWorkflowRun] = useState<WorkflowRunInfo | null>(null);
  const [copiedManual, setCopiedManual] = useState(false);

  // Poll workflow run if deployResult is set
  useEffect(() => {
    if (!deployResult || !token) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/github/workflow-status?token=${encodeURIComponent(token)}&owner=${encodeURIComponent(
            deployResult.owner
          )}&repo=${encodeURIComponent(deployResult.repo)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.run) {
            setWorkflowRun(data.run);
            if (data.run.status === 'completed') {
              clearInterval(interval);
            }
          }
        }
      } catch (e) {
        // Ignore polling errors
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [deployResult, token]);

  if (!isOpen) return null;

  const handlePushAndBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setErrorMessage(
        isRtl
          ? 'يرجى إدخال GitHub Personal Access Token للمتابعة.'
          : 'Please enter a GitHub Personal Access Token.'
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/github/push-and-build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token.trim(),
          repoName: repoName.trim(),
          isPrivate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to push repository to GitHub');
      }

      setDeployResult({
        owner: data.owner,
        repo: data.repo,
        repoUrl: data.repoUrl,
        actionsUrl: data.actionsUrl,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during git push');
    } finally {
      setIsLoading(false);
    }
  };

  const manualCommands = `# 1. Add your GitHub remote repository
git remote add origin https://github.com/<YOUR_USERNAME>/${repoName}.git

# 2. Push all code and GitHub Actions workflow
git branch -M main
git push -u origin main

# The GitHub Actions workflow in .github/workflows/build-apk.yml will automatically build ReelCounter.apk!`;

  const copyManualCommands = () => {
    navigator.clipboard.writeText(manualCommands);
    setCopiedManual(true);
    setTimeout(() => setCopiedManual(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Glow Accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {isRtl ? 'رفع المشروع إلى GitHub وبناء الـ APK' : 'Push to GitHub & Build APK'}
              </h3>
              <p className="text-xs text-slate-400">
                {isRtl
                  ? 'رفع الكود وإنشاء APK تلقائياً عبر GitHub Actions'
                  : 'Automated CI/CD APK generation pipeline'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex gap-2 pt-4 border-b border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('auto')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'auto'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRtl ? 'الرفع التلقائي (مباشر)' : 'Automatic 1-Click Push'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'manual'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            {isRtl ? 'الأوامر اليدوية (Git CLI)' : 'Manual Git CLI'}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {activeTab === 'auto' ? (
            !deployResult ? (
              <form onSubmit={handlePushAndBuild} className="space-y-4">
                {/* GitHub Token Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-cyan-400" />
                      {isRtl ? 'GitHub Personal Access Token (PAT):' : 'GitHub Personal Access Token (PAT):'}
                    </label>
                    <a
                      href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=ReelCounter-APK-Builder"
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 underline text-[11px] flex items-center gap-1"
                    >
                      {isRtl ? 'إنشاء توكن جديد (سريع)' : 'Create a token (1-click)'}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-600 font-mono focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                  <p className="text-[11px] text-slate-400">
                    {isRtl
                      ? 'يحتاج التوكن لصلاحيتي `repo` و `workflow` لرفع الكود وتشغيل GitHub Actions.'
                      : 'Requires `repo` and `workflow` scopes to push code and run GitHub Actions.'}
                  </p>
                </div>

                {/* Repo Name Field */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-200 flex items-center gap-1.5">
                    <FolderGit2 className="w-3.5 h-3.5 text-violet-400" />
                    {isRtl ? 'اسم المستودع (Repository Name):' : 'Repository Name:'}
                  </label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white font-mono focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                {/* Private toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div>
                    <span className="font-semibold text-slate-200">
                      {isRtl ? 'مستودع خاص (Private Repository)' : 'Private Repository'}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {isRtl ? 'اجعل الكود مرئياً لك فقط على حسابك' : 'Only visible to your GitHub account'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      isPrivate ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                        isPrivate ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <span className="leading-relaxed">{errorMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/50 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isRtl ? 'جاري الاتصال والرفع إلى GitHub...' : 'Pushing & Launching Build Pipeline...'}
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4" />
                      {isRtl ? 'رفع إلى GitHub وبدء بناء الـ APK' : 'Push to GitHub & Build APK'}
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Success & Workflow Monitor View */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    {isRtl ? 'تم رفع المشروع بنجاح إلى GitHub!' : 'Project Pushed Successfully to GitHub!'}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isRtl
                      ? 'تم إنشاء المستودع ودفع الأكواد المصدرية مع ملف GitHub Actions workflow لبناء تطبيق ReelCounter.apk تلقائياً.'
                      : 'Repository initialized, all Kotlin sources committed, and the GitHub Actions APK build workflow has been triggered.'}
                  </p>
                </div>

                {/* Links */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a
                    href={deployResult.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Github className="w-4 h-4 text-cyan-400" />
                      {isRtl ? 'مستودع GitHub' : 'GitHub Repo'}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>

                  <a
                    href={deployResult.actionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-800/60 hover:border-cyan-500 text-cyan-200 font-bold flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-cyan-400 fill-current" />
                      {isRtl ? 'شاشة بناء الـ APK' : 'Live APK Build'}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  </a>
                </div>

                {/* Workflow Status Box */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">
                      {isRtl ? 'حالة بناء الـ APK المباشرة:' : 'Live APK Build Status:'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                        workflowRun?.conclusion === 'success'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : workflowRun?.status === 'in_progress'
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {workflowRun?.conclusion
                        ? workflowRun.conclusion.toUpperCase()
                        : workflowRun?.status
                        ? workflowRun.status.toUpperCase()
                        : 'BUILD IN PROGRESS'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {workflowRun?.conclusion === 'success'
                      ? isRtl
                        ? 'اكتمل البناء بنجاح! يمكنك تحميل ملف ReelCounter-debug.apk مباشرة من تبويب Artifacts أو Releases في GitHub.'
                        : 'Build succeeded! Download ReelCounter-debug.apk from the Artifacts or Releases tab on your GitHub repository.'
                      : isRtl
                      ? 'يقوم خادم GitHub الآن بتشغيل Gradle assembleDebug لتجميع الـ APK. يستغرق البناء حوالي دقيقة واحدة.'
                      : 'GitHub is currently compiling the native APK via Gradle assembleDebug. Takes ~1-2 minutes.'}
                  </p>

                  <a
                    href={deployResult.actionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-bold underline pt-1"
                  >
                    {isRtl ? 'عرض سجلات البناء والتحميل في GitHub Actions' : 'View Build Logs & Download APK Artifact'}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )
          ) : (
            /* Manual CLI View */
            <div className="space-y-3">
              <p className="text-slate-300 text-xs">
                {isRtl
                  ? 'إذا كنت تفضل استخدام طرفية الأوامر (Terminal) على حاسوبك، يمكنك تنفيذ الأوامر التالية:'
                  : 'If you prefer pushing using your local terminal, run these commands in your project folder:'}
              </p>

              <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 text-[11px] font-mono text-cyan-300">
                <button
                  type="button"
                  onClick={copyManualCommands}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
                >
                  {copiedManual ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedManual ? 'Copied' : 'Copy'}</span>
                </button>
                <pre className="overflow-x-auto whitespace-pre-wrap pr-16">{manualCommands}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
