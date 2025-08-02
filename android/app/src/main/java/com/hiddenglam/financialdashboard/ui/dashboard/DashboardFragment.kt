package com.hiddenglam.financialdashboard.ui.dashboard

import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.github.mikephil.charting.charts.LineChart
import com.github.mikephil.charting.charts.PieChart
import com.github.mikephil.charting.components.XAxis
import com.github.mikephil.charting.data.*
import com.github.mikephil.charting.formatter.ValueFormatter
import com.github.mikephil.charting.utils.ColorTemplate
import com.hiddenglam.financialdashboard.R
import com.hiddenglam.financialdashboard.databinding.FragmentDashboardBinding
import com.hiddenglam.financialdashboard.viewmodel.MainViewModel
import java.text.NumberFormat
import java.util.*

class DashboardFragment : Fragment() {

    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!

    private lateinit var mainViewModel: MainViewModel

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        mainViewModel = ViewModelProvider(requireActivity())[MainViewModel::class.java]

        setupUI()
        observeViewModel()
    }

    private fun setupUI() {
        // Setup charts
        setupLineChart()
        setupPieChart()

        // Setup Gemini insights button
        binding.btnGetInsights.setOnClickListener {
            val categoryExpenses = mainViewModel.financialSummary.value?.categoryExpenses
            if (!categoryExpenses.isNullOrEmpty()) {
                mainViewModel.getGeminiInsights(categoryExpenses)
            } else {
                Toast.makeText(context, "No expense data available for insights", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun observeViewModel() {
        mainViewModel.financialSummary.observe(viewLifecycleOwner) { summary ->
            summary?.let {
                updateSummaryCards(it)
                updateCharts(it)
            }
        }

        mainViewModel.geminiInsights.observe(viewLifecycleOwner) { insights ->
            if (!insights.isNullOrEmpty()) {
                binding.tvInsights.text = insights
                binding.cardInsights.visibility = View.VISIBLE
            }
        }

        mainViewModel.error.observe(viewLifecycleOwner) { error ->
            if (!error.isNullOrEmpty()) {
                Toast.makeText(context, error, Toast.LENGTH_LONG).show()
                mainViewModel.clearError()
            }
        }

        mainViewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        }

        mainViewModel.lastRefreshed.observe(viewLifecycleOwner) { timestamp ->
            if (timestamp > 0) {
                val date = Date(timestamp)
                binding.tvLastRefreshed.text = "Last refreshed: ${android.text.format.DateFormat.getTimeFormat(context).format(date)}"
                binding.tvLastRefreshed.visibility = View.VISIBLE
            }
        }
    }

    private fun updateSummaryCards(summary: com.hiddenglam.financialdashboard.data.model.FinancialSummary) {
        // Update summary cards
        binding.tvTotalIncome.text = summary.getFormattedTotalIncome()
        binding.tvTotalExpenses.text = summary.getFormattedTotalExpenses()
        binding.tvNetBalance.text = summary.getFormattedNetBalance()
        
        // Update net balance color based on positive/negative
        val balanceColor = if (summary.isPositiveBalance()) {
            Color.parseColor("#10b981") // Green
        } else {
            Color.parseColor("#ef4444") // Red
        }
        binding.tvNetBalance.setTextColor(balanceColor)
    }

    private fun updateCharts(summary: com.hiddenglam.financialdashboard.data.model.FinancialSummary) {
        updateLineChart(summary.monthlyData)
        updatePieChart(summary.categoryExpenses)
    }

    private fun setupLineChart() {
        binding.lineChart.apply {
            description.isEnabled = false
            setTouchEnabled(true)
            isDragEnabled = true
            setScaleEnabled(true)
            setPinchZoom(false)
            
            xAxis.apply {
                position = XAxis.XAxisPosition.BOTTOM
                setDrawGridLines(false)
                granularity = 1f
            }
            
            axisLeft.apply {
                setDrawGridLines(true)
                valueFormatter = CurrencyFormatter()
            }
            
            axisRight.isEnabled = false
            legend.isEnabled = true
        }
    }

    private fun setupPieChart() {
        binding.pieChart.apply {
            description.isEnabled = false
            setUsePercentValues(true)
            setDrawHoleEnabled(true)
            setHoleColor(Color.WHITE)
            setTransparentCircleColor(Color.WHITE)
            setTransparentCircleAlpha(110)
            holeRadius = 58f
            transparentCircleRadius = 61f
            setDrawCenterText(true)
            centerText = "Expense\nBreakdown"
            isRotationEnabled = true
            isHighlightPerTapEnabled = true
        }
    }

    private fun updateLineChart(monthlyData: Map<String, Pair<Double, Double>>) {
        val incomeEntries = mutableListOf<Entry>()
        val expenseEntries = mutableListOf<Entry>()
        val labels = mutableListOf<String>()

        monthlyData.entries.sortedBy { it.key }.forEachIndexed { index, entry ->
            labels.add(entry.key)
            incomeEntries.add(Entry(index.toFloat(), entry.value.first.toFloat()))
            expenseEntries.add(Entry(index.toFloat(), entry.value.second.toFloat()))
        }

        val incomeDataSet = LineDataSet(incomeEntries, "Income").apply {
            color = Color.parseColor("#10b981")
            setCircleColor(Color.parseColor("#10b981"))
            lineWidth = 2f
            circleRadius = 4f
            setDrawCircleHole(false)
            valueTextSize = 9f
            setDrawFilled(false)
        }

        val expenseDataSet = LineDataSet(expenseEntries, "Expenses").apply {
            color = Color.parseColor("#ef4444")
            setCircleColor(Color.parseColor("#ef4444"))
            lineWidth = 2f
            circleRadius = 4f
            setDrawCircleHole(false)
            valueTextSize = 9f
            setDrawFilled(false)
        }

        val lineData = LineData(incomeDataSet, expenseDataSet)
        binding.lineChart.data = lineData
        binding.lineChart.invalidate()
    }

    private fun updatePieChart(categoryExpenses: Map<String, Double>) {
        if (categoryExpenses.isEmpty()) {
            binding.pieChart.clear()
            return
        }

        val entries = mutableListOf<PieEntry>()
        categoryExpenses.entries.sortedByDescending { it.value }.forEach { entry ->
            entries.add(PieEntry(entry.value.toFloat(), entry.key))
        }

        val dataSet = PieDataSet(entries, "Categories").apply {
            setDrawIcons(false)
            sliceSpace = 3f
            iconsOffset = com.github.mikephil.charting.utils.MPPointF(0f, 40f)
            selectionShift = 5f
            colors = ColorTemplate.MATERIAL_COLORS.toList()
        }

        val data = PieData(dataSet).apply {
            setValueFormatter(CurrencyFormatter())
            setValueTextSize(11f)
            setValueTextColor(Color.WHITE)
        }

        binding.pieChart.data = data
        binding.pieChart.highlightValues(null)
        binding.pieChart.invalidate()
    }

    private class CurrencyFormatter : ValueFormatter() {
        private val format = NumberFormat.getCurrencyInstance(Locale("id", "ID")).apply {
            currency = Currency.getInstance("IDR")
        }

        override fun getFormattedValue(value: Float): String {
            return format.format(value.toDouble())
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}