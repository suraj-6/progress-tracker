package com.example.progresstracker.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.progresstracker.ui.components.StatCard
import com.example.progresstracker.viewmodel.StatsUiState

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun MonthlyScreen(stats: StatsUiState) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Monthly", style = MaterialTheme.typography.headlineMedium)
        StatCard(
            title = "Monthly Completion",
            subtitle = "Calendar overview",
            progress = stats.completionRate
        )

        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            (1..30).forEach { day ->
                val dayKey = stats.completionsByDate.keys.find { it.endsWith("-${day.toString().padStart(2, '0')}") }
                val count = if (dayKey == null) 0 else stats.completionsByDate[dayKey] ?: 0
                Card(modifier = Modifier.fillMaxWidth(0.18f)) {
                    Column(modifier = Modifier.padding(8.dp)) {
                        Text("$day", style = MaterialTheme.typography.labelLarge)
                        Text("$count", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }
    }
}
