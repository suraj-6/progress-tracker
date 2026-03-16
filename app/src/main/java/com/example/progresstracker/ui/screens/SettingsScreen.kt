package com.example.progresstracker.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.progresstracker.data.TaskEntity

@Composable
fun SettingsScreen(
    tasks: List<TaskEntity>,
    isDarkTheme: Boolean,
    selectedAmbient: Int,
    onThemeToggle: (Boolean) -> Unit,
    onAmbientSelected: (Int) -> Unit,
    onAddTask: (String, Int) -> Unit,
    onUpdateTask: (TaskEntity) -> Unit,
    onDeleteTask: (TaskEntity) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var minutes by remember { mutableStateOf("25") }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
            Text("Dark theme")
            Switch(checked = isDarkTheme, onCheckedChange = onThemeToggle)
        }

        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Ambient")
            Button(onClick = { onAmbientSelected((selectedAmbient + 1) % 3) }) {
                Text("Cycle sound #$selectedAmbient")
            }
        }

        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Task manager")
                OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("Task title") })
                OutlinedTextField(value = minutes, onValueChange = { minutes = it }, label = { Text("Target minutes") })
                Button(onClick = {
                    val parsed = minutes.toIntOrNull() ?: 25
                    if (title.isNotBlank()) {
                        onAddTask(title.trim(), parsed)
                        title = ""
                    }
                }) {
                    Text("Add Task")
                }
            }
        }

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(tasks, key = { it.id }) { task ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(task.title)
                            Text("${task.targetMinutes} min")
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(onClick = { onUpdateTask(task.copy(title = task.title + " ✨")) }) {
                                Text("Edit")
                            }
                            Button(onClick = { onDeleteTask(task) }) {
                                Text("Delete")
                            }
                        }
                    }
                }
            }
        }
    }
}
