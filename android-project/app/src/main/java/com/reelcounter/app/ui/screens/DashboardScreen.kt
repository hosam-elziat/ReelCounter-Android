package com.reelcounter.app.ui.screens

import androidx.compose.animation.core.animateIntAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.reelcounter.app.R
import com.reelcounter.app.data.model.DailyAppStatistics
import com.reelcounter.app.ui.components.VRGogglesIcon
import com.reelcounter.app.ui.theme.*

@Composable
fun DashboardScreen(
    todayTotal: Int,
    yesterdayTotal: Int,
    dailyGoal: Int,
    isPaused: Boolean,
    statsList: List<DailyAppStatistics>,
    onTogglePause: () -> Unit,
    modifier: Modifier = Modifier
) {
    val animatedCount by animateIntAsState(
        targetValue = todayTotal,
        animationSpec = tween(600),
        label = "counterAnim"
    )

    val totalDurationSeconds = statsList.sumOf { it.estimatedViewingSeconds }
    val totalMinutes = totalDurationSeconds / 60
    val avgSeconds = if (todayTotal > 0) totalDurationSeconds / todayTotal else 0
    val progressPercent = if (dailyGoal > 0) (todayTotal.toFloat() / dailyGoal).coerceIn(0f, 1f) else 0f

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(Navy950)
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
        contentPadding = PaddingValues(top = 24.dp, bottom = 48.dp)
    ) {
        // Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = stringResource(R.string.app_name),
                        style = MaterialTheme.typography.headlineMedium,
                        color = TextPrimary
                    )
                    Text(
                        text = stringResource(R.string.app_tagline),
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextSecondary
                    )
                }
                VRGogglesIcon(size = 52.dp, badgeCount = todayTotal)
            }
        }

        // Hero Counter Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(24.dp))
                    .border(
                        1.dp,
                        Brush.horizontalGradient(listOf(ElectricCyan.copy(alpha = 0.5f), ElectricViolet.copy(alpha = 0.5f))),
                        RoundedCornerShape(24.dp)
                    ),
                colors = CardDefaults.cardColors(containerColor = Navy900)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = stringResource(R.string.dashboard_total_videos).uppercase(),
                        style = MaterialTheme.typography.labelSmall,
                        color = ElectricCyan,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.2.sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "$animatedCount",
                        style = MaterialTheme.typography.displayLarge,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    // vs Yesterday comparison
                    val diff = todayTotal - yesterdayTotal
                    val diffSign = if (diff > 0) "+$diff" else "$diff"
                    val diffColor = if (diff > 0) AmberWarning else EmeraldGreen
                    Text(
                        text = "$diffSign ${stringResource(R.string.dashboard_vs_yesterday)} ($yesterdayTotal)",
                        style = MaterialTheme.typography.bodyMedium,
                        color = diffColor
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    // Daily Goal Progress Bar
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = stringResource(R.string.dashboard_daily_goal),
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextSecondary
                            )
                            Text(
                                text = stringResource(R.string.dashboard_goal_progress, todayTotal, dailyGoal),
                                style = MaterialTheme.typography.bodyMedium,
                                color = if (todayTotal >= dailyGoal) AmberWarning else TextPrimary,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        LinearProgressIndicator(
                            progress = { progressPercent },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(8.dp)
                                .clip(RoundedCornerShape(4.dp)),
                            color = if (todayTotal >= dailyGoal) AmberWarning else ElectricCyan,
                            trackColor = Charcoal800
                        )
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    // Pause/Resume quick control
                    Button(
                        onClick = onTogglePause,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isPaused) EmeraldGreen else Charcoal800
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(
                            imageVector = if (isPaused) Icons.Default.PlayArrow else Icons.Default.Pause,
                            contentDescription = null,
                            tint = Color.White
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (isPaused) stringResource(R.string.floating_action_resume) else stringResource(R.string.floating_action_pause),
                            color = Color.White
                        )
                    }
                }
            }
        }

        // Secondary Metrics Grid
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                MetricTile(
                    title = stringResource(R.string.dashboard_estimated_time),
                    value = "$totalMinutes min",
                    icon = Icons.Default.Timer,
                    accentColor = ElectricBlue,
                    modifier = Modifier.weight(1f)
                )
                MetricTile(
                    title = stringResource(R.string.dashboard_avg_duration),
                    value = "$avgSeconds sec",
                    icon = Icons.Default.TrendingUp,
                    accentColor = ElectricViolet,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Per-App Breakdown
        item {
            Text(
                text = stringResource(R.string.nav_applications),
                style = MaterialTheme.typography.titleLarge,
                color = TextPrimary
            )
        }

        if (statsList.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Navy900)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = stringResource(R.string.dashboard_empty_title),
                            style = MaterialTheme.typography.titleLarge,
                            color = TextPrimary
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = stringResource(R.string.dashboard_empty_desc),
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextSecondary
                        )
                    }
                }
            }
        } else {
            items(statsList.size) { index ->
                val stat = statsList[index]
                AppStatRow(stat, todayTotal)
            }
        }
    }
}

@Composable
fun MetricTile(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    accentColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = Navy900),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Icon(imageVector = icon, contentDescription = null, tint = accentColor, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = value, style = MaterialTheme.typography.titleLarge, color = TextPrimary, fontWeight = FontWeight.Bold)
            Text(text = title, style = MaterialTheme.typography.labelSmall, color = TextSecondary)
        }
    }
}

@Composable
fun AppStatRow(stat: DailyAppStatistics, total: Int) {
    val friendlyName = when (stat.applicationPackage) {
        "com.zhiliaoapp.musically", "com.ss.android.ugc.trill" -> "TikTok"
        "com.instagram.android" -> "Instagram Reels"
        "com.facebook.katana" -> "Facebook Reels"
        "com.google.android.youtube" -> "YouTube Shorts"
        "com.snapchat.android" -> "Snapchat Spotlight"
        else -> stat.applicationPackage
    }

    val share = if (total > 0) stat.videoCount.toFloat() / total else 0f

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Navy900),
        shape = RoundedCornerShape(14.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = friendlyName, color = TextPrimary, fontWeight = FontWeight.SemiBold)
                Text(text = "${stat.videoCount} videos", color = ElectricCyan, fontWeight = FontWeight.Bold)
            }
            Spacer(modifier = Modifier.height(6.dp))
            LinearProgressIndicator(
                progress = { share },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp)),
                color = ElectricViolet,
                trackColor = Charcoal800
            )
        }
    }
}
