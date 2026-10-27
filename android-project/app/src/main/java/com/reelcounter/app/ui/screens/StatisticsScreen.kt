package com.reelcounter.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FileDownload
import androidx.compose.material.icons.filled.Leaderboard
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.reelcounter.app.R
import com.reelcounter.app.data.model.DailyAppStatistics
import com.reelcounter.app.ui.theme.*

@Composable
fun StatisticsScreen(
    historicalStats: List<DailyAppStatistics>,
    onExportCsv: () -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableIntStateOf(2) } // 0: Today, 1: Yesterday, 2: 7 Days, 3: 30 Days
    val tabs = listOf(
        stringResource(R.string.stats_timeframe_today),
        stringResource(R.string.stats_timeframe_yesterday),
        stringResource(R.string.stats_timeframe_7days),
        stringResource(R.string.stats_timeframe_30days)
    )

    val totalVideos = historicalStats.sumOf { it.videoCount }
    val totalSeconds = historicalStats.sumOf { it.estimatedViewingSeconds }
    val totalMinutes = totalSeconds / 60
    val daysCount = when (selectedTab) {
        0, 1 -> 1
        2 -> 7
        3 -> 30
        else -> 7
    }
    val dailyAvg = if (daysCount > 0) totalVideos / daysCount else 0

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(Navy950)
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 24.dp, bottom = 48.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = stringResource(R.string.nav_statistics),
                    style = MaterialTheme.typography.headlineMedium,
                    color = TextPrimary
                )
                FilledTonalButton(
                    onClick = onExportCsv,
                    colors = ButtonDefaults.filledTonalButtonColors(
                        containerColor = Charcoal800,
                        contentColor = ElectricCyan
                    ),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(imageVector = Icons.Default.FileDownload, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "CSV", fontWeight = FontWeight.Bold)
                }
            }
        }

        // Timeframe selector
        item {
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Navy900,
                contentColor = ElectricCyan,
                modifier = Modifier.clip(RoundedCornerShape(12.dp))
            ) {
                tabs.forEachIndexed { index, label ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = {
                            Text(
                                text = label,
                                color = if (selectedTab == index) ElectricCyan else TextSecondary,
                                fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    )
                }
            }
        }

        // Summary cards
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Card(
                    modifier = Modifier.weight(1f),
                    colors = CardDefaults.cardColors(containerColor = Navy900),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(text = "$totalVideos", style = MaterialTheme.typography.headlineMedium, color = ElectricCyan, fontWeight = FontWeight.Bold)
                        Text(text = stringResource(R.string.dashboard_total_videos), style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                    }
                }

                Card(
                    modifier = Modifier.weight(1f),
                    colors = CardDefaults.cardColors(containerColor = Navy900),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(text = "$dailyAvg / day", style = MaterialTheme.typography.headlineMedium, color = ElectricViolet, fontWeight = FontWeight.Bold)
                        Text(text = stringResource(R.string.stats_daily_average), style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                    }
                }
            }
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Navy900),
                shape = RoundedCornerShape(16.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(text = stringResource(R.string.dashboard_estimated_time), style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(text = "$totalMinutes minutes", style = MaterialTheme.typography.titleLarge, color = TextPrimary, fontWeight = FontWeight.Bold)
                    }
                    Icon(imageVector = Icons.Default.Leaderboard, contentDescription = null, tint = ElectricCyan, modifier = Modifier.size(32.dp))
                }
            }
        }

        // App breakdown list
        item {
            Text(
                text = stringResource(R.string.dashboard_active_hours),
                style = MaterialTheme.typography.titleLarge,
                color = TextPrimary
            )
        }

        items(historicalStats.size) { index ->
            val stat = historicalStats[index]
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Navy900),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(text = stat.date, color = TextSecondary)
                    Text(text = "${stat.videoCount} videos", color = TextPrimary, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}
