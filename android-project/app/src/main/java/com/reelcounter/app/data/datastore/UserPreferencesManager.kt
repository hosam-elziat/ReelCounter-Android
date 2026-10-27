package com.reelcounter.app.data.datastore

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "reelcounter_preferences")

class UserPreferencesManager(private val context: Context) {

    companion object {
        val KEY_LANGUAGE = stringPreferencesKey("app_language") // "en", "ar", or "system"
        val KEY_FLOATING_ICON_ENABLED = booleanPreferencesKey("floating_icon_enabled")
        val KEY_FLOATING_ICON_SIZE = intPreferencesKey("floating_icon_size_dp") // 48, 56, 68
        val KEY_FLOATING_ICON_OPACITY = floatPreferencesKey("floating_icon_opacity") // 0.3 - 1.0
        val KEY_FLOATING_POS_X = intPreferencesKey("floating_pos_x")
        val KEY_FLOATING_POS_Y = intPreferencesKey("floating_pos_y")
        val KEY_DAILY_LIMIT = intPreferencesKey("daily_video_limit")
        val KEY_LAST_NOTIFIED_DATE = stringPreferencesKey("last_notified_limit_date")
        val KEY_MIN_DURATION_THRESHOLD_MS = longPreferencesKey("min_duration_threshold_ms")
        val KEY_MONITORING_PAUSED = booleanPreferencesKey("is_monitoring_paused")
        val KEY_SHOW_CONFIDENCE_INDICATOR = booleanPreferencesKey("show_confidence_indicator")
    }

    val languageFlow: Flow<String> = context.dataStore.data.map { it[KEY_LANGUAGE] ?: "en" }
    val floatingIconEnabledFlow: Flow<Boolean> = context.dataStore.data.map { it[KEY_FLOATING_ICON_ENABLED] ?: true }
    val floatingIconSizeFlow: Flow<Int> = context.dataStore.data.map { it[KEY_FLOATING_ICON_SIZE] ?: 56 }
    val floatingIconOpacityFlow: Flow<Float> = context.dataStore.data.map { it[KEY_FLOATING_ICON_OPACITY] ?: 0.95f }
    val floatingPosXFlow: Flow<Int> = context.dataStore.data.map { it[KEY_FLOATING_POS_X] ?: 100 }
    val floatingPosYFlow: Flow<Int> = context.dataStore.data.map { it[KEY_FLOATING_POS_Y] ?: 300 }
    val dailyLimitFlow: Flow<Int> = context.dataStore.data.map { it[KEY_DAILY_LIMIT] ?: 100 }
    val minDurationThresholdFlow: Flow<Long> = context.dataStore.data.map { it[KEY_MIN_DURATION_THRESHOLD_MS] ?: 1500L }
    val isMonitoringPausedFlow: Flow<Boolean> = context.dataStore.data.map { it[KEY_MONITORING_PAUSED] ?: false }
    val showConfidenceIndicatorFlow: Flow<Boolean> = context.dataStore.data.map { it[KEY_SHOW_CONFIDENCE_INDICATOR] ?: true }

    suspend fun setLanguage(lang: String) {
        context.dataStore.edit { it[KEY_LANGUAGE] = lang }
    }

    suspend fun setFloatingIconEnabled(enabled: Boolean) {
        context.dataStore.edit { it[KEY_FLOATING_ICON_ENABLED] = enabled }
    }

    suspend fun setFloatingIconSize(sizeDp: Int) {
        context.dataStore.edit { it[KEY_FLOATING_ICON_SIZE] = sizeDp }
    }

    suspend fun setFloatingIconOpacity(opacity: Float) {
        context.dataStore.edit { it[KEY_FLOATING_ICON_OPACITY] = opacity }
    }

    suspend fun saveFloatingPosition(x: Int, y: Int) {
        context.dataStore.edit {
            it[KEY_FLOATING_POS_X] = x
            it[KEY_FLOATING_POS_Y] = y
        }
    }

    suspend fun setDailyLimit(limit: Int) {
        context.dataStore.edit { it[KEY_DAILY_LIMIT] = limit }
    }

    suspend fun setMinDurationThreshold(thresholdMs: Long) {
        context.dataStore.edit { it[KEY_MIN_DURATION_THRESHOLD_MS] = thresholdMs }
    }

    suspend fun setMonitoringPaused(paused: Boolean) {
        context.dataStore.edit { it[KEY_MONITORING_PAUSED] = paused }
    }

    suspend fun markLimitNotifiedForToday(todayDate: String) {
        context.dataStore.edit { it[KEY_LAST_NOTIFIED_DATE] = todayDate }
    }

    suspend fun isLimitNotifiedToday(todayDate: String): Boolean {
        var notified = false
        context.dataStore.data.collect {
            notified = it[KEY_LAST_NOTIFIED_DATE] == todayDate
        }
        return notified
    }
}
