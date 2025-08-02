package com.hiddenglam.financialdashboard.data.repository

import android.content.Context
import android.content.SharedPreferences
import androidx.preference.PreferenceManager
import com.google.gson.Gson
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import com.hiddenglam.financialdashboard.data.model.ApiResult
import com.hiddenglam.financialdashboard.data.model.Transaction
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.*

class FinancialRepository(private val context: Context) {
    
    private val sharedPreferences: SharedPreferences = 
        PreferenceManager.getDefaultSharedPreferences(context)
    private val client = OkHttpClient()
    private val gson = Gson()
    
    private fun getGoogleSheetId(): String? {
        return sharedPreferences.getString("google_sheet_id", null)
    }
    
    private fun getBackendApiUrl(): String? {
        val isLocalhost = false // You can implement localhost detection if needed
        return if (isLocalhost) {
            sharedPreferences.getString("backend_api_url_localhost", null)
        } else {
            sharedPreferences.getString("backend_api_url_production", null)
        }
    }
    
    private fun getGeminiApiKey(): String? {
        return sharedPreferences.getString("gemini_api_key", null)
    }
    
    suspend fun fetchTransactions(): ApiResult<List<Transaction>> {
        return withContext(Dispatchers.IO) {
            try {
                val sheetId = getGoogleSheetId()
                val backendUrl = getBackendApiUrl()
                
                if (sheetId.isNullOrEmpty()) {
                    return@withContext ApiResult.error<List<Transaction>>("Google Sheet ID not configured")
                }
                
                if (backendUrl.isNullOrEmpty()) {
                    return@withContext ApiResult.error<List<Transaction>>("Backend API URL not configured")
                }
                
                val url = "$backendUrl/spreadsheet/$sheetId/data?sheet=Sheet1"
                val request = Request.Builder()
                    .url(url)
                    .build()
                
                val response = client.newCall(request).execute()
                
                if (!response.isSuccessful) {
                    return@withContext ApiResult.error<List<Transaction>>("HTTP ${response.code}: ${response.message}")
                }
                
                val responseBody = response.body?.string()
                if (responseBody.isNullOrEmpty()) {
                    return@withContext ApiResult.error<List<Transaction>>("Empty response from server")
                }
                
                val jsonResponse = gson.fromJson(responseBody, JsonObject::class.java)
                
                if (!jsonResponse.get("success").asBoolean) {
                    val errorMessage = jsonResponse.get("message")?.asString ?: "Unknown error"
                    return@withContext ApiResult.error<List<Transaction>>(errorMessage)
                }
                
                val data = jsonResponse.get("data")
                val transactions = parseTransactionData(data)
                
                ApiResult.success(transactions)
                
            } catch (e: IOException) {
                ApiResult.error<List<Transaction>>("Network error: ${e.message}")
            } catch (e: Exception) {
                ApiResult.error<List<Transaction>>("Error parsing data: ${e.message}")
            }
        }
    }
    
    private fun parseTransactionData(data: com.google.gson.JsonElement): List<Transaction> {
        val transactions = mutableListOf<Transaction>()
        
        try {
            when {
                data.isJsonArray -> {
                    val dataArray = data.asJsonArray
                    if (dataArray.size() > 0 && dataArray[0].isJsonArray) {
                        // Array of arrays format
                        val headers = dataArray[0].asJsonArray
                        for (i in 1 until dataArray.size()) {
                            val row = dataArray[i].asJsonArray
                            val transaction = parseTransactionRow(headers, row, i + 1)
                            transaction?.let { transactions.add(it) }
                        }
                    }
                }
                data.isJsonObject -> {
                    val dataObject = data.asJsonObject
                    if (dataObject.has("values")) {
                        val values = dataObject.get("values").asJsonArray
                        if (values.size() > 0) {
                            val headers = values[0].asJsonArray
                            for (i in 1 until values.size()) {
                                val row = values[i].asJsonArray
                                val transaction = parseTransactionRow(headers, row, i + 1)
                                transaction?.let { transactions.add(it) }
                            }
                        }
                    }
                }
            }
        } catch (e: Exception) {
            // Log error but don't crash
            e.printStackTrace()
        }
        
        return transactions.filter { it.date.isNotEmpty() && it.amount > 0 }
    }
    
    private fun parseTransactionRow(headers: JsonArray, row: JsonArray, rowIndex: Int): Transaction? {
        try {
            val transactionData = mutableMapOf<String, String>()
            
            for (i in 0 until minOf(headers.size(), row.size())) {
                val header = headers[i].asString.lowercase()
                val value = if (row[i].isJsonNull) "" else row[i].asString
                transactionData[header] = value
            }
            
            // Parse date
            val dateStr = transactionData["date"] ?: return null
            if (dateStr.isEmpty()) return null
            
            val formattedDate = try {
                val inputDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).parse(dateStr)
                SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(inputDate ?: Date())
            } catch (e: Exception) {
                dateStr
            }
            
            // Parse amount and determine type
            val amountStr = transactionData["amount"] ?: "0"
            val amount = try {
                amountStr.toDouble()
            } catch (e: Exception) {
                0.0
            }
            
            if (amount == 0.0) return null
            
            val type = if (amount >= 0) "income" else "expense"
            val absoluteAmount = kotlin.math.abs(amount)
            
            return Transaction(
                id = "tr-$rowIndex",
                date = formattedDate,
                description = transactionData["description"] ?: "",
                category = transactionData["category"] ?: "Uncategorized",
                amount = absoluteAmount,
                type = type,
                rowIndex = rowIndex,
                userId = transactionData["user id"] ?: transactionData["userid"],
                timestamp = transactionData["timestamp"]
            )
        } catch (e: Exception) {
            return null
        }
    }
    
    suspend fun deleteTransaction(transaction: Transaction): ApiResult<Boolean> {
        return withContext(Dispatchers.IO) {
            try {
                val backendUrl = getBackendApiUrl()
                val sheetId = getGoogleSheetId()
                
                if (backendUrl.isNullOrEmpty() || sheetId.isNullOrEmpty()) {
                    return@withContext ApiResult.error<Boolean>("Configuration missing")
                }
                
                if (transaction.rowIndex == null) {
                    return@withContext ApiResult.error<Boolean>("Row index missing")
                }
                
                val requestBody = JsonObject().apply {
                    addProperty("sheetId", sheetId)
                    addProperty("rowIndex", transaction.rowIndex)
                }
                
                val request = Request.Builder()
                    .url("$backendUrl/delete-transaction")
                    .post(requestBody.toString().toRequestBody("application/json".toMediaType()))
                    .build()
                
                val response = client.newCall(request).execute()
                
                if (!response.isSuccessful) {
                    return@withContext ApiResult.error<Boolean>("HTTP ${response.code}: ${response.message}")
                }
                
                val responseBody = response.body?.string()
                val jsonResponse = gson.fromJson(responseBody, JsonObject::class.java)
                
                if (jsonResponse.get("success")?.asBoolean == true) {
                    ApiResult.success(true)
                } else {
                    val errorMessage = jsonResponse.get("message")?.asString ?: "Delete failed"
                    ApiResult.error<Boolean>(errorMessage)
                }
                
            } catch (e: Exception) {
                ApiResult.error<Boolean>("Delete failed: ${e.message}")
            }
        }
    }
    
    suspend fun getGeminiInsights(expenseData: Map<String, Double>): ApiResult<String> {
        return withContext(Dispatchers.IO) {
            try {
                val apiKey = getGeminiApiKey()
                if (apiKey.isNullOrEmpty()) {
                    return@withContext ApiResult.error<String>("Gemini API key not configured")
                }
                
                val expenseDetails = expenseData.entries.joinToString(", ") { "${it.key}: Rp ${it.value.toLong()}" }
                val prompt = """
                    Anda adalah asisten keuangan yang membantu. Analisis pengeluaran bulanan berikut untuk seorang individu di Indonesia. Semua jumlah dalam Rupiah Indonesia (IDR).
                    Rincian Pengeluaran: $expenseDetails
                    Berikan dalam Bahasa Indonesia: 1. Ringkasan singkat (1-2 kalimat) pola pengeluaran. 2. 3-5 tips hemat yang praktis dan dapat dijalankan, disesuaikan dengan pengeluaran spesifik ini dan konteks Indonesia. 3. Jika ada kategori pengeluaran yang luar biasa tinggi, harap sorot.
                    Format respons Anda dengan jelas, gunakan poin-poin untuk tips. Jaga agar bahasa tetap ringkas dan mudah dipahami.
                """.trimIndent()
                
                val requestBody = JsonObject().apply {
                    val contents = JsonArray().apply {
                        add(JsonObject().apply {
                            addProperty("role", "user")
                            val parts = JsonArray().apply {
                                add(JsonObject().apply {
                                    addProperty("text", prompt)
                                })
                            }
                            add("parts", parts)
                        })
                    }
                    add("contents", contents)
                }
                
                val request = Request.Builder()
                    .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=$apiKey")
                    .post(requestBody.toString().toRequestBody("application/json".toMediaType()))
                    .build()
                
                val response = client.newCall(request).execute()
                
                if (!response.isSuccessful) {
                    return@withContext ApiResult.error<String>("HTTP ${response.code}: ${response.message}")
                }
                
                val responseBody = response.body?.string()
                val jsonResponse = gson.fromJson(responseBody, JsonObject::class.java)
                
                val candidates = jsonResponse.getAsJsonArray("candidates")
                if (candidates != null && candidates.size() > 0) {
                    val candidate = candidates[0].asJsonObject
                    val content = candidate.getAsJsonObject("content")
                    val parts = content.getAsJsonArray("parts")
                    if (parts != null && parts.size() > 0) {
                        val text = parts[0].asJsonObject.get("text").asString
                        return@withContext ApiResult.success(text)
                    }
                }
                
                ApiResult.error<String>("No response from Gemini API")
                
            } catch (e: Exception) {
                ApiResult.error<String>("Gemini API error: ${e.message}")
            }
        }
    }
}