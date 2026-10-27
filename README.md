# ReelCounter - Native Android Short-Form Video Daily Counter

ReelCounter is a native Android digital-wellbeing utility designed to bring awareness to short-form video consumption across **TikTok**, **Instagram Reels**, **YouTube Shorts**, **Facebook Reels**, and **Snapchat Spotlight**.

---

## Key Features

1. **Floating VR Goggles Overlay**
   - Displays a floating futuristic VR headset icon with a real-time numerical counter badge over other apps.
   - Drag-and-drop repositioning anywhere on the screen with edge snapping and persistent position memory across reboots.
   - Tap to expand a quick mini-dashboard with pause/resume counting controls and one-touch jump to the main app.
   - User-configurable size and opacity (from 30% to 100%).

2. **On-Device Detection Engine**
   - Uses Android's `AccessibilityService` (explicit opt-in) combined with `UsageStatsManager`.
   - Distinguishes short video feeds from normal videos (e.g. YouTube Shorts vs standard YouTube watch page, Snapchat Spotlight vs private camera/chats).
   - Anti-duplication algorithms with sliding time-window hashing.
   - Configurable minimum display-duration threshold (default 1.5s) to eliminate rapid fling false-positives.
   - Markings for exact vs heuristic vs uncertain detections.

3. **100% Privacy-Preserving & Local**
   - No external servers, no cloud sync, no tracking, and no user account registration required.
   - Never reads or stores personal messages, passwords, camera feeds, or search text.

4. **Bilingual (English & Arabic RTL)**
   - Full Arabic language support with right-to-left layout mirroring and native Arabic typography (Cairo font).
   - In-app language toggle with instantaneous layout switching.

5. **Daily Midnight Rollover & Persistence**
   - Room Database persists every detected view event and daily aggregates.
   - Automatic midnight reset in the device's local timezone via AlarmManager `RTC_WAKEUP`.
   - Comprehensive statistics: Today, Yesterday, 7 Days, 30 Days, Hourly charts, and CSV history export.

---

## Technical Architecture

```
com.reelcounter.app/
├── data/
│   ├── model/           # VideoViewEvent, DailyAppStatistics, SupportedApp
│   ├── database/        # Room Database, VideoViewEventDao, DailyAppStatisticsDao
│   ├── repository/      # ReelCounterRepository (aggregation, deduplication, CSV export)
│   └── datastore/       # UserPreferencesManager (DataStore preferences)
├── detector/
│   ├── DetectionTypes   # Result classes, confidence enums
│   ├── VideoDetector    # Base interface for app detectors
│   ├── DetectorEngine   # Multi-app coordinator, debounce, threshold gating
│   └── apps/            # TikTok, Instagram, YouTube Shorts, Facebook, Snapchat detectors
├── service/
│   ├── ReelCounterAccessibilityService # Background accessibility event processor
│   ├── FloatingVRGogglesService        # WindowManager TYPE_APPLICATION_OVERLAY floating HUD
│   ├── MonitoringForegroundService     # Compliant ongoing notification service
│   └── MidnightRolloverReceiver        # Local midnight reset broadcast receiver
└── ui/
    ├── theme/           # Color (Navy/Electric Blue/Violet), Theme, Type
    ├── components/      # VRGogglesIcon with live badge, Charts, Metric cards
    └── screens/         # Dashboard, Statistics, Applications, Settings, Onboarding
```

---

## How to Build the APK

### Prerequisites
- Android Studio Iguana / Jellyfish / Koala or newer
- JDK 17
- Android SDK Platform 34 (Android 14)
- Minimum supported device: Android 10 (API 29)

### Option 1: Using Android Studio
1. Download `ReelCounter-Android-Project.zip`.
2. Extract the ZIP to your desired directory.
3. Open Android Studio and select **Open**, then choose the extracted `android-project` folder.
4. Allow Gradle sync to complete.
5. In the menu, go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
6. The compiled APK will be generated at:
   `app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Using Command Line (Terminal)
```bash
unzip ReelCounter-Android-Project.zip -d ReelCounter
cd ReelCounter/android-project
./gradlew assembleDebug
```
The resulting debug APK is located at:
`app/build/outputs/apk/debug/app-debug.apk`

---

## Required Permissions Setup Guide

When first launching ReelCounter, the 5-step onboarding flow guides you to enable:

1. **Usage Access**:
   `Settings > Apps > Special app access > Usage access > ReelCounter > Allow`
   *Purpose: Accurately identifies when a supported social app enters the foreground.*

2. **Accessibility Service**:
   `Settings > Accessibility > Downloaded Apps > ReelCounter Video Detection Engine > Enable`
   *Purpose: Enables local detection of short-video swipe events.*

3. **Display Over Other Apps (Overlay)**:
   `Settings > Apps > Special app access > Display over other apps > ReelCounter > Allow`
   *Purpose: Renders the floating VR goggles headset icon and live counter badge.*

4. **Notifications**:
   `Settings > Apps > ReelCounter > Notifications > Allow`
   *Purpose: Displays background monitoring status and alerts when reaching your daily video limit.*

---

## Supported App Packages & Version Matrix

| Application | Target Package Name | Detection Mechanism | Confidence Level |
|---|---|---|---|
| **TikTok** | `com.zhiliaoapp.musically`, `com.ss.android.ugc.trill` | ViewPager2 transition + Creator Handle Node | Exact / High |
| **Instagram Reels** | `com.instagram.android` | Clips Viewer Pager + Audio Pill Node | High |
| **YouTube Shorts** | `com.google.android.youtube` | Reel Recycler & Shorts Watch Fragment (Excludes standard videos) | Exact / High |
| **Facebook Reels** | `com.facebook.katana` | FB Shorts Container & Creator Tag | High / Heuristic |
| **Snapchat Spotlight** | `com.snapchat.android` | Spotlight Viewer Container (Excludes camera/chat) | High / Heuristic |

---

## Build Environment Notice

*Note regarding build environment:* The AI Studio development container is a Node.js/Linux container without preinstalled Android SDK build tools or Java 17 runtimes. Therefore, the complete native source code, Gradle configurations, manifests, resources, and tests are packaged into the ready-to-build `ReelCounter-Android-Project.zip`. You can download this ZIP directly and run `./gradlew assembleDebug` on any computer with Java 17 and Android SDK to generate `ReelCounter.apk`.
