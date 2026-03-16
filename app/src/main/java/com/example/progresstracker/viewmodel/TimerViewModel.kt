package com.example.progresstracker.viewmodel

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class TimerViewModel(application: Application) : AndroidViewModel(application) {
    private val notificationManager =
        application.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    private val _secondsLeft = MutableStateFlow(DEFAULT_SECONDS)
    val secondsLeft: StateFlow<Int> = _secondsLeft

    private val _isRunning = MutableStateFlow(false)
    val isRunning: StateFlow<Boolean> = _isRunning

    private var timerJob: Job? = null
    private var mediaPlayer: MediaPlayer? = null

    init {
        createChannel()
    }

    fun start() {
        if (_isRunning.value) return
        _isRunning.value = true
        timerJob = viewModelScope.launch {
            while (_secondsLeft.value > 0 && _isRunning.value) {
                delay(1000)
                _secondsLeft.value -= 1
            }
            if (_secondsLeft.value == 0) {
                sendFocusCompleteNotification()
                _isRunning.value = false
            }
        }
    }

    fun pause() {
        _isRunning.value = false
        timerJob?.cancel()
    }

    fun reset(minutes: Int = 25) {
        pause()
        _secondsLeft.value = minutes * 60
    }

    fun playAmbientSound(context: Context, soundUri: Uri) {
        stopAmbientSound()
        mediaPlayer = MediaPlayer().apply {
            setDataSource(context, soundUri)
            isLooping = true
            prepare()
            start()
        }
    }

    fun stopAmbientSound() {
        mediaPlayer?.stop()
        mediaPlayer?.release()
        mediaPlayer = null
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Focus Notifications",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun sendFocusCompleteNotification() {
        val notification = NotificationCompat.Builder(getApplication(), CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("Pomodoro Complete")
            .setContentText("Great work! Take a short break.")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .build()

        notificationManager.notify(1001, notification)
    }

    override fun onCleared() {
        super.onCleared()
        stopAmbientSound()
    }

    companion object {
        private const val CHANNEL_ID = "focus_channel"
        private const val DEFAULT_SECONDS = 25 * 60
    }
}
