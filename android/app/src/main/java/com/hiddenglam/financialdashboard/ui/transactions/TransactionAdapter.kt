package com.hiddenglam.financialdashboard.ui.transactions

import android.graphics.Color
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.hiddenglam.financialdashboard.data.model.Transaction
import com.hiddenglam.financialdashboard.databinding.ItemTransactionBinding

class TransactionAdapter(
    private val onTransactionClick: (Transaction) -> Unit
) : ListAdapter<Transaction, TransactionAdapter.TransactionViewHolder>(TransactionDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TransactionViewHolder {
        val binding = ItemTransactionBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return TransactionViewHolder(binding)
    }

    override fun onBindViewHolder(holder: TransactionViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class TransactionViewHolder(
        private val binding: ItemTransactionBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(transaction: Transaction) {
            binding.apply {
                tvDescription.text = transaction.description
                chipCategory.text = transaction.category
                tvDate.text = transaction.getFormattedDate()
                tvAmount.text = transaction.getFormattedAmount()

                // Set amount color based on transaction type
                val amountColor = if (transaction.type == "income") {
                    Color.parseColor("#10b981") // Green for income
                } else {
                    Color.parseColor("#ef4444") // Red for expenses
                }
                tvAmount.setTextColor(amountColor)

                // Set amount prefix
                val prefix = if (transaction.type == "income") "+" else "-"
                tvAmount.text = "$prefix${transaction.getFormattedAmount()}"

                // Set category chip background color
                val chipColor = when (transaction.category.lowercase()) {
                    "food", "restaurant", "groceries" -> Color.parseColor("#FFF3CD")
                    "transport", "fuel", "car" -> Color.parseColor("#D1ECF1")
                    "entertainment", "movies", "games" -> Color.parseColor("#F8D7DA")
                    "utilities", "electricity", "water" -> Color.parseColor("#D4EDDA")
                    "shopping", "clothes", "electronics" -> Color.parseColor("#E2E3E5")
                    else -> Color.parseColor("#F8F9FA")
                }
                chipCategory.setBackgroundColor(chipColor)

                root.setOnClickListener {
                    onTransactionClick(transaction)
                }
            }
        }
    }

    private class TransactionDiffCallback : DiffUtil.ItemCallback<Transaction>() {
        override fun areItemsTheSame(oldItem: Transaction, newItem: Transaction): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: Transaction, newItem: Transaction): Boolean {
            return oldItem == newItem
        }
    }
}