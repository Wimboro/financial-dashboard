package com.hiddenglam.financialdashboard.data.model

data class ApiResult<T>(
    val isSuccess: Boolean,
    val data: T? = null,
    val errorMessage: String? = null
) {
    companion object {
        fun <T> success(data: T): ApiResult<T> {
            return ApiResult(isSuccess = true, data = data)
        }
        
        fun <T> error(message: String): ApiResult<T> {
            return ApiResult(isSuccess = false, errorMessage = message)
        }
        
        fun <T> error(exception: Exception): ApiResult<T> {
            return ApiResult(isSuccess = false, errorMessage = exception.message)
        }
    }
}