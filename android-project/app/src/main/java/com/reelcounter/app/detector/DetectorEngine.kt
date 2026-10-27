package com.reelcounter.app.detector

import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.reelcounter.app.detector.apps.*
import java.util.concurrent.ConcurrentHashMap

class DetectorEngine(
    private var minThresholdMs: Long = 1500L
) {
    private val detectors = ConcurrentHashMap<String, VideoDetector>()
    private val lastCountedTime = ConcurrentHashMap<String, Long>()
    private val lastSeenKey = ConcurrentHashMap<String, String>()

    init {
        registerDetector(TikTokDetector("com.zhiliaoapp.musically"))
        registerDetector(TikTokDetector("com.ss.android.ugc.trill"))
        registerDetector(InstagramReelsDetector())
        registerDetector(YouTubeShortsDetector())
        registerDetector(FacebookReelsDetector())
        registerDetector(SnapchatSpotlightDetector())
    }

    fun registerDetector(detector: VideoDetector) {
        detectors[detector.targetPackage] = detector
    }

    fun setMinThresholdMs(thresholdMs: Long) {
        this.minThresholdMs = thresholdMs
    }

    fun canHandle(packageName: String): Boolean {
        return detectors.containsKey(packageName)
    }

    fun onAccessibilityEvent(
        event: AccessibilityEvent,
        rootNode: AccessibilityNodeInfo?
    ): DetectionResult? {
        val packageName = event.packageName?.toString() ?: return null
        val detector = detectors[packageName] ?: return null

        val now = System.currentTimeMillis()
        val lastTime = lastCountedTime[packageName] ?: 0L

        // Fast duration gate check
        val elapsed = now - lastTime
        if (elapsed < minThresholdMs && lastTime > 0) {
            return DetectionResult(
                isNewVideo = false,
                packageName = packageName,
                deduplicationKey = null,
                confidence = DetectionConfidence.HEURISTIC,
                method = DetectionMethod.FALLBACK_HEURISTIC,
                reason = "Skipped: viewing duration ($elapsed ms) below threshold ($minThresholdMs ms)"
            )
        }

        // Delegate to app-specific detector
        val result = detector.processEvent(event, rootNode, lastTime, minThresholdMs)

        if (result.isNewVideo) {
            // Deduplication verification
            val prevKey = lastSeenKey[packageName]
            if (result.deduplicationKey != null && result.deduplicationKey == prevKey) {
                return result.copy(isNewVideo = false, reason = "Duplicate key within same session")
            }

            // Update state
            lastCountedTime[packageName] = now
            if (result.deduplicationKey != null) {
                lastSeenKey[packageName] = result.deduplicationKey
            }
        }

        return result
    }

    fun resetSession(packageName: String) {
        lastCountedTime.remove(packageName)
        lastSeenKey.remove(packageName)
    }

    fun resetAll() {
        lastCountedTime.clear()
        lastSeenKey.clear()
    }
}
