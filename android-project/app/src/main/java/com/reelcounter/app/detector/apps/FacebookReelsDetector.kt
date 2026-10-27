package com.reelcounter.app.detector.apps

import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.reelcounter.app.detector.DetectionConfidence
import com.reelcounter.app.detector.DetectionMethod
import com.reelcounter.app.detector.DetectionResult
import com.reelcounter.app.detector.VideoDetector

class FacebookReelsDetector : VideoDetector {
    override val targetPackage: String = "com.facebook.katana"
    override val appName: String = "Facebook Reels"

    override fun isInShortVideoFeed(rootNode: AccessibilityNodeInfo?): Boolean {
        if (rootNode == null) return false
        val hasReelsContainer = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/fb_shorts_container").isNotEmpty()
        val hasReelsViewer = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/fb_reels_viewer_root").isNotEmpty()
        val hasReelsFollow = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/fb_shorts_follow_button").isNotEmpty()
        return hasReelsContainer || hasReelsViewer || hasReelsFollow
    }

    override fun processEvent(
        event: AccessibilityEvent,
        rootNode: AccessibilityNodeInfo?,
        lastVideoTimeMs: Long,
        minThresholdMs: Long
    ): DetectionResult {
        if (!isInShortVideoFeed(rootNode)) {
            return notCounted("Standard Facebook news feed or text post")
        }

        var deduplicationKey: String? = null
        var confidence = DetectionConfidence.HIGH
        var method = DetectionMethod.EXACT_NODE_ID

        if (rootNode != null) {
            val authorNodes = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/fb_shorts_creator_name")
            val author = authorNodes.firstOrNull()?.text?.toString()?.trim()

            if (!author.isNullOrEmpty()) {
                deduplicationKey = "fb_reel_${author}_${System.currentTimeMillis() / 4000}"
                confidence = DetectionConfidence.EXACT
            }
        }

        if (deduplicationKey == null && event.eventType == AccessibilityEvent.TYPE_VIEW_SCROLLED) {
            deduplicationKey = "fb_scroll_${event.itemCount}_${event.toIndex}"
            confidence = DetectionConfidence.HEURISTIC
            method = DetectionMethod.FEED_CONTAINER_SCROLL
        }

        if (deduplicationKey == null) {
            return notCounted("Could not identify Facebook Reel transition")
        }

        val now = System.currentTimeMillis()
        val estimatedDuration = if (lastVideoTimeMs > 0) now - lastVideoTimeMs else 11000L

        return DetectionResult(
            isNewVideo = true,
            packageName = targetPackage,
            deduplicationKey = deduplicationKey,
            confidence = confidence,
            method = method,
            estimatedDurationMs = estimatedDuration,
            reason = "Facebook Reel video transition confirmed"
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
