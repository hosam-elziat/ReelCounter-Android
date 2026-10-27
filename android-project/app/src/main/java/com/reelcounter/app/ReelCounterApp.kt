package com.reelcounter.app

import android.app.Application
import android.content.Context
import android.content.res.Configuration
import com.reelcounter.app.data.database.AppDatabase
import com.reelcounter.app.data.datastore.UserPreferencesManager
import com.reelcounter.app.data.repository.ReelCounterRepository
import com.reelcounter.app.service.MidnightRolloverReceiver
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.util.Locale

class ReelCounterApp : Application() {

    lateinit var database: AppDatabase
        private set

    lateinit var repository: ReelCounterRepository
        private set

    lateinit var preferencesManager: UserPreferencesManager
        private set

    override fun onCreate() {
        super.onCreate()
        database = AppDatabase.getInstance(this)
        repository = ReelCounterRepository(database, this)
        preferencesManager = UserPreferencesManager(this)

        // Schedule daily midnight rollover
        MidnightRolloverReceiver.scheduleNextMidnightAlarm(this)

        // Apply saved language setting
        CoroutineScope(Dispatchers.Main).launch {
            val lang = preferencesManager.languageFlow.first()
            if (lang == "ar" || lang == "en") {
                applyLocale(lang)
            }
        }
    }

    fun applyLocale(languageCode: String) {
        val locale = Locale(languageCode)
        Locale.setDefault(locale)
        val config = Configuration(resources.configuration)
        config.setLocale(locale)
        config.setLayoutDirection(locale)
        @Suppress("DEPRECATION")
        resources.updateConfiguration(config, resources.displayMetrics)
    }
}
