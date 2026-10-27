package com.reelcounter.app

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.lifecycle.lifecycleScope
import com.reelcounter.app.data.model.SupportedApp
import com.reelcounter.app.permission.PermissionManager
import com.reelcounter.app.permission.PermissionStepType
import com.reelcounter.app.service.FloatingVRGogglesService
import com.reelcounter.app.ui.screens.*
import com.reelcounter.app.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private lateinit var app: ReelCounterApp
    private var isAutoWizardRunning = mutableStateOf(false)
    private var activeWizardStep = mutableStateOf<PermissionStepType?>(null)
    private var permissionStates = mutableStateOf(emptyList<com.reelcounter.app.permission.PermissionState>())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        app = application as ReelCounterApp
        refreshPermissions()

        setContent {
            ReelCounterTheme {
                MainAppNavHost()
            }
        }
    }

    override fun onResume() {
        super.onResume()
        refreshPermissions()

        // Auto-advancing logic: If auto-wizard is active and previous step got granted, advance to next!
        if (isAutoWizardRunning.value) {
            val next = PermissionManager.getNextPendingStep(this)
            activeWizardStep.value = next
            if (next != null) {
                lifecycleScope.launch {
                    delay(500)
                    Toast.makeText(this@MainActivity, getString(R.string.wizard_auto_advancing), Toast.LENGTH_SHORT).show()
                    delay(400)
                    PermissionManager.launchStepIntent(this@MainActivity, next)
                }
            } else {
                // All permissions granted!
                isAutoWizardRunning.value = false
                Toast.makeText(this@MainActivity, getString(R.string.wizard_all_done), Toast.LENGTH_LONG).show()
                startFloatingServiceIfEnabled()
            }
        }
    }

    private fun refreshPermissions() {
        permissionStates.value = PermissionManager.getAllPermissionStates(this)
        if (activeWizardStep.value == null) {
            activeWizardStep.value = PermissionManager.getNextPendingStep(this)
        }
    }

    private fun startFloatingServiceIfEnabled() {
        lifecycleScope.launch {
            val enabled = app.preferencesManager.floatingIconEnabledFlow.first()
            if (enabled && PermissionManager.hasOverlayPermission(this@MainActivity)) {
                val serviceIntent = Intent(this@MainActivity, FloatingVRGogglesService::class.java)
                startForegroundService(serviceIntent)
            }
        }
    }

    @Composable
    fun MainAppNavHost() {
        var currentNavIndex by remember { mutableIntStateOf(0) }

        val todayCount by app.repository.getTodayCountFlow().collectAsState(initial = 0)
        val todayStats by app.repository.getTodayStatsFlow().collectAsState(initial = emptyList())
        val isPaused by app.preferencesManager.isMonitoringPausedFlow.collectAsState(initial = false)
        val dailyLimit by app.preferencesManager.dailyLimitFlow.collectAsState(initial = 100)
        val currentLang by app.preferencesManager.languageFlow.collectAsState(initial = "en")
        val floatingEnabled by app.preferencesManager.floatingIconEnabledFlow.collectAsState(initial = true)
        val floatingOpacity by app.preferencesManager.floatingIconOpacityFlow.collectAsState(initial = 0.95f)
        val minThreshold by app.preferencesManager.minDurationThresholdFlow.collectAsState(initial = 1500L)

        var yesterdayCount by remember { mutableIntStateOf(0) }
        LaunchedEffect(Unit) {
            yesterdayCount = app.repository.getYesterdayTotalVideos()
        }

        val supportedApps = remember {
            mutableStateListOf(
                SupportedApp("com.zhiliaoapp.musically", R.string.app_tiktok, true),
                SupportedApp("com.instagram.android", R.string.app_instagram_reels, true),
                SupportedApp("com.google.android.youtube", R.string.app_youtube_shorts, true),
                SupportedApp("com.facebook.katana", R.string.app_facebook_reels, true),
                SupportedApp("com.snapchat.android", R.string.app_snapchat_spotlight, true)
            )
        }

        val allGranted = PermissionManager.isAllRequiredGranted(this)

        Scaffold(
            bottomBar = {
                NavigationBar(containerColor = Navy900) {
                    NavigationBarItem(
                        selected = currentNavIndex == 0,
                        onClick = { currentNavIndex = 0 },
                        icon = { Icon(Icons.Default.Dashboard, contentDescription = null) },
                        label = { Text(stringResource(R.string.nav_dashboard)) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = ElectricCyan,
                            selectedTextColor = ElectricCyan,
                            indicatorColor = Charcoal800,
                            unselectedIconColor = TextMuted,
                            unselectedTextColor = TextMuted
                        )
                    )
                    NavigationBarItem(
                        selected = currentNavIndex == 1,
                        onClick = { currentNavIndex = 1 },
                        icon = { Icon(Icons.Default.BarChart, contentDescription = null) },
                        label = { Text(stringResource(R.string.nav_statistics)) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = ElectricCyan,
                            selectedTextColor = ElectricCyan,
                            indicatorColor = Charcoal800,
                            unselectedIconColor = TextMuted,
                            unselectedTextColor = TextMuted
                        )
                    )
                    NavigationBarItem(
                        selected = currentNavIndex == 2,
                        onClick = { currentNavIndex = 2 },
                        icon = { Icon(Icons.Default.GridView, contentDescription = null) },
                        label = { Text(stringResource(R.string.nav_applications)) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = ElectricCyan,
                            selectedTextColor = ElectricCyan,
                            indicatorColor = Charcoal800,
                            unselectedIconColor = TextMuted,
                            unselectedTextColor = TextMuted
                        )
                    )
                    NavigationBarItem(
                        selected = currentNavIndex == 3,
                        onClick = { currentNavIndex = 3 },
                        icon = { Icon(Icons.Default.Settings, contentDescription = null) },
                        label = { Text(stringResource(R.string.nav_settings)) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = ElectricCyan,
                            selectedTextColor = ElectricCyan,
                            indicatorColor = Charcoal800,
                            unselectedIconColor = TextMuted,
                            unselectedTextColor = TextMuted
                        )
                    )
                }
            }
        ) { innerPadding ->
            when (currentNavIndex) {
                0 -> {
                    if (!allGranted) {
                        OnboardingScreen(
                            permissionStates = permissionStates.value,
                            activeStep = activeWizardStep.value,
                            isAutoWizardActive = isAutoWizardRunning.value,
                            onStartAutoWizard = {
                                isAutoWizardRunning.value = true
                                val step = PermissionManager.getNextPendingStep(this@MainActivity)
                                activeWizardStep.value = step
                                if (step != null) {
                                    PermissionManager.launchStepIntent(this@MainActivity, step)
                                }
                            },
                            onManualGrant = { step ->
                                activeWizardStep.value = step
                                PermissionManager.launchStepIntent(this@MainActivity, step)
                            },
                            onCompleteSetup = {
                                startFloatingServiceIfEnabled()
                                currentNavIndex = 0
                            },
                            modifier = Modifier.padding(innerPadding)
                        )
                    } else {
                        DashboardScreen(
                            todayTotal = todayCount,
                            yesterdayTotal = yesterdayCount,
                            dailyGoal = dailyLimit,
                            isPaused = isPaused,
                            statsList = todayStats,
                            onTogglePause = {
                                lifecycleScope.launch {
                                    app.preferencesManager.setMonitoringPaused(!isPaused)
                                }
                            },
                            modifier = Modifier.padding(innerPadding)
                        )
                    }
                }
                1 -> StatisticsScreen(
                    historicalStats = todayStats,
                    onExportCsv = {
                        lifecycleScope.launch {
                            val path = app.repository.exportHistoryToCsv()
                            Toast.makeText(this@MainActivity, "CSV exported: $path", Toast.LENGTH_LONG).show()
                        }
                    },
                    modifier = Modifier.padding(innerPadding)
                )
                2 -> ApplicationsScreen(
                    apps = supportedApps,
                    onToggleApp = { pkg, enabled ->
                        val index = supportedApps.indexOfFirst { it.packageId == pkg }
                        if (index >= 0) {
                            supportedApps[index] = supportedApps[index].copy(isEnabled = enabled)
                        }
                    },
                    modifier = Modifier.padding(innerPadding)
                )
                3 -> SettingsScreen(
                    currentLanguage = currentLang,
                    floatingIconEnabled = floatingEnabled,
                    floatingIconOpacity = floatingOpacity,
                    dailyLimit = dailyLimit,
                    minThresholdMs = minThreshold,
                    onLanguageChange = { newLang ->
                        lifecycleScope.launch {
                            app.preferencesManager.setLanguage(newLang)
                            app.applyLocale(newLang)
                            recreate()
                        }
                    },
                    onFloatingIconToggle = { enabled ->
                        lifecycleScope.launch {
                            app.preferencesManager.setFloatingIconEnabled(enabled)
                            if (enabled && PermissionManager.hasOverlayPermission(this@MainActivity)) {
                                startService(Intent(this@MainActivity, FloatingVRGogglesService::class.java))
                            } else {
                                stopService(Intent(this@MainActivity, FloatingVRGogglesService::class.java))
                            }
                        }
                    },
                    onFloatingOpacityChange = { op ->
                        lifecycleScope.launch {
                            app.preferencesManager.setFloatingIconOpacity(op)
                        }
                    },
                    onDailyLimitChange = { limit ->
                        lifecycleScope.launch {
                            app.preferencesManager.setDailyLimit(limit)
                        }
                    },
                    onThresholdChange = { th ->
                        lifecycleScope.launch {
                            app.preferencesManager.setMinDurationThreshold(th)
                        }
                    },
                    onClearAllData = {
                        lifecycleScope.launch {
                            app.repository.clearAllData()
                            Toast.makeText(this@MainActivity, "Local history wiped", Toast.LENGTH_SHORT).show()
                        }
                    },
                    modifier = Modifier.padding(innerPadding)
                )
            }
        }
    }
}
