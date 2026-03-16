package com.example.progresstracker.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.progresstracker.data.TaskCompletionEntity
import com.example.progresstracker.data.TaskEntity
import com.example.progresstracker.repository.PreferencesRepository
import com.example.progresstracker.repository.TaskRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.YearMonth

class TaskViewModel(
    private val taskRepository: TaskRepository,
    private val preferencesRepository: PreferencesRepository
) : ViewModel() {

    private val selectedDate = MutableStateFlow(LocalDate.now())

    val tasks: StateFlow<List<TaskEntity>> = taskRepository.observeTasks()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val selectedDateCompletions: StateFlow<List<TaskCompletionEntity>> = selectedDate
        .flatMapLatest { date -> taskRepository.observeCompletionsForDate(date) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val dailyUiState: StateFlow<DailyUiState> = combine(
        tasks,
        selectedDateCompletions,
        selectedDate
    ) { taskList, completions, date ->
        DailyUiState(taskList, completions.associateBy { it.taskId }, date)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), DailyUiState())

    val weeklyStats: StateFlow<StatsUiState> = buildStatsState(7)
    val monthlyStats: StateFlow<StatsUiState> = buildStatsState(30)
    val yearlyStats: StateFlow<StatsUiState> = buildStatsState(365)

    val isDarkTheme = preferencesRepository.isDarkTheme
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)

    val selectedAmbientSound = preferencesRepository.selectedAmbientSound
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    private fun buildStatsState(days: Long): StateFlow<StatsUiState> {
        val end = LocalDate.now()
        val start = end.minusDays(days - 1)
        return combine(tasks, taskRepository.observeCompletionsForRange(start, end)) { taskList, completions ->
            val totalSlots = taskList.size * days.toInt()
            val completed = completions.count { it.completed }
            val byDate = completions.groupBy { it.date }.mapValues { (_, value) -> value.count { it.completed } }
            StatsUiState(
                totalTasks = taskList.size,
                completionRate = if (totalSlots == 0) 0f else completed.toFloat() / totalSlots,
                completionsByDate = byDate
            )
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), StatsUiState())
    }

    fun setSelectedDate(date: LocalDate) {
        selectedDate.value = date
    }

    fun addTask(title: String, targetMinutes: Int) {
        viewModelScope.launch { taskRepository.addTask(title, targetMinutes) }
    }

    fun updateTask(task: TaskEntity) {
        viewModelScope.launch { taskRepository.updateTask(task) }
    }

    fun deleteTask(task: TaskEntity) {
        viewModelScope.launch { taskRepository.deleteTask(task) }
    }

    fun toggleTaskCompletion(taskId: Long, completed: Boolean) {
        viewModelScope.launch {
            val minutes = if (completed) 25 else 0
            taskRepository.setTaskCompletion(taskId, selectedDate.value, completed, minutes)
        }
    }

    fun setDarkTheme(enabled: Boolean) {
        viewModelScope.launch { preferencesRepository.setDarkTheme(enabled) }
    }

    fun setAmbientSound(index: Int) {
        viewModelScope.launch { preferencesRepository.setAmbientSound(index) }
    }
}

data class DailyUiState(
    val tasks: List<TaskEntity> = emptyList(),
    val completionByTaskId: Map<Long, TaskCompletionEntity> = emptyMap(),
    val date: LocalDate = LocalDate.now()
) {
    val completedCount: Int get() = completionByTaskId.values.count { it.completed }
    val progress: Float get() = if (tasks.isEmpty()) 0f else completedCount.toFloat() / tasks.size
}

data class StatsUiState(
    val totalTasks: Int = 0,
    val completionRate: Float = 0f,
    val completionsByDate: Map<String, Int> = emptyMap()
) {
    fun monthlyBars(): List<Pair<YearMonth, Float>> {
        val now = YearMonth.now()
        return (0..11).map { offset ->
            val month = now.minusMonths((11 - offset).toLong())
            val monthCompletions = completionsByDate.filterKeys { it.startsWith(month.toString()) }.values.sum()
            month to (monthCompletions / (totalTasks * 30f).coerceAtLeast(1f))
        }
    }
}
