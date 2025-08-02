package com.hiddenglam.financialdashboard.ui.analytics

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.hiddenglam.financialdashboard.databinding.FragmentAnalyticsBinding
import com.hiddenglam.financialdashboard.viewmodel.MainViewModel

class AnalyticsFragment : Fragment() {

    private var _binding: FragmentAnalyticsBinding? = null
    private val binding get() = _binding!!

    private lateinit var mainViewModel: MainViewModel

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAnalyticsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        mainViewModel = ViewModelProvider(requireActivity())[MainViewModel::class.java]

        setupUI()
        observeViewModel()
    }

    private fun setupUI() {
        // This fragment will contain detailed analytics
        // For now, show a placeholder message
        binding.tvPlaceholder.text = "Analytics features coming soon!\n\n" +
                "This section will include:\n" +
                "• Category breakdown charts\n" +
                "• Daily spending patterns\n" +
                "• Monthly comparisons\n" +
                "• Spending trends\n" +
                "• Budget tracking"
    }

    private fun observeViewModel() {
        mainViewModel.financialSummary.observe(viewLifecycleOwner) { _ ->
            // Update analytics based on financial summary
            // Implementation will be added later
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}