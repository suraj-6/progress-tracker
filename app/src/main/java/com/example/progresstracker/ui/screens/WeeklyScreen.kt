package com.example.progresstracker.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.progresstracker.ui.components.StatCard
import com.example.progresstracker.viewmodel.StatsUiState

@Composable
fun WeeklyScreen(stats: StatsUiState) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Weekly", style = MaterialTheme.typography.headlineMedium)
        StatCard(
            title = "Weekly Completion",
            subtitle = "Tasks: ${stats.totalTasks}",
            progress = stats.completionRate
        )

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(stats.completionsByDate.toList()) { (date, count) ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(date, style = MaterialTheme.typography.titleSmall)
                        Text("Completed tasks: $count")
                    }
                }
            }
        }
    }
}
