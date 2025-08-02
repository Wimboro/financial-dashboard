package com.hiddenglam.financialdashboard.ui.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.google.android.material.tabs.TabLayoutMediator
import com.hiddenglam.financialdashboard.MainActivity
import com.hiddenglam.financialdashboard.R
import com.hiddenglam.financialdashboard.databinding.ActivityAuthBinding
import com.hiddenglam.financialdashboard.viewmodel.AuthViewModel

class AuthActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityAuthBinding
    private lateinit var authViewModel: AuthViewModel
    private lateinit var authPagerAdapter: AuthPagerAdapter
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        binding = ActivityAuthBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        authViewModel = ViewModelProvider(this)[AuthViewModel::class.java]
        
        setupUI()
        observeViewModel()
    }
    
    private fun setupUI() {
        // Setup ViewPager with tabs
        authPagerAdapter = AuthPagerAdapter(this)
        binding.viewPager.adapter = authPagerAdapter
        
        TabLayoutMediator(binding.tabLayout, binding.viewPager) { tab, position ->
            tab.text = when (position) {
                0 -> getString(R.string.sign_in)
                1 -> getString(R.string.sign_up)
                else -> ""
            }
        }.attach()
    }
    
    private fun observeViewModel() {
        authViewModel.isLoggedIn.observe(this) { isLoggedIn ->
            if (isLoggedIn) {
                startMainActivity()
            }
        }
        
        authViewModel.isLoading.observe(this) { isLoading ->
            binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        }
        
        authViewModel.error.observe(this) { error ->
            if (!error.isNullOrEmpty()) {
                Toast.makeText(this, error, Toast.LENGTH_LONG).show()
                authViewModel.clearError()
            }
        }
        
        authViewModel.signUpSuccess.observe(this) { success ->
            if (success) {
                Toast.makeText(this, "Check your email for verification link!", Toast.LENGTH_LONG).show()
                authViewModel.clearSignUpSuccess()
                // Switch to sign in tab
                binding.viewPager.currentItem = 0
            }
        }
    }
    
    private fun startMainActivity() {
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
        finish()
    }
}