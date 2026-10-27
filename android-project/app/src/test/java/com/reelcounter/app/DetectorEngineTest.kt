package com.reelcounter.app

import com.reelcounter.app.detector.DetectionConfidence
import com.reelcounter.app.detector.DetectionMethod
import com.reelcounter.app.detector.DetectionResult
import com.reelcounter.app.detector.DetectorEngine
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class DetectorEngineTest {

    private lateinit var detectorEngine: DetectorEngine

    @Before
    fun setUp() {
        detectorEngine = DetectorEngine(minThresholdMs = 1500L)
    }

    @Test
    fun testSupportedPackagesRegistration() {
        assertTrue(detectorEngine.canHandle("com.zhiliaoapp.musically"))
        assertTrue(detectorEngine.canHandle("com.instagram.android"))
        assertTrue(detectorEngine.canHandle("com.google.android.youtube"))
        assertTrue(detectorEngine.canHandle("com.facebook.katana"))
        assertTrue(detectorEngine.canHandle("com.snapchat.android"))
        assertFalse(detectorEngine.canHandle("com.unknown.calculator"))
    }

    @Test
    fun testDeduplicationKeyIntegrity() {
        val result1 = DetectionResult(
            isNewVideo = true,
            packageName = "com.zhiliaoapp.musically",
            deduplicationKey = "tt_author_coolguy_12345",
            confidence = DetectionConfidence.EXACT,
            method = DetectionMethod.EXACT_NODE_ID
        )

        assertEquals("tt_author_coolguy_12345", result1.deduplicationKey)
        assertTrue(result1.isNewVideo)
        assertEquals(DetectionConfidence.EXACT, result1.confidence)
    }
}
