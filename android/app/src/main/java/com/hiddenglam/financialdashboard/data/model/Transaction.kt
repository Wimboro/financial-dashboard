package com.hiddenglam.financialdashboard.data.model

import java.text.SimpleDateFormat
import java.util.*

data class Transaction(
    val id: String,
    val date: String,
    val description: String,
    val category: String,
    val amount: Double,
    val type: String, // "income" or "expense"
    val rowIndex: Int? = null,
    val userId: String? = null,
    val timestamp: String? = null
) {
    fun getFormattedAmount(): String {
        val formatter = java.text.NumberFormat.getCurrencyInstance(Locale("id", "ID"))
        formatter.currency = Currency.getInstance("IDR")
        return formatter.format(amount)
    }
    
    fun getFormattedDate(): String {
        return try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val outputFormat = SimpleDateFormat("dd MMM yyyy", Locale.getDefault())
            val date = inputFormat.parse(date)
            outputFormat.format(date ?: Date())
        } catch (e: Exception) {
            date
        }
    }
    
    fun getMonthYear(): String {
        return try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val outputFormat = SimpleDateFormat("yyyy-MM", Locale.getDefault())
            val date = inputFormat.parse(date)
            outputFormat.format(date ?: Date())
        } catch (e: Exception) {
            date.substring(0, 7) // fallback to first 7 characters
        }
    }
    
    fun getDisplayMonthYear(): String {
        return try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val outputFormat = SimpleDateFormat("MMMM yyyy", Locale("id", "ID"))
            val date = inputFormat.parse(date)
            outputFormat.format(date ?: Date())
        } catch (e: Exception) {
            date
        }
    }
}