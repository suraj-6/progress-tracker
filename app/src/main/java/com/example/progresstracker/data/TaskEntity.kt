package com.example.progresstracker.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "tasks")
data class TaskEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val targetMinutes: Int = 25,
    val colorHex: String = "#6750A4",
    val isArchived: Boolean = false
)
