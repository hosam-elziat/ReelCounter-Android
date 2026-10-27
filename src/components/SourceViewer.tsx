import React, { useState } from 'react';
import { Code2, FileCode, Check, Copy } from 'lucide-react';

interface FileSnippet {
  fileName: string;
  category: string;
  code: string;
}

const KOTLIN_SNIPPETS: FileSnippet[] = [
  {
    fileName: 'build-apk.yml (GitHub Actions)',
    category: 'CI/CD Workflow',
    code: `name: Build ReelCounter APK

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build:
    name: Build Android Debug APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Set up Java 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'

      - name: Grant Execute Permission to Gradle
        run: chmod +x ./gradlew || chmod +x ./android-project/gradlew

      - name: Build Debug APK with Gradle
        run: |
          if [ -f "./gradlew" ]; then
            ./gradlew assembleDebug --stacktrace
          else
            cd android-project && ./gradlew assembleDebug --stacktrace
          fi

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: ReelCounter-APK
          path: "**/app/build/outputs/apk/debug/*.apk"
          retention-days: 30

      - name: Create GitHub Release with APK
        uses: softprops/action-gh-release@v2
        if: github.event_name == 'workflow_dispatch' || startsWith(github.ref, 'refs/tags/')
        with:
          files: "**/app/build/outputs/apk/debug/*.apk"
          name: "ReelCounter Native Android App v1.0.0"
          tag_name: "v1.0.0-\${{ github.run_number }}"
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`,
  },
  {
    fileName: 'PermissionManager.kt',
    category: 'Auto Permissions',
    code: `package com.reelcounter.app.permission

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings

object PermissionManager {
    fun hasUsageStatsPermission(context: Context): Boolean { ... }
    fun hasAccessibilityPermission(context: Context): Boolean { ... }
    fun hasOverlayPermission(context: Context): Boolean { ... }
    fun hasNotificationPermission(context: Context): Boolean { ... }
    fun isBatteryOptimizationIgnored(context: Context): Boolean { ... }

    fun getNextPendingStep(context: Context): PermissionStepType? {
        val states = getAllPermissionStates(context)
        return states.firstOrNull { !it.isGranted }?.step
    }

    /** Launches the exact system setting screen step-by-step */
    fun launchStepIntent(activity: Activity, step: PermissionStepType) {
        when (step) {
            PermissionStepType.USAGE_ACCESS -> activity.startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
            PermissionStepType.ACCESSIBILITY -> activity.startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
            PermissionStepType.OVERLAY -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    activity.startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:\${activity.packageName}")))
                }
            }
            PermissionStepType.NOTIFICATIONS -> { ... }
            PermissionStepType.BATTERY_OPTIMIZATION -> { ... }
        }
    }
}`,
  },
  {
    fileName: 'ReelCounterAccessibilityService.kt',
    category: 'Service',
    code: `package com.reelcounter.app.service

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import com.reelcounter.app.ReelCounterApp
import com.reelcounter.app.detector.DetectorEngine
import kotlinx.coroutines.*

class ReelCounterAccessibilityService : AccessibilityService() {
    private val serviceScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    private lateinit var detectorEngine: DetectorEngine

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        val app = application as? ReelCounterApp ?: return
        
        serviceScope.launch {
            val rootNode = try { rootInActiveWindow } catch (e: Exception) { null }
            val result = detectorEngine.onAccessibilityEvent(event, rootNode)
            
            if (result != null && result.isNewVideo) {
                val recorded = app.repository.recordDetectedVideo(result)
                if (recorded) {
                    val count = app.repository.getTodayTotalVideos()
                    // Broadcast live count to Floating VR Goggles HUD
                    sendBroadcast(Intent(ACTION_COUNTER_UPDATED).apply {
                        putExtra(EXTRA_NEW_COUNT, count)
                    })
                }
            }
        }
    }
}`,
  },
  {
    fileName: 'FloatingVRGogglesService.kt',
    category: 'Overlay HUD',
    code: `package com.reelcounter.app.service

import android.app.Service
import android.graphics.PixelFormat
import android.view.*
import android.widget.TextView
import com.reelcounter.app.R

class FloatingVRGogglesService : Service() {
    private lateinit var windowManager: WindowManager
    private var floatingView: View? = null

    private fun setupFloatingOverlay() {
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 100; y = 300
        }

        floatingView = LayoutInflater.from(this).inflate(R.layout.layout_floating_vr_hud, null)
        windowManager.addView(floatingView, params)
    }
}`,
  },
  {
    fileName: 'YouTubeShortsDetector.kt',
    category: 'Detector',
    code: `package com.reelcounter.app.detector.apps

import android.view.accessibility.AccessibilityNodeInfo
import com.reelcounter.app.detector.VideoDetector

class YouTubeShortsDetector : VideoDetector {
    override val targetPackage = "com.google.android.youtube"

    override fun isInShortVideoFeed(rootNode: AccessibilityNodeInfo?): Boolean {
        if (rootNode == null) return false
        // Strictly distinguish Shorts reel player from standard long-form watch pages
        val hasReelRecycler = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/reel_recycler").isNotEmpty()
        val hasReelPlayer = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/reel_player_page").isNotEmpty()
        return hasReelRecycler || hasReelPlayer
    }
}`,
  },
];

export const SourceViewer: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentSnippet = KOTLIN_SNIPPETS[selectedFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <Code2 className="w-5 h-5" />
          <h3 className="font-extrabold text-sm text-white tracking-wide">
            Android Studio &amp; CI/CD Source Explorer
          </h3>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* File selector pills */}
      <div className="flex flex-wrap gap-1.5">
        {KOTLIN_SNIPPETS.map((snippet, idx) => (
          <button
            key={snippet.fileName}
            type="button"
            onClick={() => setSelectedFileIndex(idx)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1 transition-all ${
              selectedFileIndex === idx
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3 h-3" />
            {snippet.fileName}
          </button>
        ))}
      </div>

      {/* Code Display */}
      <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800/90 overflow-x-auto max-h-64 font-mono text-[11px] text-cyan-300/90 leading-relaxed">
        <pre>{currentSnippet.code}</pre>
      </div>
    </div>
  );
};
