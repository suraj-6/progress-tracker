package com.example.progresstracker.data

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index

@Entity(
    tableName = "task_completions",
    primaryKeys = ["taskId", "date"],
    foreignKeys = [
        ForeignKey(
            entity = TaskEntity::class,
            parentColumns = ["id"],
            childColumns = ["taskId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("taskId"), Index("date")]
)
data class TaskCompletionEntity(
    val taskId: Long,
    val date: String,
    val completed: Boolean,
    val minutesSpent: Int = 0
)
