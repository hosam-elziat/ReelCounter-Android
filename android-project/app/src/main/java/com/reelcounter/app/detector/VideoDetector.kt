package com.reelcounter.app.detector

import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

interface VideoDetector {
    /** The Android package ID handled by this detector */
    val targetPackage: String

    /** Friendly name of the app */
    val appName: String

    /** Check if current screen is within the short-form video player */
    fun isInShortVideoFeed(rootNode: AccessibilityNodeInfo?): Boolean

    /** Process an accessibility event and determine if a new short video transition happened */
    fun processEvent(
        event: AccessibilityEvent,
        rootNode: AccessibilityNodeInfo?,
        lastVideoTimeMs: Long,
        minThresholdMs: Long
    ): DetectionResult
}
