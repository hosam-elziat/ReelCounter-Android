package com.reelcounter.app.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.reelcounter.app.data.model.DailyAppStatistics
import com.reelcounter.app.data.model.VideoViewEvent

@Database(
    entities = [VideoViewEvent::class, DailyAppStatistics::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun videoViewEventDao(): VideoViewEventDao
    abstract fun dailyAppStatisticsDao(): DailyAppStatisticsDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "reelcounter_database"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
