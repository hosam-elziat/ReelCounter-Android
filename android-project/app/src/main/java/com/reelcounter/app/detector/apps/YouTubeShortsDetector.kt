package com.reelcounter.app.detector.apps

import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.reelcounter.app.detector.DetectionConfidence
import com.reelcounter.app.detector.DetectionMethod
import com.reelcounter.app.detector.DetectionResult
import com.reelcounter.app.detector.VideoDetector

class YouTubeShortsDetector : VideoDetector {
    override val targetPackage: String = "com.google.android.youtube"
    override val appName: String = "YouTube Shorts"

    override fun isInShortVideoFeed(rootNode: AccessibilityNodeInfo?): Boolean {
        if (rootNode == null) return false

        // Distinguish Shorts from ordinary long-form video player
        val hasReelRecycler = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/reel_recycler").isNotEmpty()
        val hasReelPlayer = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/reel_player_page").isNotEmpty()
        val hasReelWatchFragment = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/reel_watch_fragment").isNotEmpty()
        val hasPivotShorts = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/reel_channel_name").isNotEmpty()

        return hasReelRecycler || hasReelPlayer || hasReelWatchFragment || hasPivotShorts
    }

    override fun processEvent(
        event: AccessibilityEvent,
        rootNode: AccessibilityNodeInfo?,
        lastVideoTimeMs: Long,
        minThresholdMs: Long
    ): DetectionResult {
        // Strict gate: Ensure user is inside Shorts player, NOT ordinary watch page
        if (!isInShortVideoFeed(rootNode)) {
            return notCounted("Standard YouTube video or home browse feed - not a Short")
        }

        // Avoid incrementing if comments bottom sheet is opened
        if (rootNode != null) {
            val commentsSheet = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/comment_sheet_container").isNotEmpty()
            if (commentsSheet) {
                return notCounted("Inside Shorts comments bottom sheet")
            }
        }

        var deduplicationKey: String? = null
        var confidence = DetectionConfidence.HIGH
        var method = DetectionMethod.EXACT_NODE_ID

        if (rootNode != null) {
            val channelNodes = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/reel_channel_name")
            val titleNodes = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/title")
            val channel = channelNodes.firstOrNull()?.text?.toString()?.trim()
            val title = titleNodes.firstOrNull()?.text?.toString()?.trim()

            if (!channel.isNullOrEmpty()) {
                deduplicationKey = "yt_shorts_${channel}_${title?.take(15)?.hashCode() ?: 0}"
                confidence = DetectionConfidence.EXACT
            }
        }

        if (deduplicationKey == null && event.eventType == AccessibilityEvent.TYPE_VIEW_SCROLLED) {
            deduplicationKey = "yt_shorts_scroll_${event.itemCount}_${event.toIndex}"
            confidence = DetectionConfidence.HEURISTIC
            method = DetectionMethod.FEED_CONTAINER_SCROLL
        }

        if (deduplicationKey == null) {
            return notCounted("Could not establish YouTube Short signature")
        }

        val now = System.currentTimeMillis()
        val estimatedDuration = if (lastVideoTimeMs > 0) now - lastVideoTimeMs else 18000L

        return DetectionResult(
            isNewVideo = true,
            packageName = targetPackage,
            deduplicationKey = deduplicationKey,
            confidence = confidence,
            method = method,
            estimatedDurationMs = estimatedDuration,
            reason = "YouTube Shorts video switch identified"
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
