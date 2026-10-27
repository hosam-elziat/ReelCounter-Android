package com.reelcounter.app.detector.apps

import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.reelcounter.app.detector.DetectionConfidence
import com.reelcounter.app.detector.DetectionMethod
import com.reelcounter.app.detector.DetectionResult
import com.reelcounter.app.detector.VideoDetector

class InstagramReelsDetector : VideoDetector {
    override val targetPackage: String = "com.instagram.android"
    override val appName: String = "Instagram Reels"

    override fun isInShortVideoFeed(rootNode: AccessibilityNodeInfo?): Boolean {
        if (rootNode == null) return false
        val hasClipsPager = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/clips_viewer_view_pager").isNotEmpty()
        val hasClipsContainer = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/clips_video_container").isNotEmpty()
        val hasReelsAudio = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/audio_pill").isNotEmpty()
        return hasClipsPager || hasClipsContainer || hasReelsAudio
    }

    override fun processEvent(
        event: AccessibilityEvent,
        rootNode: AccessibilityNodeInfo?,
        lastVideoTimeMs: Long,
        minThresholdMs: Long
    ): DetectionResult {
        if (!isInShortVideoFeed(rootNode)) {
            return notCounted("Not in Instagram Reels / Clips viewer (standard feed or stories)")
        }

        // Avoid counting when comments or share sheet is expanded
        if (rootNode != null) {
            val commentsOpen = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/layout_comment_thread").isNotEmpty()
            if (commentsOpen) {
                return notCounted("Inside Instagram comments thread")
            }
        }

        var deduplicationKey: String? = null
        var confidence = DetectionConfidence.HIGH
        var method = DetectionMethod.EXACT_NODE_ID

        if (rootNode != null) {
            val authorNodes = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/row_feed_photo_profile_name")
            val audioNodes = rootNode.findAccessibilityNodeInfosByViewId("$targetPackage:id/audio_pill")
            val author = authorNodes.firstOrNull()?.text?.toString()?.trim()
            val audio = audioNodes.firstOrNull()?.text?.toString()?.trim()

            if (!author.isNullOrEmpty()) {
                deduplicationKey = "ig_reel_${author}_${audio?.hashCode() ?: 0}"
                confidence = DetectionConfidence.EXACT
            }
        }

        if (deduplicationKey == null && event.eventType == AccessibilityEvent.TYPE_VIEW_SCROLLED) {
            deduplicationKey = "ig_scroll_${event.itemCount}_${event.toIndex}"
            confidence = DetectionConfidence.HEURISTIC
            method = DetectionMethod.FEED_CONTAINER_SCROLL
        }

        if (deduplicationKey == null) {
            return notCounted("No reliable Reel transition signature")
        }

        val now = System.currentTimeMillis()
        val estimatedDuration = if (lastVideoTimeMs > 0) now - lastVideoTimeMs else 14000L

        return DetectionResult(
            isNewVideo = true,
            packageName = targetPackage,
            deduplicationKey = deduplicationKey,
            confidence = confidence,
            method = method,
            estimatedDurationMs = estimatedDuration,
            reason = "Instagram Reel view transition confirmed"
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
