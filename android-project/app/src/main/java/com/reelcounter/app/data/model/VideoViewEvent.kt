package com.reelcounter.app.data.model

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Represents an individual short-form video view event detected on the device.
 */
@Entity(
    tableName = "video_view_events",
    indices = [
        Index(value = ["localDate"]),
        Index(value = ["applicationPackage"]),
        Index(value = ["deduplicationKey"], unique = false)
    ]
)
data class VideoViewEvent(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val applicationPackage: String,
    val detectedAt: Long = System.currentTimeMillis(),
    val localDate: String, // Format: YYYY-MM-DD
    val detectionConfidence: String, // "EXACT", "HIGH", "HEURISTIC", "UNCERTAIN"
    val detectionMethod: String, // "NODE_ID_TRACKER", "SCROLL_DELTA", "CONTAINER_CHANGE"
    val deduplicationKey: String? = null,
    val estimatedViewingDurationMs: Long = 0L,
    val isCounted: Boolean = true
)
