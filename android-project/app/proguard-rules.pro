# ReelCounter Proguard Rules
-keepattributes *Annotation*
-keepclassmembers class * extends androidx.room.RoomDatabase
-dontwarn androidx.room.paging.**
