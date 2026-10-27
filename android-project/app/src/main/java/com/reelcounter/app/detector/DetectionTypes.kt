package com.reelcounter.app.detector

enum class DetectionMethod {
    EXACT_NODE_ID,
    FEED_CONTAINER_SCROLL,
    PAGER_SWIPE_TRANSITION,
    FALLBACK_HEURISTIC
}

enum class DetectionConfidence {
    EXACT,
    HIGH,
    HEURISTIC,
    UNCERTAIN
}

data class DetectionResult(
    val isNewVideo: Boolean,
    val packageName: String,
    val deduplicationKey: String?,
    val confidence: DetectionConfidence,
    val method: DetectionMethod,
    val estimatedDurationMs: Long = 0L,
    val reason: String = ""
)
