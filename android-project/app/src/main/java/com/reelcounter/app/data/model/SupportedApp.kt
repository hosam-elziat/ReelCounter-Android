package com.reelcounter.app.data.model

data class SupportedApp(
    val packageId: String,
    val nameResId: Int,
    val isEnabled: Boolean = true,
    val detectionStatus: DetectionStatus = DetectionStatus.MONITORED,
    val confidenceRating: ConfidenceRating = ConfidenceRating.HIGH,
    val defaultThresholdMs: Long = 1500L,
    val primaryColorHex: String = "#3B82F6"
)

enum class DetectionStatus {
    MONITORED,
    PAUSED,
    DISABLED,
    UNSUPPORTED
}

enum class ConfidenceRating {
    HIGH,       // Exact node/author/video id match
    HEURISTIC,  // Scroll delta with layout verify
    UNCERTAIN   // Fallback pattern matching
}
