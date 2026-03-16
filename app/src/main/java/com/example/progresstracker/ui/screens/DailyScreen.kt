package com.example.progresstracker.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.progresstracker.ui.components.TaskItemCard
import com.example.progresstracker.ui.components.TimerCard
import com.example.progresstracker.viewmodel.DailyUiState

@Composable
fun DailyScreen(
    uiState: DailyUiState,
    secondsLeft: Int,
    isTimerRunning: Boolean,
    onToggleTask: (Long, Boolean) -> Unit,
    onStartTimer: () -> Unit,
    onPauseTimer: () -> Unit,
    onResetTimer: () -> Unit
) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Daily", style = MaterialTheme.typography.headlineMedium)
        Text("${uiState.completedCount}/${uiState.tasks.size} complete")
        LinearProgressIndicator(progress = { uiState.progress }, modifier = Modifier.fillMaxWidth())

        TimerCard(
            secondsLeft = secondsLeft,
            isRunning = isTimerRunning,
            onStart = onStartTimer,
            onPause = onPauseTimer,
            onReset = onResetTimer
        )

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(uiState.tasks, key = { it.id }) { task ->
                TaskItemCard(
                    task = task,
                    checked = uiState.completionByTaskId[task.id]?.completed == true,
                    onCheckedChange = { checked -> onToggleTask(task.id, checked) }
                )
            }
        }
    }
}
