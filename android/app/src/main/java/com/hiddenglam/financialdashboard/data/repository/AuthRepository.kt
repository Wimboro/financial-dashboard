package com.hiddenglam.financialdashboard.data.repository

import android.content.Context
import android.content.SharedPreferences
import androidx.preference.PreferenceManager
import com.hiddenglam.financialdashboard.data.model.ApiResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext

class AuthRepository(private val context: Context) {
    
    private val sharedPreferences: SharedPreferences = 
        PreferenceManager.getDefaultSharedPreferences(context)
    
    // TODO: Replace with actual Supabase implementation
    suspend fun signIn(email: String, password: String): ApiResult<Boolean> {
        return withContext(Dispatchers.IO) {
            try {
                // Simulate network call
                delay(1000)
                
                // Simple validation for demo purposes
                if (email.isNotEmpty() && password.length >= 6) {
                    // Save authentication state
                    sharedPreferences.edit()
                        .putBoolean("is_logged_in", true)
                        .putString("user_id", "demo_user_${System.currentTimeMillis()}")
                        .putString("user_email", email)
                        .apply()
                    
                    ApiResult.success(true)
                } else {
                    ApiResult.error("Invalid email or password")
                }
            } catch (e: Exception) {
                ApiResult.error(e.message ?: "Sign in failed")
            }
        }
    }
    
    suspend fun signUp(email: String, password: String): ApiResult<Boolean> {
        return withContext(Dispatchers.IO) {
            try {
                // Simulate network call
                delay(1000)
                
                // Simple validation for demo purposes
                if (email.isNotEmpty() && password.length >= 6) {
                    ApiResult.success(true)
                } else {
                    ApiResult.error("Invalid email or password")
                }
            } catch (e: Exception) {
                ApiResult.error(e.message ?: "Sign up failed")
            }
        }
    }
    
    suspend fun resetPassword(email: String): ApiResult<Boolean> {
        return withContext(Dispatchers.IO) {
            try {
                // Simulate network call
                delay(1000)
                
                if (email.isNotEmpty()) {
                    ApiResult.success(true)
                } else {
                    ApiResult.error("Invalid email")
                }
            } catch (e: Exception) {
                ApiResult.error(e.message ?: "Password reset failed")
            }
        }
    }
    
    suspend fun signOut(): ApiResult<Boolean> {
        return withContext(Dispatchers.IO) {
            try {
                // Clear authentication state
                sharedPreferences.edit()
                    .putBoolean("is_logged_in", false)
                    .remove("user_id")
                    .remove("user_email")
                    .apply()
                
                ApiResult.success(true)
            } catch (e: Exception) {
                ApiResult.error(e.message ?: "Sign out failed")
            }
        }
    }
    
    fun isUserLoggedIn(): Boolean {
        return sharedPreferences.getBoolean("is_logged_in", false)
    }
    
    fun getCurrentUserId(): String? {
        return sharedPreferences.getString("user_id", null)
    }
    
    fun getCurrentUserEmail(): String? {
        return sharedPreferences.getString("user_email", null)
    }
}