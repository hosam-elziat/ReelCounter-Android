package com.reelcounter.app.data.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.reelcounter.app.data.model.VideoViewEvent
import kotlinx.coroutines.flow.Flow

@Dao
interface VideoViewEventDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEvent(event: VideoViewEvent): Long

    @Query("SELECT COUNT(*) FROM video_view_events WHERE localDate = :date AND isCounted = 1")
    fun getTodayCountFlow(date: String): Flow<Int>

    @Query("SELECT COUNT(*) FROM video_view_events WHERE localDate = :date AND isCounted = 1")
    suspend fun getTodayCount(date: String): Int

    @Query("SELECT COUNT(*) FROM video_view_events WHERE localDate = :date AND applicationPackage = :pkg AND isCounted = 1")
    suspend fun getCountByPackage(date: String, pkg: String): Int

    @Query("SELECT * FROM video_view_events WHERE localDate = :date ORDER BY detectedAt DESC")
    fun getEventsForDateFlow(date: String): Flow<List<VideoViewEvent>>

    @Query("SELECT * FROM video_view_events WHERE detectedAt >= :sinceTimestamp ORDER BY detectedAt ASC")
    suspend fun getEventsSince(sinceTimestamp: Long): List<VideoViewEvent>

    @Query("SELECT * FROM video_view_events WHERE deduplicationKey = :key AND detectedAt >= :cutoffTime LIMIT 1")
    suspend fun findRecentDuplicate(key: String, cutoffTime: Long): VideoViewEvent?

    @Query("DELETE FROM video_view_events WHERE localDate = :date")
    suspend fun deleteEventsForDate(date: String)

    @Query("DELETE FROM video_view_events")
    suspend fun clearAllEvents()
}
