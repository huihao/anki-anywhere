package com.ankianywhere.ui

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.ankianywhere.R
import com.ankianywhere.services.APIService

class SettingsActivity : AppCompatActivity() {
    private lateinit var apiService: APIService
    private lateinit var apiUrlEditText: EditText
    private lateinit var tokenEditText: EditText
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)
        
        title = "设置"
        
        apiService = APIService(this)
        
        apiUrlEditText = findViewById(R.id.apiUrlEditText)
        tokenEditText = findViewById(R.id.tokenEditText)
        
        val prefs = getSharedPreferences("anki_anywhere", MODE_PRIVATE)
        apiUrlEditText.setText(prefs.getString("apiBaseURL", "http://localhost:3000/api"))
        tokenEditText.setText(prefs.getString("authToken", ""))
        
        findViewById<Button>(R.id.saveButton).setOnClickListener {
            saveSettings()
        }
    }
    
    private fun saveSettings() {
        val apiUrl = apiUrlEditText.text.toString()
        val token = tokenEditText.text.toString()
        
        apiService.setBaseURL(apiUrl)
        apiService.setAuthToken(token)
        
        Toast.makeText(this, "设置已保存", Toast.LENGTH_SHORT).show()
        finish()
    }
}
