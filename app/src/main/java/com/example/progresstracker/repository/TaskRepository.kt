package com.example.progresstracker.repository

import com.example.progresstracker.data.TaskCompletionEntity
import com.example.progresstracker.data.TaskDao
import com.example.progresstracker.data.TaskEntity
import kotlinx.coroutines.flow.Flow
import java.time.LocalDate

class TaskRepository(private val taskDao: TaskDao) {
    fun observeTasks(): Flow<List<TaskEntity>> = taskDao.observeTasks()

    fun observeCompletionsForDate(date: LocalDate): Flow<List<TaskCompletionEntity>> =
        taskDao.observeCompletionsForDate(date.toString())

    fun observeCompletionsForRange(startDate: LocalDate, endDate: LocalDate): Flow<List<TaskCompletionEntity>> =
        taskDao.observeCompletionsForRange(startDate.toString(), endDate.toString())

    suspend fun addTask(title: String, targetMinutes: Int) {
        taskDao.insertTask(TaskEntity(title = title, targetMinutes = targetMinutes))
    }

    suspend fun updateTask(task: TaskEntity) = taskDao.updateTask(task)

    suspend fun deleteTask(task: TaskEntity) = taskDao.deleteTask(task)

    suspend fun setTaskCompletion(taskId: Long, date: LocalDate, completed: Boolean, minutesSpent: Int = 0) {
        taskDao.upsertCompletion(
            TaskCompletionEntity(
                taskId = taskId,
                date = date.toString(),
                completed = completed,
                minutesSpent = minutesSpent
            )
        )
    }
}
