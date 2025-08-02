package com.hiddenglam.financialdashboard.viewmodel

import android.app.Application
import android.content.Context
import android.content.SharedPreferences
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import androidx.preference.PreferenceManager
import com.hiddenglam.financialdashboard.data.repository.AuthRepository
import kotlinx.coroutines.launch

class AuthViewModel(application: Application) : AndroidViewModel(application) {
    
    private val authRepository = AuthRepository(application)
    private val sharedPreferences: SharedPreferences = 
        PreferenceManager.getDefaultSharedPreferences(application)
    
    private val _isLoggedIn = MutableLiveData<Boolean>()
    val isLoggedIn: LiveData<Boolean> = _isLoggedIn
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error
    
    private val _signUpSuccess = MutableLiveData<Boolean>()
    val signUpSuccess: LiveData<Boolean> = _signUpSuccess
    
    init {
        checkAuthState()
    }
    
    private fun checkAuthState() {
        viewModelScope.launch {
            try {
                val isAuthenticated = authRepository.isUserLoggedIn()
                _isLoggedIn.value = isAuthenticated
            } catch (e: Exception) {
                _error.value = e.message ?: "Authentication check failed"
                _isLoggedIn.value = false
            }
        }
    }
    
    fun signIn(email: String, password: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                val result = authRepository.signIn(email, password)
                if (result.isSuccess) {
                    _isLoggedIn.value = true
                } else {
                    _error.value = result.errorMessage ?: "Sign in failed"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Sign in failed"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun signUp(email: String, password: String, confirmPassword: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            _signUpSuccess.value = false
            
            // Validate passwords match
            if (password != confirmPassword) {
                _error.value = "Passwords do not match"
                _isLoading.value = false
                return@launch
            }
            
            // Validate password length
            if (password.length < 6) {
                _error.value = "Password must be at least 6 characters"
                _isLoading.value = false
                return@launch
            }
            
            try {
                val result = authRepository.signUp(email, password)
                if (result.isSuccess) {
                    _signUpSuccess.value = true
                } else {
                    _error.value = result.errorMessage ?: "Sign up failed"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Sign up failed"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun resetPassword(email: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                val result = authRepository.resetPassword(email)
                if (!result.isSuccess) {
                    _error.value = result.errorMessage ?: "Password reset failed"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Password reset failed"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun logout() {
        viewModelScope.launch {
            try {
                authRepository.signOut()
                _isLoggedIn.value = false
            } catch (e: Exception) {
                _error.value = e.message ?: "Logout failed"
            }
        }
    }
    
    fun isUserLoggedIn(): Boolean {
        return authRepository.isUserLoggedIn()
    }
    
    fun getCurrentUserId(): String? {
        return authRepository.getCurrentUserId()
    }
    
    fun clearError() {
        _error.value = null
    }
    
    fun clearSignUpSuccess() {
        _signUpSuccess.value = false
    }
}