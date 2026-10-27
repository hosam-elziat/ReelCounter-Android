package com.reelcounter.app.data.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.reelcounter.app.data.model.DailyAppStatistics
import kotlinx.coroutines.flow.Flow

@Dao
interface DailyAppStatisticsDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(stats: DailyAppStatistics)

    @Query("SELECT * FROM daily_app_statistics WHERE date = :date")
    fun getStatsForDateFlow(date: String): Flow<List<DailyAppStatistics>>

    @Query("SELECT * FROM daily_app_statistics WHERE date = :date")
    suspend fun getStatsForDate(date: String): List<DailyAppStatistics>

    @Query("SELECT * FROM daily_app_statistics WHERE date = :date AND applicationPackage = :pkg LIMIT 1")
    suspend fun getStatsForApp(date: String, pkg: String): DailyAppStatistics?

    @Query("SELECT * FROM daily_app_statistics WHERE date >= :startDate AND date <= :endDate ORDER BY date DESC")
    suspend fun getStatsBetweenDates(startDate: String, endDate: String): List<DailyAppStatistics>

    @Query("SELECT SUM(videoCount) FROM daily_app_statistics WHERE date = :date")
    suspend fun getTotalVideosForDate(date: String): Int?

    @Query("SELECT SUM(estimatedViewingSeconds) FROM daily_app_statistics WHERE date = :date")
    suspend fun getTotalSecondsForDate(date: String): Long?

    @Query("DELETE FROM daily_app_statistics WHERE date = :date")
    suspend fun deleteStatsForDate(date: String)

    @Query("DELETE FROM daily_app_statistics")
    suspend fun clearAllStats()
}
