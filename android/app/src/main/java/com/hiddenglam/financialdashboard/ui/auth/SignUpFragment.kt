package com.hiddenglam.financialdashboard.ui.auth

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.hiddenglam.financialdashboard.databinding.FragmentSignUpBinding
import com.hiddenglam.financialdashboard.viewmodel.AuthViewModel

class SignUpFragment : Fragment() {
    
    private var _binding: FragmentSignUpBinding? = null
    private val binding get() = _binding!!
    
    private lateinit var authViewModel: AuthViewModel
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSignUpBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        authViewModel = ViewModelProvider(requireActivity())[AuthViewModel::class.java]
        
        setupUI()
    }
    
    private fun setupUI() {
        binding.btnSignUp.setOnClickListener {
            val email = binding.etEmail.text.toString().trim()
            val password = binding.etPassword.text.toString()
            val confirmPassword = binding.etConfirmPassword.text.toString()
            
            if (validateInput(email, password, confirmPassword)) {
                authViewModel.signUp(email, password, confirmPassword)
            }
        }
        
        binding.btnTogglePassword.setOnClickListener {
            togglePasswordVisibility()
        }
    }
    
    private fun validateInput(email: String, password: String, confirmPassword: String): Boolean {
        var isValid = true
        
        if (email.isEmpty()) {
            binding.etEmail.error = "Email is required"
            isValid = false
        } else if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.etEmail.error = "Please enter a valid email"
            isValid = false
        }
        
        if (password.isEmpty()) {
            binding.etPassword.error = "Password is required"
            isValid = false
        } else if (password.length < 6) {
            binding.etPassword.error = "Password must be at least 6 characters"
            isValid = false
        }
        
        if (confirmPassword.isEmpty()) {
            binding.etConfirmPassword.error = "Please confirm your password"
            isValid = false
        } else if (password != confirmPassword) {
            binding.etConfirmPassword.error = "Passwords do not match"
            isValid = false
        }
        
        return isValid
    }
    
    private fun togglePasswordVisibility() {
        val currentInputType = binding.etPassword.inputType
        val isPasswordVisible = currentInputType == (android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD)
        
        if (isPasswordVisible) {
            binding.etPassword.inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
            binding.etConfirmPassword.inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
            binding.btnTogglePassword.setImageResource(android.R.drawable.ic_menu_view)
        } else {
            binding.etPassword.inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
            binding.etConfirmPassword.inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
            binding.btnTogglePassword.setImageResource(android.R.drawable.ic_menu_close_clear_cancel)
        }
        
        // Move cursor to end
        binding.etPassword.setSelection(binding.etPassword.text?.length ?: 0)
        binding.etConfirmPassword.setSelection(binding.etConfirmPassword.text?.length ?: 0)
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}