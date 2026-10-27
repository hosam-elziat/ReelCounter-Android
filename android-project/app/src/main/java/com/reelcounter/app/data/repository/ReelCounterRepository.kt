package com.reelcounter.app.data.repository

import android.content.Context
import com.reelcounter.app.data.database.AppDatabase
import com.reelcounter.app.data.model.DailyAppStatistics
import com.reelcounter.app.data.model.VideoViewEvent
import com.reelcounter.app.detector.DetectionResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import java.io.File
import java.text.SimpleDateFormat
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.*

class ReelCounterRepository(
    private val database: AppDatabase,
    private val context: Context
) {

    private val eventDao = database.videoViewEventDao()
    private val statsDao = database.dailyAppStatisticsDao()

    fun getTodayDate(): String {
        return try {
            LocalDate.now(ZoneId.systemDefault()).format(DateTimeFormatter.ISO_LOCAL_DATE)
        } catch (e: Throwable) {
            val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            sdf.format(Date())
        }
    }

    fun getYesterdayDate(): String {
        return try {
            LocalDate.now(ZoneId.systemDefault()).minusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE)
        } catch (e: Throwable) {
            val cal = Calendar.getInstance()
            cal.add(Calendar.DAY_OF_YEAR, -1)
            SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(cal.time)
        }
    }

    fun getTodayCountFlow(): Flow<Int> {
        return eventDao.getTodayCountFlow(getTodayDate())
    }

    fun getTodayStatsFlow(): Flow<List<DailyAppStatistics>> {
        return statsDao.getStatsForDateFlow(getTodayDate())
    }

    suspend fun recordDetectedVideo(result: DetectionResult): Boolean = withContext(Dispatchers.IO) {
        if (!result.isNewVideo) return@withContext false

        val today = getTodayDate()
        val now = System.currentTimeMillis()

        // Deduplication check: check if same deduplicationKey occurred within last 1200ms
        if (!result.deduplicationKey.isNullOrEmpty()) {
            val duplicate = eventDao.findRecentDuplicate(result.deduplicationKey, now - 1200L)
            if (duplicate != null) {
                return@withContext false
            }
        }

        // Insert event
        val event = VideoViewEvent(
            applicationPackage = result.packageName,
            detectedAt = now,
            localDate = today,
            detectionConfidence = result.confidence.name,
            detectionMethod = result.method.name,
            deduplicationKey = result.deduplicationKey,
            estimatedViewingDurationMs = result.estimatedDurationMs,
            isCounted = true
        )
        eventDao.insertEvent(event)

        // Update daily aggregate
        val existingStat = statsDao.getStatsForApp(today, result.packageName)
        val isUncertain = result.confidence.name == "UNCERTAIN"
        val addedDurationSec = if (result.estimatedDurationMs > 0) result.estimatedDurationMs / 1000 else 15L // fallback avg 15s

        val updated = if (existingStat != null) {
            existingStat.copy(
                videoCount = existingStat.videoCount + 1,
                estimatedViewingSeconds = existingStat.estimatedViewingSeconds + addedDurationSec,
                uncertainEventCount = existingStat.uncertainEventCount + if (isUncertain) 1 else 0,
                lastUpdated = now
            )
        } else {
            DailyAppStatistics(
                date = today,
                applicationPackage = result.packageName,
                videoCount = 1,
                estimatedViewingSeconds = addedDurationSec,
                uncertainEventCount = if (isUncertain) 1 else 0,
                sessionsCount = 1,
                lastUpdated = now
            )
        }
        statsDao.insertOrUpdate(updated)
        return@withContext true
    }

    suspend fun getTodayTotalVideos(): Int = withContext(Dispatchers.IO) {
        return@withContext statsDao.getTotalVideosForDate(getTodayDate()) ?: 0
    }

    suspend fun getYesterdayTotalVideos(): Int = withContext(Dispatchers.IO) {
        return@withContext statsDao.getTotalVideosForDate(getYesterdayDate()) ?: 0
    }

    suspend fun getHistoricalStats(days: Int): List<DailyAppStatistics> = withContext(Dispatchers.IO) {
        val today = LocalDate.now(ZoneId.systemDefault())
        val start = today.minusDays(days.toLong()).format(DateTimeFormatter.ISO_LOCAL_DATE)
        val end = today.format(DateTimeFormatter.ISO_LOCAL_DATE)
        return@withContext statsDao.getStatsBetweenDates(start, end)
    }

    suspend fun exportHistoryToCsv(): String = withContext(Dispatchers.IO) {
        val today = LocalDate.now(ZoneId.systemDefault())
        val start = today.minusDays(90).format(DateTimeFormatter.ISO_LOCAL_DATE)
        val end = today.format(DateTimeFormatter.ISO_LOCAL_DATE)
        val records = statsDao.getStatsBetweenDates(start, end)

        val sb = StringBuilder()
        sb.append("Date,Package,AppName,VideoCount,EstimatedViewingMinutes,UncertainEvents\n")

        val appNames = mapOf(
            "com.zhiliaoapp.musically" to "TikTok",
            "com.ss.android.ugc.trill" to "TikTok",
            "com.instagram.android" to "Instagram Reels",
            "com.facebook.katana" to "Facebook Reels",
            "com.google.android.youtube" to "YouTube Shorts",
            "com.snapchat.android" to "Snapchat Spotlight"
        )

        for (r in records) {
            val friendly = appNames[r.applicationPackage] ?: r.applicationPackage
            val mins = r.estimatedViewingSeconds / 60
            sb.append("${r.date},\"${r.applicationPackage}\",\"$friendly\",${r.videoCount},$mins,${r.uncertainEventCount}\n")
        }

        val exportFile = File(context.cacheDir, "ReelCounter_export_${System.currentTimeMillis()}.csv")
        exportFile.writeText(sb.toString())
        return@withContext exportFile.absolutePath
    }

    suspend fun clearAllData() = withContext(Dispatchers.IO) {
        eventDao.clearAllEvents()
        statsDao.clearAllStats()
    }
}
