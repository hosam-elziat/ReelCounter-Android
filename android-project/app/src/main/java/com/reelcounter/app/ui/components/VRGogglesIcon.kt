package com.reelcounter.app.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.reelcounter.app.ui.theme.*

@Composable
fun VRGogglesIcon(
    size: Dp = 64.dp,
    badgeCount: Int? = null,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val glowAlpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 0.85f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "glow"
    )

    Box(
        modifier = modifier
            .size(size)
            .shadow(12.dp, CircleShape, spotColor = ElectricCyan.copy(alpha = glowAlpha))
            .clip(CircleShape)
            .background(
                brush = Brush.radialGradient(
                    colors = listOf(Charcoal800, Navy950)
                )
            )
            .border(
                width = 2.dp,
                brush = Brush.linearGradient(
                    colors = listOf(ElectricCyan, ElectricViolet)
                ),
                shape = CircleShape
            ),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize(0.65f)) {
            val w = this.size.width
            val h = this.size.height

            // Headset outer visor body
            drawRoundRect(
                brush = Brush.horizontalGradient(
                    colors = listOf(ElectricCyan, ElectricBlue, ElectricViolet)
                ),
                topLeft = Offset(w * 0.08f, h * 0.28f),
                size = Size(w * 0.84f, h * 0.44f),
                cornerRadius = CornerRadius(w * 0.12f, h * 0.12f),
                style = Stroke(width = 3.dp.toPx())
            )

            // Left lens
            drawRoundRect(
                color = ElectricCyan.copy(alpha = 0.85f),
                topLeft = Offset(w * 0.18f, h * 0.36f),
                size = Size(w * 0.28f, h * 0.28f),
                cornerRadius = CornerRadius(w * 0.08f, h * 0.08f)
            )

            // Right lens
            drawRoundRect(
                color = ElectricViolet.copy(alpha = 0.85f),
                topLeft = Offset(w * 0.54f, h * 0.36f),
                size = Size(w * 0.28f, h * 0.28f),
                cornerRadius = CornerRadius(w * 0.08f, h * 0.08f)
            )

            // Center neon sensor dot
            drawCircle(
                color = Color.White,
                radius = 2.dp.toPx(),
                center = Offset(w * 0.5f, h * 0.5f)
            )
        }

        // Attached live badge
        if (badgeCount != null) {
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .offset(x = 4.dp, y = (-2).dp)
                    .background(NeonPink, RoundedCornerShape(10.dp))
                    .border(1.5.dp, Color.White, RoundedCornerShape(10.dp))
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            ) {
                Text(
                    text = if (badgeCount > 999) "999+" else badgeCount.toString(),
                    color = Color.White,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
