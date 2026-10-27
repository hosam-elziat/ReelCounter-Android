package com.reelcounter.app.service

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.*
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.app.NotificationCompat
import com.reelcounter.app.MainActivity
import com.reelcounter.app.R
import com.reelcounter.app.ReelCounterApp
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first

class FloatingVRGogglesService : Service() {

    private lateinit var windowManager: WindowManager
    private var floatingView: View? = null
    private var isExpanded = false
    private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    private var currentCount = 0

    companion object {
        private const val CHANNEL_OVERLAY = "reelcounter_overlay_channel"
        private const val NOTIFICATION_ID = 1001
        const val ACTION_STOP_OVERLAY = "com.reelcounter.app.ACTION_STOP_OVERLAY"
        const val ACTION_TOGGLE_PAUSE = "com.reelcounter.app.ACTION_TOGGLE_PAUSE"
    }

    private val counterReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == ReelCounterAccessibilityService.ACTION_COUNTER_UPDATED) {
                val newCount = intent.getIntExtra(ReelCounterAccessibilityService.EXTRA_NEW_COUNT, currentCount)
                currentCount = newCount
                updateBadgeUI(newCount)
            }
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        startForeground(NOTIFICATION_ID, createForegroundNotification())
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        // Register counter receiver
        val filter = IntentFilter(ReelCounterAccessibilityService.ACTION_COUNTER_UPDATED)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(counterReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(counterReceiver, filter)
        }

        serviceScope.launch {
            val app = application as ReelCounterApp
            currentCount = app.repository.getTodayTotalVideos()
            setupFloatingView()
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    private suspend fun setupFloatingView() {
        val app = application as ReelCounterApp
        val prefs = app.preferencesManager

        val savedX = prefs.floatingPosXFlow.first()
        val savedY = prefs.floatingPosYFlow.first()
        val opacity = prefs.floatingIconOpacityFlow.first()

        val layoutParamsType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutParamsType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = savedX
            y = savedY
        }

        val inflater = LayoutInflater.from(this)
        val root = inflater.inflate(R.layout.layout_floating_vr_hud, null)
        root.alpha = opacity
        floatingView = root

        val iconGoggles = root.findViewById<ImageView>(R.id.img_vr_goggles)
        val badgeText = root.findViewById<TextView>(R.id.tv_video_badge)
        val quickPanel = root.findViewById<LinearLayout>(R.id.panel_quick_dashboard)
        val btnPause = root.findViewById<TextView>(R.id.btn_hud_pause)
        val btnOpenApp = root.findViewById<TextView>(R.id.btn_hud_open)

        badgeText.text = currentCount.toString()

        var initialX = 0
        var initialY = 0
        var initialTouchX = 0f
        var initialTouchY = 0f
        var isDragging = false

        iconGoggles.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = params.x
                    initialY = params.y
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    isDragging = false
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    val dx = (event.rawX - initialTouchX).toInt()
                    val dy = (event.rawY - initialTouchY).toInt()
                    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                        isDragging = true
                        params.x = initialX + dx
                        params.y = initialY + dy
                        windowManager.updateViewLayout(root, params)
                    }
                    true
                }
                MotionEvent.ACTION_UP -> {
                    if (isDragging) {
                        serviceScope.launch {
                            prefs.saveFloatingPosition(params.x, params.y)
                        }
                    } else {
                        // Tapped: toggle quick dashboard
                        isExpanded = !isExpanded
                        quickPanel.visibility = if (isExpanded) View.VISIBLE else View.GONE
                    }
                    true
                }
                else -> false
            }
        }

        btnPause.setOnClickListener {
            serviceScope.launch {
                val paused = prefs.isMonitoringPausedFlow.first()
                prefs.setMonitoringPaused(!paused)
                btnPause.text = if (!paused) getString(R.string.floating_action_resume) else getString(R.string.floating_action_pause)
            }
        }

        btnOpenApp.setOnClickListener {
            val intent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            }
            startActivity(intent)
            isExpanded = false
            quickPanel.visibility = View.GONE
        }

        try {
            windowManager.addView(root, params)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun updateBadgeUI(count: Int) {
        floatingView?.let { view ->
            val badge = view.findViewById<TextView>(R.id.tv_video_badge)
            badge?.text = count.toString()
        }
    }

    private fun createForegroundNotification(): Notification {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_OVERLAY,
                getString(R.string.notification_channel_name),
                NotificationManager.IMPORTANCE_LOW
            )
            notificationManager.createNotificationChannel(channel)
        }

        val openIntent = Intent(this, MainActivity::class.java)
        val pendingOpen = PendingIntent.getActivity(
            this, 0, openIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_OVERLAY)
            .setSmallIcon(R.drawable.ic_vr_goggles)
            .setContentTitle(getString(R.string.notification_title_running))
            .setContentText(getString(R.string.notification_text_running, currentCount))
            .setContentIntent(pendingOpen)
            .setOngoing(true)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        unregisterReceiver(counterReceiver)
        serviceScope.cancel()
        floatingView?.let {
            try {
                windowManager.removeView(it)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
