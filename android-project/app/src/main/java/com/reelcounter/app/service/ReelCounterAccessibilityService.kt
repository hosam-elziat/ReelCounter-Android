package com.reelcounter.app.service

import android.accessibilityservice.AccessibilityService
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import androidx.core.app.NotificationCompat
import com.reelcounter.app.R
import com.reelcounter.app.ReelCounterApp
import com.reelcounter.app.detector.DetectorEngine
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first

class ReelCounterAccessibilityService : AccessibilityService() {

    private val serviceScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    private lateinit var detectorEngine: DetectorEngine

    companion object {
        const val ACTION_COUNTER_UPDATED = "com.reelcounter.app.ACTION_COUNTER_UPDATED"
        const val EXTRA_NEW_COUNT = "extra_new_count"
        const val EXTRA_PACKAGE_NAME = "extra_package_name"
        private const val CHANNEL_LIMIT = "reelcounter_limit_alerts"
        private const val NOTIF_LIMIT_ID = 2001
        private const val TAG = "ReelCounterService"
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.i(TAG, "ReelCounter Accessibility Service Connected")
        detectorEngine = DetectorEngine()

        // Sync threshold from user preferences
        serviceScope.launch {
            val prefs = (application as ReelCounterApp).preferencesManager
            val threshold = prefs.minDurationThresholdFlow.first()
            detectorEngine.setMinThresholdMs(threshold)
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        val app = application as? ReelCounterApp ?: return
        val prefs = app.preferencesManager
        val repository = app.repository

        serviceScope.launch {
            // Check if user paused monitoring
            val isPaused = prefs.isMonitoringPausedFlow.first()
            if (isPaused) return@launch

            val rootNode = try {
                rootInActiveWindow
            } catch (e: Exception) {
                null
            }

            val result = detectorEngine.onAccessibilityEvent(event, rootNode)
            if (result != null && result.isNewVideo) {
                val recorded = repository.recordDetectedVideo(result)
                if (recorded) {
                    val totalToday = repository.getTodayTotalVideos()
                    Log.d(TAG, "New video counted! Total today: $totalToday in ${result.packageName}")

                    // Send broadcast to Floating HUD
                    val updateIntent = Intent(ACTION_COUNTER_UPDATED).apply {
                        putExtra(EXTRA_NEW_COUNT, totalToday)
                        putExtra(EXTRA_PACKAGE_NAME, result.packageName)
                        setPackage(packageName)
                    }
                    sendBroadcast(updateIntent)

                    // Check daily threshold alert
                    val dailyLimit = prefs.dailyLimitFlow.first()
                    val todayDate = repository.getTodayDate()
                    if (totalToday >= dailyLimit && dailyLimit > 0) {
                        val alreadyNotified = prefs.isLimitNotifiedToday(todayDate)
                        if (!alreadyNotified) {
                            showDailyLimitNotification(totalToday, dailyLimit)
                            prefs.markLimitNotifiedForToday(todayDate)
                        }
                    }
                }
            }
        }
    }

    override fun onInterrupt() {
        Log.w(TAG, "ReelCounter Accessibility Service interrupted")
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
    }

    private fun showDailyLimitNotification(count: Int, limit: Int) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_LIMIT,
                "Daily Goal Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifies when daily short-form video viewing limits are crossed"
            }
            notificationManager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(this, CHANNEL_LIMIT)
            .setSmallIcon(R.drawable.ic_vr_goggles)
            .setContentTitle(getString(R.string.notification_title_limit))
            .setContentText(getString(R.string.notification_text_limit, count))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(NOTIF_LIMIT_ID, notification)
    }
}
