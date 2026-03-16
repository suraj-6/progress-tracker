package com.example.progresstracker

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.progresstracker.data.AppDatabase
import com.example.progresstracker.navigation.AppNavigation
import com.example.progresstracker.repository.PreferencesRepository
import com.example.progresstracker.repository.TaskRepository
import com.example.progresstracker.ui.theme.ProgressTrackerTheme
import com.example.progresstracker.viewmodel.TaskViewModel
import com.example.progresstracker.viewmodel.TimerViewModel

class MainActivity : ComponentActivity() {

    private val taskViewModel by viewModels<TaskViewModel> {
        val db = AppDatabase.getInstance(applicationContext)
        val repo = TaskRepository(db.taskDao())
        val prefRepo = PreferencesRepository(applicationContext)
        TaskViewModelFactory(repo, prefRepo)
    }

    private val timerViewModel by viewModels<TimerViewModel>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            val darkTheme by taskViewModel.isDarkTheme.collectAsState()
            ProgressTrackerTheme(darkTheme = darkTheme) {
                AppNavigation(taskViewModel = taskViewModel, timerViewModel = timerViewModel)
            }
        }
    }
}

class TaskViewModelFactory(
    private val taskRepository: TaskRepository,
    private val preferencesRepository: PreferencesRepository
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(TaskViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return TaskViewModel(taskRepository, preferencesRepository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
