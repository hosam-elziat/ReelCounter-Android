import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, ExternalLink, ShieldCheck } from 'lucide-react';

interface VRGogglesBadgeProps {
  count: number;
  isPaused: boolean;
  opacity: number;
  size: number;
  onTogglePause: () => void;
  onOpenApp?: () => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  isRtl?: boolean;
}

export const VRGogglesBadge: React.FC<VRGogglesBadgeProps> = ({
  count,
  isPaused,
  opacity,
  size,
  onTogglePause,
  onOpenApp,
  containerRef,
  isRtl,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 70 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);

  // Initialize position based on RTL or LTR
  useEffect(() => {
    setPosition({
      x: isRtl ? 20 : 310,
      y: 75,
    });
  }, [isRtl]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag with primary mouse button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    setIsDragging(false);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      setIsDragging(true);
    }

    const containerWidth = containerRef?.current?.clientWidth || 380;
    const containerHeight = containerRef?.current?.clientHeight || 800;

    const newX = Math.max(10, Math.min(containerWidth - size - 10, dragStartRef.current.initX + dx));
    const newY = Math.max(40, Math.min(containerHeight - size - 70, dragStartRef.current.initY + dy));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    dragStartRef.current = null;
  };

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) {
      setIsExpanded((prev) => !prev);
    }
  };

  return (
    <div
      className="absolute z-50 select-none cursor-grab active:cursor-grabbing transition-transform"
      style={{
        opacity,
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="relative flex flex-col items-center">
        {/* VR Goggles Icon Body */}
        <div
          onClick={handleBadgeClick}
          className="relative rounded-full p-2.5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.45)] hover:shadow-[0_0_25px_rgba(6,182,212,0.7)] transition-shadow duration-300 flex items-center justify-center cursor-pointer group"
          style={{ width: size, height: size }}
          title="Floating VR Goggles Counter - Drag to reposition, tap to expand"
        >
          {/* Futuristic Visor SVG */}
          <svg
            viewBox="0 0 24 24"
            className="w-full h-full drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]"
            fill="none"
          >
            {/* Outer Headset Shell */}
            <path
              d="M3 9C3 6.8 4.8 5.5 7 5.5H17C19.2 5.5 21 6.8 21 9V13.5C21 16 19.2 17.5 17 17.5H14C13.2 17.5 12.8 16.5 12 16.5C11.2 16.5 10.8 17.5 10 17.5H7C4.8 17.5 3 16 3 13.5V9Z"
              stroke="url(#visorGradient)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="#0B0F19"
            />
            {/* Left Lens */}
            <rect
              x="5"
              y="8"
              width="5.5"
              height="5"
              rx="1.5"
              fill="#06B6D4"
              className="animate-pulse"
              opacity="0.85"
            />
            {/* Right Lens */}
            <rect
              x="13.5"
              y="8"
              width="5.5"
              height="5"
              rx="1.5"
              fill="#8B5CF6"
              className="animate-pulse"
              opacity="0.85"
            />
            {/* Center Neon Sensor */}
            <circle cx="12" cy="10.5" r="0.9" fill="#F8FAFC" />

            <defs>
              <linearGradient id="visorGradient" x1="2" y1="5" x2="22" y2="18" gradientUnits="userSpaceOnUse">
                <stop stopColor="#06B6D4" />
                <stop offset="0.5" stopColor="#3B82F6" />
                <stop offset="1" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Attached Live Video Counter Badge */}
          <div
            className={`absolute -top-1.5 ${
              isRtl ? '-left-2' : '-right-2'
            } min-w-[22px] px-1.5 py-0.5 rounded-full bg-rose-500 border border-white text-[11px] font-bold text-white shadow-md flex items-center justify-center font-mono`}
          >
            {count > 999 ? '999+' : count}
          </div>
        </div>

        {/* Expandable Quick Dashboard Popup */}
        {isExpanded && (
          <div
            className="absolute top-full mt-2 w-48 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 shadow-2xl z-50 text-xs text-slate-100 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-cyan-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> ReelCounter
              </span>
              <span className="font-mono text-[10px] text-slate-400">Live HUD</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span>Today's Total:</span>
              <span className="font-mono font-bold text-white text-sm">{count}</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span>Status:</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  isPaused ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {isPaused ? 'Paused' : 'Monitoring'}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePause();
              }}
              className={`w-full py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
              {isPaused ? 'Resume Count' : 'Pause Count'}
            </button>

            {onOpenApp && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                  onOpenApp();
                }}
                className="w-full py-1.5 px-2 rounded-lg font-medium bg-indigo-600/60 hover:bg-indigo-600 text-cyan-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3 h-3" />
                Open App
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
