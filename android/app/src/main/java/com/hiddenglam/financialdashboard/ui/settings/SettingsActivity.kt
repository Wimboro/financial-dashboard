package com.hiddenglam.financialdashboard.ui.settings

import android.content.SharedPreferences
import android.os.Bundle
import android.view.MenuItem
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.preference.PreferenceManager
import com.hiddenglam.financialdashboard.R
import com.hiddenglam.financialdashboard.databinding.ActivitySettingsBinding

class SettingsActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySettingsBinding
    private lateinit var sharedPreferences: SharedPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivitySettingsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sharedPreferences = PreferenceManager.getDefaultSharedPreferences(this)

        setupUI()
        loadSettings()
    }

    private fun setupUI() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = getString(R.string.settings)

        // Dark mode toggle
        binding.switchDarkMode.setOnCheckedChangeListener { _, isChecked ->
            sharedPreferences.edit()
                .putBoolean("dark_mode", isChecked)
                .apply()
            
            AppCompatDelegate.setDefaultNightMode(
                if (isChecked) AppCompatDelegate.MODE_NIGHT_YES
                else AppCompatDelegate.MODE_NIGHT_NO
            )
        }

        // Save button
        binding.btnSave.setOnClickListener {
            saveSettings()
        }
    }

    private fun loadSettings() {
        // Load current settings
        binding.switchDarkMode.isChecked = sharedPreferences.getBoolean("dark_mode", false)
        binding.etGoogleSheetId.setText(sharedPreferences.getString("google_sheet_id", ""))
        binding.etGeminiApiKey.setText(sharedPreferences.getString("gemini_api_key", ""))
        binding.etBackendApiUrlLocalhost.setText(sharedPreferences.getString("backend_api_url_localhost", ""))
        binding.etBackendApiUrlProduction.setText(sharedPreferences.getString("backend_api_url_production", ""))
        binding.etSupabaseUrl.setText(sharedPreferences.getString("supabase_url", ""))
        binding.etSupabaseAnonKey.setText(sharedPreferences.getString("supabase_anon_key", ""))
    }

    private fun saveSettings() {
        sharedPreferences.edit()
            .putString("google_sheet_id", binding.etGoogleSheetId.text.toString().trim())
            .putString("gemini_api_key", binding.etGeminiApiKey.text.toString().trim())
            .putString("backend_api_url_localhost", binding.etBackendApiUrlLocalhost.text.toString().trim())
            .putString("backend_api_url_production", binding.etBackendApiUrlProduction.text.toString().trim())
            .putString("supabase_url", binding.etSupabaseUrl.text.toString().trim())
            .putString("supabase_anon_key", binding.etSupabaseAnonKey.text.toString().trim())
            .apply()

        // Show success message
        android.widget.Toast.makeText(this, "Settings saved successfully", android.widget.Toast.LENGTH_SHORT).show()
        
        // Close activity
        finish()
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            android.R.id.home -> {
                finish()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
}