import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Play,
  Wand2,
  ShieldCheck,
  Eye,
  Bell,
  BatteryCharging,
  BarChart2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { translations } from '../locales/translations';

interface PermissionStepItem {
  id: string;
  index: number;
  titleKey: string;
  titleKeyAr: string;
  descKey: string;
  descKeyAr: string;
  icon: any;
  isGranted: boolean;
}

interface PermissionWizardTabProps {
  lang: 'en' | 'ar';
  onAllCompleted: () => void;
  onStartFloatingHud: () => void;
}

export const PermissionWizardTab: React.FC<PermissionWizardTabProps> = ({
  lang,
  onAllCompleted,
  onStartFloatingHud,
}) => {
  const isRtl = lang === 'ar';
  const t = translations[lang];

  const [steps, setSteps] = useState<PermissionStepItem[]>([
    {
      id: 'usage',
      index: 1,
      titleKey: '1. Usage Access',
      titleKeyAr: '1. إمكانية الوصول إلى بيانات الاستخدام',
      descKey: 'Identifies when a supported social media app enters foreground. Required for session timing.',
      descKeyAr: 'للتعرف على التطبيق النشط في الواجهة وحساب وقت الجلسة الفعلي بدقة.',
      icon: BarChart2,
      isGranted: true,
    },
    {
      id: 'accessibility',
      index: 2,
      titleKey: '2. Accessibility Service',
      titleKeyAr: '2. خدمة إمكانية الوصول (Accessibility)',
      descKey: 'Opt-in detection of video feed transitions without recording text, keystrokes, or media.',
      descKeyAr: 'رصد حركة التمرير بين مقاطع الفيديو دون قراءة النصوص أو كلمات المرور أو التقاط الشاشة.',
      icon: ShieldCheck,
      isGranted: true,
    },
    {
      id: 'overlay',
      index: 3,
      titleKey: '3. Display Over Other Apps',
      titleKeyAr: '3. الظهور فوق التطبيقات الأخرى',
      descKey: 'Renders the floating VR goggles headset icon and live video count badge over apps.',
      descKeyAr: 'لعرض أيقونة نظارات الواقع الافتراضي العائمة مع عدّاد المقاطع المباشر فوق الشاشة.',
      icon: Eye,
      isGranted: true,
    },
    {
      id: 'notifications',
      index: 4,
      titleKey: '4. Notifications',
      titleKeyAr: '4. الإشعارات',
      descKey: 'Displays persistent background monitoring status and alerts when you cross your daily goal.',
      descKeyAr: 'لعرض حالة الرصد في الخلفية وتنبيهك عند تجاوز الحد الأقصى للمقاطع يومياً.',
      icon: Bell,
      isGranted: true,
    },
    {
      id: 'battery',
      index: 5,
      titleKey: '5. Unrestricted Background Operation',
      titleKeyAr: '5. استثناء توفير البطارية في الخلفية',
      descKey: 'Exempts ReelCounter from aggressive battery task-killing to maintain continuous counting.',
      descKeyAr: 'يمنع نظام أندرويد من إيقاف الخدمة قسراً لضمان عمل العدّاد العائم دون انقطاع.',
      icon: BatteryCharging,
      isGranted: true,
    },
  ]);

  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const [autoMessage, setAutoMessage] = useState<string | null>(null);

  const grantedCount = steps.filter((s) => s.isGranted).length;
  const totalCount = steps.length;
  const isComplete = grantedCount === totalCount;

  // Toggle individual step
  const handleToggleStep = (id: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isGranted: !s.isGranted } : s))
    );
  };

  // Run auto step-by-step wizard
  const runAutoStepByStep = async () => {
    setIsAutoAdvancing(true);

    // Reset ungranted steps or start from first ungranted
    const pending = steps.findIndex((s) => !s.isGranted);
    const startIdx = pending >= 0 ? pending : 0;

    for (let i = startIdx; i < steps.length; i++) {
      const step = steps[i];
      setActiveStepIndex(step.index);
      setAutoMessage(
        isRtl
          ? `الخطوة ${step.index} من ${totalCount}: فتح إعدادات النظام وتفعيل الصلاحية...`
          : `Step ${step.index} of ${totalCount}: Requesting permission from system...`
      );

      await new Promise((resolve) => setTimeout(resolve, 850));

      // Grant step
      setSteps((prev) =>
        prev.map((s) => (s.id === step.id ? { ...s, isGranted: true } : s))
      );

      setAutoMessage(
        isRtl
          ? `تم تفعيل ${step.titleKeyAr}! الانتقال للخطوة التالية...`
          : `${step.titleKey} granted! Moving to next step...`
      );

      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    setActiveStepIndex(null);
    setAutoMessage(
      isRtl
        ? 'تم تفعيل كافة الصلاحيات بنجاح! تم تشغيل خدمة النظارات العائمة.'
        : 'All permissions granted! Floating VR Goggles HUD activated.'
    );
    setIsAutoAdvancing(false);
    onStartFloatingHud();
  };

  const resetAllPermissions = () => {
    setSteps((prev) => prev.map((s) => ({ ...s, isGranted: false })));
    setAutoMessage(null);
    setActiveStepIndex(null);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800/40 flex items-center gap-1">
            <Wand2 className="w-3.5 h-3.5" />
            {isRtl ? 'معالج الصلاحيات التلقائي' : 'Auto Permission Wizard'}
          </span>
          <button
            type="button"
            onClick={resetAllPermissions}
            className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            {isRtl ? 'إعادة تعيين للاختبار' : 'Reset to test'}
          </button>
        </div>
        <h2 className="text-xl font-extrabold text-white mt-1.5">
          {isRtl ? 'منح الصلاحيات خطوة بخطوة' : 'Step-by-Step Permissions'}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {isRtl
            ? 'يقوم المعالج بفحص الصلاحيات وفتح شاشات النظام خطوة بخطوة والانتقال تلقائياً بمجرد التفعيل.'
            : 'Automated wizard guides you step-by-step through each Android system setting.'}
        </p>
      </div>

      {/* Progress & Auto Setup Card */}
      <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 p-5 border border-cyan-500/30 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-slate-300">
            {isRtl ? 'اكتمال الصلاحيات:' : 'Setup Progress:'}
          </span>
          <span className="font-mono text-xs font-bold text-cyan-400">
            {grantedCount} / {totalCount} {isRtl ? 'ممنوحة' : 'Granted'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.round((grantedCount / totalCount) * 100)}%` }}
          />
        </div>

        {/* Dynamic status feedback banner */}
        {autoMessage && (
          <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
            <span>{autoMessage}</span>
          </div>
        )}

        {/* Auto Wizard Start Button */}
        {!isComplete ? (
          <button
            type="button"
            onClick={runAutoStepByStep}
            disabled={isAutoAdvancing}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-950/40 disabled:opacity-60 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRtl ? 'بدء الإعداد التلقائي خطوة بخطوة' : 'Start Automatic Step-by-Step Setup'}
          </button>
        ) : (
          <button
            type="button"
            onClick={onAllCompleted}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isRtl ? 'الانتقال إلى شاشة المراقبة الرئيسية' : 'Proceed to Main Dashboard'}
          </button>
        )}
      </div>

      {/* 5 Step Checklist Items */}
      <div className="space-y-2.5">
        {steps.map((s) => {
          const isTarget = activeStepIndex === s.index;
          const StepIcon = s.icon;
          const title = isRtl ? s.titleKeyAr : s.titleKey;
          const desc = isRtl ? s.descKeyAr : s.descKey;

          return (
            <div
              key={s.id}
              onClick={() => handleToggleStep(s.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isTarget
                  ? 'bg-slate-900 border-cyan-400 ring-2 ring-cyan-500/20'
                  : s.isGranted
                  ? 'bg-slate-900/80 border-emerald-500/30'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      s.isGranted
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : isTarget
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-white">{title}</h4>
                      {isTarget && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-400 text-slate-950 font-bold uppercase animate-pulse">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{desc}</p>
                  </div>
                </div>

                <div className="shrink-0 pt-0.5">
                  {s.isGranted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-600 hover:border-cyan-400" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
