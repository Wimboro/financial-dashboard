package com.hiddenglam.financialdashboard.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.hiddenglam.financialdashboard.data.model.Transaction
import com.hiddenglam.financialdashboard.data.model.FinancialSummary
import com.hiddenglam.financialdashboard.data.repository.FinancialRepository
import kotlinx.coroutines.launch

class MainViewModel(application: Application) : AndroidViewModel(application) {
    
    private val financialRepository = FinancialRepository(application)
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error
    
    private val _transactions = MutableLiveData<List<Transaction>>()
    val transactions: LiveData<List<Transaction>> = _transactions
    
    private val _financialSummary = MutableLiveData<FinancialSummary>()
    val financialSummary: LiveData<FinancialSummary> = _financialSummary
    
    private val _geminiInsights = MutableLiveData<String?>()
    val geminiInsights: LiveData<String?> = _geminiInsights
    
    private val _lastRefreshed = MutableLiveData<Long>()
    val lastRefreshed: LiveData<Long> = _lastRefreshed
    
    init {
        loadData()
    }
    
    fun refreshData() {
        loadData()
    }
    
    private fun loadData() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                // Load transactions from Google Sheets
                val transactionResult = financialRepository.fetchTransactions()
                if (transactionResult.isSuccess) {
                    val transactions = transactionResult.data ?: emptyList()
                    _transactions.value = transactions
                    
                    // Calculate financial summary
                    val summary = calculateFinancialSummary(transactions)
                    _financialSummary.value = summary
                    
                    _lastRefreshed.value = System.currentTimeMillis()
                } else {
                    _error.value = transactionResult.errorMessage ?: "Failed to load transactions"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load data"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun getGeminiInsights(expenseData: Map<String, Double>) {
        viewModelScope.launch {
            _isLoading.value = true
            
            try {
                val result = financialRepository.getGeminiInsights(expenseData)
                if (result.isSuccess) {
                    _geminiInsights.value = result.data
                } else {
                    _error.value = result.errorMessage ?: "Failed to get insights"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to get insights"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun deleteTransaction(transaction: Transaction) {
        viewModelScope.launch {
            _isLoading.value = true
            
            try {
                val result = financialRepository.deleteTransaction(transaction)
                if (result.isSuccess) {
                    // Refresh data after successful deletion
                    loadData()
                } else {
                    _error.value = result.errorMessage ?: "Failed to delete transaction"
                    _isLoading.value = false
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to delete transaction"
                _isLoading.value = false
            }
        }
    }
    
    private fun calculateFinancialSummary(transactions: List<Transaction>): FinancialSummary {
        var totalIncome = 0.0
        var totalExpenses = 0.0
        val monthlyData = mutableMapOf<String, Pair<Double, Double>>() // month -> (income, expenses)
        val categoryExpenses = mutableMapOf<String, Double>()
        
        transactions.forEach { transaction ->
            when (transaction.type) {
                "income" -> {
                    totalIncome += transaction.amount
                    val month = transaction.getMonthYear()
                    val current = monthlyData[month] ?: Pair(0.0, 0.0)
                    monthlyData[month] = Pair(current.first + transaction.amount, current.second)
                }
                "expense" -> {
                    totalExpenses += transaction.amount
                    val month = transaction.getMonthYear()
                    val current = monthlyData[month] ?: Pair(0.0, 0.0)
                    monthlyData[month] = Pair(current.first, current.second + transaction.amount)
                    
                    // Track category expenses
                    val currentCategoryAmount = categoryExpenses[transaction.category] ?: 0.0
                    categoryExpenses[transaction.category] = currentCategoryAmount + transaction.amount
                }
            }
        }
        
        return FinancialSummary(
            totalIncome = totalIncome,
            totalExpenses = totalExpenses,
            netBalance = totalIncome - totalExpenses,
            monthlyData = monthlyData,
            categoryExpenses = categoryExpenses
        )
    }
    
    fun clearError() {
        _error.value = null
    }
    
    fun getTransactionsByDate(date: String): List<Transaction> {
        return _transactions.value?.filter { it.date == date } ?: emptyList()
    }
    
    fun getTransactionsByCategory(category: String): List<Transaction> {
        return _transactions.value?.filter { it.category == category } ?: emptyList()
    }
}