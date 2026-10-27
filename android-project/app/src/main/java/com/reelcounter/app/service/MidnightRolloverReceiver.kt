package com.reelcounter.app.service

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.reelcounter.app.ReelCounterApp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.util.*

class MidnightRolloverReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_MIDNIGHT_ROLLOVER = "com.reelcounter.app.ACTION_MIDNIGHT_ROLLOVER"
        private const val TAG = "MidnightRollover"

        fun scheduleNextMidnightAlarm(context: Context) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
            val intent = Intent(context, MidnightRolloverReceiver::class.java).apply {
                action = ACTION_MIDNIGHT_ROLLOVER
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context, 101, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            // Calculate milliseconds until next midnight in local device timezone
            val calendar = Calendar.getInstance().apply {
                timeInMillis = System.currentTimeMillis()
                add(Calendar.DAY_OF_YEAR, 1)
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 1)
                set(Calendar.MILLISECOND, 0)
            }

            try {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    calendar.timeInMillis,
                    pendingIntent
                )
                Log.d(TAG, "Next midnight rollover alarm set for: ${calendar.time}")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to schedule exact alarm", e)
            }
        }
    }

    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null) return
        val action = intent?.action
        Log.i(TAG, "Received broadcast action: $action")

        val app = context.applicationContext as? ReelCounterApp ?: return
        val scope = CoroutineScope(Dispatchers.IO)

        when (action) {
            ACTION_MIDNIGHT_ROLLOVER, Intent.ACTION_TIME_CHANGED, Intent.ACTION_TIMEZONE_CHANGED -> {
                // Today count will naturally be 0 for the new ISO_LOCAL_DATE in room queries.
                // We broadcast count 0 to the floating HUD view to update the badge immediately.
                val updateIntent = Intent(ReelCounterAccessibilityService.ACTION_COUNTER_UPDATED).apply {
                    putExtra(ReelCounterAccessibilityService.EXTRA_NEW_COUNT, 0)
                    setPackage(context.packageName)
                }
                context.sendBroadcast(updateIntent)

                // Reschedule for subsequent midnight
                scheduleNextMidnightAlarm(context)
            }
            Intent.ACTION_BOOT_COMPLETED -> {
                // Restore floating service if preference enabled
                scope.launch {
                    val enabled = app.preferencesManager.floatingIconEnabledFlow.first()
                    if (enabled) {
                        val serviceIntent = Intent(context, FloatingVRGogglesService::class.java)
                        context.startForegroundService(serviceIntent)
                    }
                    scheduleNextMidnightAlarm(context)
                }
            }
        }
    }
}
