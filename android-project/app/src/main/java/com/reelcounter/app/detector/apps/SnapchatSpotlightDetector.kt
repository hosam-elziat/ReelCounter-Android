package com.reelcounter.app.detector.apps

import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.reelcounter.app.detector.DetectionConfidence
import com.reelcounter.app.detector.DetectionMethod
import com.reelcounter.app.detector.DetectionResult
import com.reelcounter.app.detector.VideoDetector

class SnapchatSpotlightDetector : VideoDetector {
    override val targetPackage: String = "com.snapchat.android"
    override val appName: String = "Snapchat Spotlight"

    override fun isInShortVideoFeed(rootNode: AccessibilityNodeInfo?): Boolean {
        if (rootNode == null) return false
        val hasSpotlightFeed = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/spotlight_feed_container").isNotEmpty()
        val hasSpotlightPlayer = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/spotlight_viewer_view").isNotEmpty()
        val hasSpotlightUser = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/spotlight_creator_attribution").isNotEmpty()
        return hasSpotlightFeed || hasSpotlightPlayer || hasSpotlightUser
    }

    override fun processEvent(
        event: AccessibilityEvent,
        rootNode: AccessibilityNodeInfo?,
        lastVideoTimeMs: Long,
        minThresholdMs: Long
    ): DetectionResult {
        // Must be in Spotlight feed, NOT personal camera or friend story or snap chat
        if (!isInShortVideoFeed(rootNode)) {
            return notCounted("Standard Snapchat camera or private chat screen")
        }

        var deduplicationKey: String? = null
        var confidence = DetectionConfidence.HIGH
        var method = DetectionMethod.EXACT_NODE_ID

        if (rootNode != null) {
            val userNodes = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/spotlight_creator_attribution")
            val creator = userNodes.firstOrNull()?.text?.toString()?.trim()

            if (!creator.isNullOrEmpty()) {
                deduplicationKey = "snap_spotlight_${creator}_${System.currentTimeMillis() / 5000}"
                confidence = DetectionConfidence.EXACT
            }
        }

        if (deduplicationKey == null && event.eventType == AccessibilityEvent.TYPE_VIEW_SCROLLED) {
            deduplicationKey = "snap_scroll_${event.itemCount}_${event.toIndex}"
            confidence = DetectionConfidence.HEURISTIC
            method = DetectionMethod.FEED_CONTAINER_SCROLL
        }

        if (deduplicationKey == null) {
            return notCounted("Spotlight feed item signature unavailable")
        }

        val now = System.currentTimeMillis()
        val estimatedDuration = if (lastVideoTimeMs > 0) now - lastVideoTimeMs else 10000L

        return DetectionResult(
            isNewVideo = true,
            packageName = targetPackage,
            deduplicationKey = deduplicationKey,
            confidence = confidence,
            method = method,
            estimatedDurationMs = estimatedDuration,
            reason = "Snapchat Spotlight video transition confirmed"
        )
    }

    private fun notCounted(reason: String): DetectionResult {
        return DetectionResult(
            isNewVideo = false,
            packageName = targetPackage,
            deduplicationKey = null,
            confidence = DetectionConfidence.UNCERTAIN,
            method = DetectionMethod.FALLBACK_HEURISTIC,
            reason = reason
        )
    }
}
