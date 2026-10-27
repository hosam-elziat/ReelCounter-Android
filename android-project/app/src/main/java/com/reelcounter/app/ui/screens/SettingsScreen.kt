package com.reelcounter.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.reelcounter.app.R
import com.reelcounter.app.ui.theme.*

@Composable
fun SettingsScreen(
    currentLanguage: String,
    floatingIconEnabled: Boolean,
    floatingIconOpacity: Float,
    dailyLimit: Int,
    minThresholdMs: Long,
    onLanguageChange: (String) -> Unit,
    onFloatingIconToggle: (Boolean) -> Unit,
    onFloatingOpacityChange: (Float) -> Unit,
    onDailyLimitChange: (Int) -> Unit,
    onThresholdChange: (Long) -> Unit,
    onClearAllData: () -> Unit,
    modifier: Modifier = Modifier
) {
    var showDeleteDialog by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(Navy950)
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
        contentPadding = PaddingValues(top = 24.dp, bottom = 48.dp)
    ) {
        item {
            Text(
                text = stringResource(R.string.nav_settings),
                style = MaterialTheme.typography.headlineMedium,
                color = TextPrimary
            )
        }

        // Language Selector
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Navy900),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(text = stringResource(R.string.settings_language), style = MaterialTheme.typography.titleLarge, color = TextPrimary)
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = { onLanguageChange("en") },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (currentLanguage == "en") ElectricCyan else Charcoal800
                            ),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text(text = stringResource(R.string.settings_language_en), color = Color.White)
                        }

                        Button(
                            onClick = { onLanguageChange("ar") },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (currentLanguage == "ar") ElectricCyan else Charcoal800
                            ),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text(text = stringResource(R.string.settings_language_ar), color = Color.White)
                        }
                    }
                }
            }
        }

        // Floating VR Goggles Overlay settings
        item {
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
                            Text(text = stringResource(R.string.floating_icon_title), style = MaterialTheme.typography.titleLarge, color = TextPrimary)
                            Text(text = stringResource(R.string.floating_icon_desc), style = MaterialTheme.typography.bodyMedium, color = TextSecondary)
                        }
                        Switch(
                            checked = floatingIconEnabled,
                            onCheckedChange = onFloatingIconToggle,
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = ElectricCyan,
                                uncheckedTrackColor = Charcoal800
                            )
                        )
                    }

                    if (floatingIconEnabled) {
                        Spacer(modifier = Modifier.height(14.dp))
                        Text(
                            text = "${stringResource(R.string.floating_icon_opacity)}: ${(floatingIconOpacity * 100).toInt()}%",
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextSecondary
                        )
                        Slider(
                            value = floatingIconOpacity,
                            onValueChange = onFloatingOpacityChange,
                            valueRange = 0.3f..1.0f,
                            colors = SliderDefaults.colors(
                                thumbColor = ElectricCyan,
                                activeTrackColor = ElectricCyan,
                                inactiveTrackColor = Charcoal800
                            )
                        )
                    }
                }
            }
        }

        // Daily Limit setting
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Navy900),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(text = stringResource(R.string.settings_daily_limit), style = MaterialTheme.typography.titleLarge, color = TextPrimary)
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf(50, 100, 150, 200).forEach { limit ->
                            FilterChip(
                                selected = dailyLimit == limit,
                                onClick = { onDailyLimitChange(limit) },
                                label = { Text("$limit") },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = ElectricViolet,
                                    selectedLabelColor = Color.White
                                )
                            )
                        }
                    }
                }
            }
        }

        // Minimum Duration Threshold
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Navy900),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(text = stringResource(R.string.settings_threshold_title), style = MaterialTheme.typography.titleLarge, color = TextPrimary)
                    Text(text = stringResource(R.string.settings_threshold_desc), style = MaterialTheme.typography.bodyMedium, color = TextSecondary)
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(text = "${minThresholdMs} ms (1.5s default)", color = ElectricCyan, fontWeight = FontWeight.SemiBold)
                    Slider(
                        value = minThresholdMs.toFloat(),
                        onValueChange = { onThresholdChange(it.toLong()) },
                        valueRange = 500f..4000f,
                        steps = 7,
                        colors = SliderDefaults.colors(
                            thumbColor = ElectricCyan,
                            activeTrackColor = ElectricCyan,
                            inactiveTrackColor = Charcoal800
                        )
                    )
                }
            }
        }

        // Privacy card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Navy900),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(text = stringResource(R.string.privacy_title), style = MaterialTheme.typography.titleLarge, color = EmeraldGreen, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = stringResource(R.string.privacy_content),
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextSecondary
                    )
                }
            }
        }

        // Delete Data
        item {
            OutlinedButton(
                onClick = { showDeleteDialog = true },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = NeonPink),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(text = stringResource(R.string.settings_clear_data), fontWeight = FontWeight.Bold)
            }
        }
    }

    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text(text = stringResource(R.string.settings_clear_data), color = TextPrimary) },
            text = { Text(text = stringResource(R.string.settings_clear_confirm), color = TextSecondary) },
            confirmButton = {
                TextButton(
                    onClick = {
                        onClearAllData()
                        showDeleteDialog = false
                    }
                ) {
                    Text("Delete", color = NeonPink, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) {
                    Text("Cancel", color = TextSecondary)
                }
            },
            containerColor = Navy900
        )
    }
}
