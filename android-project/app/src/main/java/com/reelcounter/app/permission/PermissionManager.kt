package com.reelcounter.app.permission

import android.Manifest
import android.accessibilityservice.AccessibilityServiceInfo
import android.app.Activity
import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.os.Process
import android.provider.Settings
import android.view.accessibility.AccessibilityManager
import androidx.core.content.ContextCompat
import com.reelcounter.app.R
import com.reelcounter.app.service.ReelCounterAccessibilityService

enum class PermissionStepType(
    val stepIndex: Int,
    val titleResId: Int,
    val descResId: Int,
    val iconName: String
) {
    USAGE_ACCESS(
        1,
        R.string.perm_usage_access_title,
        R.string.perm_usage_access_desc,
        "bar_chart"
    ),
    ACCESSIBILITY(
        2,
        R.string.perm_accessibility_title,
        R.string.perm_accessibility_desc,
        "accessibility"
    ),
    OVERLAY(
        3,
        R.string.perm_overlay_title,
        R.string.perm_overlay_desc,
        "vr_goggles"
    ),
    NOTIFICATIONS(
        4,
        R.string.perm_notifications_title,
        R.string.perm_notifications_desc,
        "notifications"
    ),
    BATTERY_OPTIMIZATION(
        5,
        R.string.perm_battery_title,
        R.string.perm_battery_desc,
        "battery"
    )
}

data class PermissionState(
    val step: PermissionStepType,
    val isGranted: Boolean
)

object PermissionManager {

    fun hasUsageStatsPermission(context: Context): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as? AppOpsManager ?: return false
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                context.packageName
            )
        } else {
            @Suppress("DEPRECATION")
            appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                context.packageName
            )
        }
        return mode == AppOpsManager.MODE_ALLOWED
    }

    fun hasAccessibilityPermission(context: Context): Boolean {
        val am = context.getSystemService(Context.ACCESSIBILITY_SERVICE) as? AccessibilityManager ?: return false
        val enabledServices = am.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_GENERIC)
        val expectedServiceName = ReelCounterAccessibilityService::class.java.name
        return enabledServices.any {
            it.resolveInfo.serviceInfo.packageName == context.packageName &&
                    it.resolveInfo.serviceInfo.name == expectedServiceName
        }
    }

    fun hasOverlayPermission(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(context)
        } else {
            true
        }
    }

    fun hasNotificationPermission(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true
        }
    }

    fun isBatteryOptimizationIgnored(context: Context): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val pm = context.getSystemService(Context.POWER_SERVICE) as? PowerManager ?: return true
            return pm.isIgnoringBatteryOptimizations(context.packageName)
        }
        return true
    }

    fun getAllPermissionStates(context: Context): List<PermissionState> {
        return listOf(
            PermissionState(PermissionStepType.USAGE_ACCESS, hasUsageStatsPermission(context)),
            PermissionState(PermissionStepType.ACCESSIBILITY, hasAccessibilityPermission(context)),
            PermissionState(PermissionStepType.OVERLAY, hasOverlayPermission(context)),
            PermissionState(PermissionStepType.NOTIFICATIONS, hasNotificationPermission(context)),
            PermissionState(PermissionStepType.BATTERY_OPTIMIZATION, isBatteryOptimizationIgnored(context))
        )
    }

    fun getNextPendingStep(context: Context): PermissionStepType? {
        val states = getAllPermissionStates(context)
        return states.firstOrNull { !it.isGranted }?.step
    }

    fun isAllRequiredGranted(context: Context): Boolean {
        return hasUsageStatsPermission(context) &&
                hasAccessibilityPermission(context) &&
                hasOverlayPermission(context)
    }

    /**
     * Launches the exact system intent for the given step.
     */
    fun launchStepIntent(activity: Activity, step: PermissionStepType) {
        when (step) {
            PermissionStepType.USAGE_ACCESS -> {
                val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                    data = Uri.parse("package:${activity.packageName}")
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                try {
                    activity.startActivity(intent)
                } catch (e: Exception) {
                    activity.startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
                }
            }
            PermissionStepType.ACCESSIBILITY -> {
                val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                activity.startActivity(intent)
            }
            PermissionStepType.OVERLAY -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    val intent = Intent(
                        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:${activity.packageName}")
                    ).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    activity.startActivity(intent)
                }
            }
            PermissionStepType.NOTIFICATIONS -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    activity.requestPermissions(
                        arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                        1001
                    )
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    val intent = Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
                        putExtra(Settings.EXTRA_APP_PACKAGE, activity.packageName)
                    }
                    activity.startActivity(intent)
                }
            }
            PermissionStepType.BATTERY_OPTIMIZATION -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    try {
                        val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                            data = Uri.parse("package:${activity.packageName}")
                        }
                        activity.startActivity(intent)
                    } catch (e: Exception) {
                        val fallback = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
                        activity.startActivity(fallback)
                    }
                }
            }
        }
    }
}
