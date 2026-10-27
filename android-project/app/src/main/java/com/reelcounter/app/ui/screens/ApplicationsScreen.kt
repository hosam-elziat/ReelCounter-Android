package com.reelcounter.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.reelcounter.app.R
import com.reelcounter.app.data.model.ConfidenceRating
import com.reelcounter.app.data.model.DetectionStatus
import com.reelcounter.app.data.model.SupportedApp
import com.reelcounter.app.ui.theme.*

@Composable
fun ApplicationsScreen(
    apps: List<SupportedApp>,
    onToggleApp: (String, Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(Navy950)
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 24.dp, bottom = 48.dp)
    ) {
        item {
            Column {
                Text(
                    text = stringResource(R.string.nav_applications),
                    style = MaterialTheme.typography.headlineMedium,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Configure modular detectors and observe per-app confidence ratings.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary
                )
            }
        }

        items(apps) { app ->
            AppCard(app = app, onToggle = { enabled -> onToggleApp(app.packageId, enabled) })
        }
    }
}

@Composable
fun AppCard(
    app: SupportedApp,
    onToggle: (Boolean) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Navy900),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = stringResource(app.nameResId),
                        style = MaterialTheme.typography.titleLarge,
                        color = TextPrimary,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = app.packageId,
                        style = MaterialTheme.typography.labelSmall,
                        color = TextMuted
                    )
                }
                Switch(
                    checked = app.isEnabled,
                    onCheckedChange = onToggle,
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.White,
                        checkedTrackColor = ElectricCyan,
                        uncheckedTrackColor = Charcoal800
                    )
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Badges row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Status badge
                StatusBadge(status = app.detectionStatus)

                // Confidence badge
                ConfidenceBadge(confidence = app.confidenceRating)
            }
        }
    }
}

@Composable
fun StatusBadge(status: DetectionStatus) {
    val (color, text) = when (status) {
        DetectionStatus.MONITORED -> EmeraldGreen to stringResource(R.string.app_status_monitored)
        DetectionStatus.PAUSED -> AmberWarning to stringResource(R.string.app_status_paused)
        DetectionStatus.DISABLED -> TextMuted to stringResource(R.string.app_status_disabled)
        DetectionStatus.UNSUPPORTED -> NeonPink to "Unsupported"
    }

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(color.copy(alpha = 0.15f))
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(text = text, color = color, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun ConfidenceBadge(confidence: ConfidenceRating) {
    val (color, text) = when (confidence) {
        ConfidenceRating.HIGH -> ElectricCyan to stringResource(R.string.app_accuracy_high)
        ConfidenceRating.HEURISTIC -> ElectricViolet to stringResource(R.string.app_accuracy_heuristic)
        ConfidenceRating.UNCERTAIN -> AmberWarning to stringResource(R.string.app_accuracy_uncertain)
    }

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(color.copy(alpha = 0.15f))
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(text = text, color = color, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
    }
}
