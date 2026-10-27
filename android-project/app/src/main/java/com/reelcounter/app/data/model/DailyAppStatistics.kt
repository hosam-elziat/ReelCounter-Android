package com.reelcounter.app.data.model

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Aggregated daily statistics per supported application package.
 */
@Entity(
    tableName = "daily_app_statistics",
    indices = [
        Index(value = ["date", "applicationPackage"], unique = true)
    ]
)
data class DailyAppStatistics(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val date: String, // Format: YYYY-MM-DD
    val applicationPackage: String,
    val videoCount: Int = 0,
    val estimatedViewingSeconds: Long = 0L,
    val uncertainEventCount: Int = 0,
    val sessionsCount: Int = 0,
    val lastUpdated: Long = System.currentTimeMillis()
)
