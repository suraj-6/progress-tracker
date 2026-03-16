package com.example.progresstracker.repository

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "settings")

class PreferencesRepository(private val context: Context) {
    private val darkThemeKey = booleanPreferencesKey("dark_theme")
    private val ambientSoundKey = intPreferencesKey("ambient_sound")

    val isDarkTheme: Flow<Boolean> = context.dataStore.data.map { it[darkThemeKey] ?: false }
    val selectedAmbientSound: Flow<Int> = context.dataStore.data.map { it[ambientSoundKey] ?: 0 }

    suspend fun setDarkTheme(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[darkThemeKey] = enabled
        }
    }

    suspend fun setAmbientSound(index: Int) {
        context.dataStore.edit { preferences ->
            preferences[ambientSoundKey] = index
        }
    }
}
