package com.example.progresstracker.navigation

import android.provider.Settings
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.progresstracker.ui.screens.DailyScreen
import com.example.progresstracker.ui.screens.MonthlyScreen
import com.example.progresstracker.ui.screens.SettingsScreen
import com.example.progresstracker.ui.screens.WeeklyScreen
import com.example.progresstracker.ui.screens.YearlyScreen
import com.example.progresstracker.viewmodel.TaskViewModel
import com.example.progresstracker.viewmodel.TimerViewModel

sealed class Screen(val route: String, val label: String) {
    data object Daily : Screen("daily", "Daily")
    data object Weekly : Screen("weekly", "Weekly")
    data object Monthly : Screen("monthly", "Monthly")
    data object Yearly : Screen("yearly", "Yearly")
    data object Settings : Screen("settings", "Settings")
}

@Composable
fun AppNavigation(taskViewModel: TaskViewModel, timerViewModel: TimerViewModel) {
    val navController = rememberNavController()
    val items = listOf(Screen.Daily, Screen.Weekly, Screen.Monthly, Screen.Yearly, Screen.Settings)

    val dailyUi by taskViewModel.dailyUiState.collectAsState()
    val weekly by taskViewModel.weeklyStats.collectAsState()
    val monthly by taskViewModel.monthlyStats.collectAsState()
    val yearly by taskViewModel.yearlyStats.collectAsState()
    val tasks by taskViewModel.tasks.collectAsState()
    val isDark by taskViewModel.isDarkTheme.collectAsState()
    val ambient by taskViewModel.selectedAmbientSound.collectAsState()

    val secondsLeft by timerViewModel.secondsLeft.collectAsState()
    val timerRunning by timerViewModel.isRunning.collectAsState()

    val context = LocalContext.current

    Scaffold(
        bottomBar = {
            val navBackStackEntry by navController.currentBackStackEntryAsState()
            val currentRoute = navBackStackEntry?.destination?.route
            NavigationBar {
                items.forEach { screen ->
                    NavigationBarItem(
                        selected = currentRoute == screen.route,
                        onClick = {
                            navController.navigate(screen.route) {
                                popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Text(screen.label.take(1)) },
                        label = { Text(screen.label) }
                    )
                }
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = Screen.Daily.route,
            modifier = Modifier.padding(paddingValues)
        ) {
            composable(Screen.Daily.route) {
                DailyScreen(
                    uiState = dailyUi,
                    secondsLeft = secondsLeft,
                    isTimerRunning = timerRunning,
                    onToggleTask = taskViewModel::toggleTaskCompletion,
                    onStartTimer = timerViewModel::start,
                    onPauseTimer = timerViewModel::pause,
                    onResetTimer = timerViewModel::reset
                )
            }
            composable(Screen.Weekly.route) { WeeklyScreen(weekly) }
            composable(Screen.Monthly.route) { MonthlyScreen(monthly) }
            composable(Screen.Yearly.route) { YearlyScreen(yearly) }
            composable(Screen.Settings.route) {
                SettingsScreen(
                    tasks = tasks,
                    isDarkTheme = isDark,
                    selectedAmbient = ambient,
                    onThemeToggle = taskViewModel::setDarkTheme,
                    onAmbientSelected = { index ->
                        taskViewModel.setAmbientSound(index)
                        when (index) {
                            0 -> timerViewModel.stopAmbientSound()
                            1 -> timerViewModel.playAmbientSound(context, Settings.System.DEFAULT_NOTIFICATION_URI)
                            else -> timerViewModel.playAmbientSound(context, Settings.System.DEFAULT_ALARM_ALERT_URI)
                        }
                    },
                    onAddTask = taskViewModel::addTask,
                    onUpdateTask = taskViewModel::updateTask,
                    onDeleteTask = taskViewModel::deleteTask
                )
            }
        }
    }
}
