package com.hiddenglam.financialdashboard.data.model

data class FinancialSummary(
    val totalIncome: Double,
    val totalExpenses: Double,
    val netBalance: Double,
    val monthlyData: Map<String, Pair<Double, Double>>, // month -> (income, expenses)
    val categoryExpenses: Map<String, Double>
) {
    fun getFormattedTotalIncome(): String {
        return formatCurrency(totalIncome)
    }
    
    fun getFormattedTotalExpenses(): String {
        return formatCurrency(totalExpenses)
    }
    
    fun getFormattedNetBalance(): String {
        return formatCurrency(netBalance)
    }
    
    fun isPositiveBalance(): Boolean {
        return netBalance >= 0
    }
    
    private fun formatCurrency(amount: Double): String {
        val formatter = java.text.NumberFormat.getCurrencyInstance(java.util.Locale("id", "ID"))
        formatter.currency = java.util.Currency.getInstance("IDR")
        return formatter.format(amount)
    }
}