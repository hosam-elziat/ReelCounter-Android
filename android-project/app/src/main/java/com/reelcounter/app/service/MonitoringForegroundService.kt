package com.reelcounter.app.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.reelcounter.app.R
import com.reelcounter.app.ReelCounterApp
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.collectLatest

class MonitoringForegroundService : Service() {

    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    companion object {
        const val CHANNEL_ID = "reelcounter_service_channel"
        const val NOTIF_ID = 3001
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(NOTIF_ID, buildNotification(0))

        scope.launch {
            val app = application as ReelCounterApp
            app.repository.getTodayCountFlow().collectLatest { count ->
                val notification = buildNotification(count)
                val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                manager.notify(NOTIF_ID, notification)
            }
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                getString(R.string.notification_channel_name),
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(count: Int) = NotificationCompat.Builder(this, CHANNEL_ID)
        .setSmallIcon(R.drawable.ic_vr_goggles)
        .setContentTitle(getString(R.string.notification_title_running))
        .setContentText(getString(R.string.notification_text_running, count))
        .setOngoing(true)
        .build()

    override fun onDestroy() {
        super.onDestroy()
        scope.cancel()
    }
}
