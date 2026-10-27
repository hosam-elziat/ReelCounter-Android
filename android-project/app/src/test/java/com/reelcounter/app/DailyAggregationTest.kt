package com.reelcounter.app

import com.reelcounter.app.data.model.DailyAppStatistics
import org.junit.Assert.assertEquals
import org.junit.Test

class DailyAggregationTest {

    @Test
    fun testAggregationAccumulation() {
        val initial = DailyAppStatistics(
            date = "2026-10-26",
            applicationPackage = "com.instagram.android",
            videoCount = 10,
            estimatedViewingSeconds = 240,
            uncertainEventCount = 0
        )

        val updated = initial.copy(
            videoCount = initial.videoCount + 5,
            estimatedViewingSeconds = initial.estimatedViewingSeconds + 90,
            uncertainEventCount = initial.uncertainEventCount + 1
        )

        assertEquals(15, updated.videoCount)
        assertEquals(330L, updated.estimatedViewingSeconds)
        assertEquals(1, updated.uncertainEventCount)
    }
}
