package com.reelcounter.app.detector.apps

import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.reelcounter.app.detector.DetectionConfidence
import com.reelcounter.app.detector.DetectionMethod
import com.reelcounter.app.detector.DetectionResult
import com.reelcounter.app.detector.VideoDetector

class TikTokDetector(override val targetPackage: String = "com.zhiliaoapp.musically") : VideoDetector {
    override val appName = "TikTok"

    override fun isInShortVideoFeed(rootNode: AccessibilityNodeInfo?): Boolean {
        if (rootNode == null) return false
        // Detect TikTok vertical feed container or video overlay controls
        val hasAuthor = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/author_name").isNotEmpty()
        val hasPager = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/viewpager").isNotEmpty()
        val hasFeedRoot = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/main_feed_container").isNotEmpty()
        return hasAuthor || hasPager || hasFeedRoot
    }

    override fun processEvent(
        event: AccessibilityEvent,
        rootNode: AccessibilityNodeInfo?,
        lastVideoTimeMs: Long,
        minThresholdMs: Long
    ): DetectionResult {
        // Disregard non-relevant events like typing or notifications
        if (event.eventType != AccessibilityEvent.TYPE_VIEW_SCROLLED &&
            event.eventType != AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED &&
            event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            return notCounted("Irrelevant event type: ${event.eventType}")
        }

        // Check if user is in comment sheet or user profile
        if (rootNode != null) {
            val isCommentSheetOpen = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/comment_list").isNotEmpty()
            if (isCommentSheetOpen) {
                return notCounted("Inside comment drawer")
            }
        }

        // Try exact author/title identification
        var deduplicationKey: String? = null
        var confidence = DetectionConfidence.HIGH
        var method = DetectionMethod.EXACT_NODE_ID

        if (rootNode != null) {
            val authorNodes = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/author_name")
            val descNodes = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/desc")
            val author = authorNodes.firstOrNull()?.text?.toString()?.trim()
            val desc = descNodes.firstOrNull()?.text?.toString()?.trim()

            if (!author.isNullOrEmpty()) {
                deduplicationKey = "tt_${author}_${desc?.take(20)?.hashCode() ?: 0}"
                confidence = DetectionConfidence.EXACT
                method = DetectionMethod.EXACT_NODE_ID
            }
        }

        // If no node ID is accessible (e.g. obfuscated or security policy), fallback to scroll pager heuristic
        if (deduplicationKey == null) {
            if (event.eventType == AccessibilityEvent.TYPE_VIEW_SCROLLED) {
                val scrollIndex = event.toIndex
                deduplicationKey = "tt_scroll_${event.itemCount}_$scrollIndex"
                confidence = DetectionConfidence.HEURISTIC
                method = DetectionMethod.FEED_CONTAINER_SCROLL
            } else {
                return notCounted("No unique TikTok video identifier detected")
            }
        }

        val now = System.currentTimeMillis()
        val estimatedDuration = if (lastVideoTimeMs > 0) now - lastVideoTimeMs else 12000L

        return DetectionResult(
            isNewVideo = true,
            packageName = targetPackage,
            deduplicationKey = deduplicationKey,
            confidence = confidence,
            method = method,
            estimatedDurationMs = estimatedDuration,
            reason = "TikTok short-form video transition confirmed"
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
