import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { ChevronDown, ChevronUp, ArrowUpCircle, ArrowDownCircle, DollarSign, ListFilter, Search, CalendarDays, Tag, Info, RefreshCw, LayoutList, BarChart3, TrendingUp, TrendingDown, Trash2, Sparkles, Loader2, XCircle, Moon, Sun } from 'lucide-react';
import { useDarkMode } from './hooks/useDarkMode';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserConfigProvider, useUserConfig } from './contexts/UserConfigContext';
import LoginScreen from './components/LoginScreen';
import UserProfile from './components/UserProfile';
import Logo from './components/Logo';
import DonationButton from './components/DonationButton';

// Constants
// const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
// const GOOGLE_SHEET_GViz_BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?`;
// const IS_LOCALHOST = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
// const BACKEND_API_URL = IS_LOCALHOST ? import.meta.env.VITE_BACKEND_API_URL_LOCALHOST : import.meta.env.VITE_BACKEND_API_URL_PRODUCTION;

interface AppTransaction {
  id: string; 
  date: string; 
  description: string;
  category: string;
  amount: number; 
  type: "income" | "expense";
  rowIndex: number; 
  "User ID"?: string; 
  Timestamp?: string; 
  parsedDate?: Date | null;
  Income?: number; 
  Expense?: number; 
}

interface DailyData {
    date: string; 
    income: number;
    expense: number;
    day: string; // For XAxis display
}
interface MonthlyDailyBreakdown {
    [monthYearKey: string]: {
        displayName: string;
        dailyEntries: DailyData[]; 
    }
}


async function fetchAndParseSheetData(sheetId: string | null, backendApiUrl: string | null): Promise<{ data: AppTransaction[], error: string | null }> {
    try {
        if (!sheetId) {
            return { data: [], error: "Google Sheet ID not configured. Please set up your configuration in Settings." };
        }

        if (!backendApiUrl) {
            return { data: [], error: "Backend API URL not configured. Please set up your configuration in Settings." };
        }

        console.log("Fetching transactions from Google Sheets via backend API...");
        
        // Use backend API endpoint to fetch spreadsheet data
        const apiUrl = `${backendApiUrl}/spreadsheet/${sheetId}/data?sheet=Sheet1`;
        console.log("API URL:", apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || `Backend API responded with status: ${response.status} ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log("Backend API response:", responseData);
        
        if (!responseData.success) {
            throw new Error(responseData.message || responseData.error || "Backend API returned unsuccessful response");
        }

        const rawData = responseData.data;
        console.log("Raw data from API:", rawData);
        
        if (!rawData) {
            return { data: [], error: null };
        }

        // Handle different possible data formats
        let rows: any[][] = [];
        
        if (Array.isArray(rawData)) {
            // If rawData is already an array of arrays (rows)
            if (rawData.length > 0 && Array.isArray(rawData[0])) {
                rows = rawData;
            } 
            // If rawData is an array of objects, convert to array of arrays
            else if (rawData.length > 0 && typeof rawData[0] === 'object') {
                // Extract headers from first object
                const headers = Object.keys(rawData[0]);
                rows = [headers, ...rawData.map(obj => headers.map(header => obj[header]))];
            }
            // If rawData is a flat array, treat as single row
            else {
                rows = [rawData];
            }
        } 
        // If rawData is an object with values property (Google Sheets API format)
        else if (rawData.values && Array.isArray(rawData.values)) {
            rows = rawData.values;
        }
        // If rawData is a single object, convert to array format
        else if (typeof rawData === 'object') {
            const headers = Object.keys(rawData);
            const values = Object.values(rawData);
            rows = [headers, values];
        }
        else {
            throw new Error("Unexpected data format from backend API");
        }

        console.log("Processed rows:", rows);

        if (rows.length === 0) {
            return { data: [], error: null };
        }

        // Assume first row contains headers
        const headers = rows[0];
        const dataRows = rows.slice(1);

        console.log("Headers:", headers);
        console.log("Data rows:", dataRows);

        const transactions: AppTransaction[] = dataRows.map((row: any, index: number) => {
            const transaction: Partial<AppTransaction> & { [key: string]: any } = { 
                id: `tr-${index}`, 
                rowIndex: index + 2 // +2 because we skip header row and arrays are 0-indexed
            };

            // Ensure row is an array
            const rowArray = Array.isArray(row) ? row : Object.values(row);

            rowArray.forEach((cellValue: any, cellIndex: number) => {
                const header = headers[cellIndex] || '';
                const lowerCaseHeader = header.toLowerCase();

                if (lowerCaseHeader === 'date') { 
                    if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                        try {
                            const dateObj = new Date(cellValue);
                            if (dateObj && !isNaN(dateObj.getTime())) {
                                transaction.parsedDate = dateObj;
                                transaction.date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                            } else { 
                                transaction.date = String(cellValue); 
                                transaction.parsedDate = null; 
                            }
                        } catch (e) { 
                            transaction.date = String(cellValue); 
                            transaction.parsedDate = null; 
                        }
                    } else { 
                        transaction.date = 'N/A'; 
                        transaction.parsedDate = null; 
                    }
                } else if (lowerCaseHeader === 'amount') {
                    if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                        const numericAmount = parseFloat(String(cellValue));
                        if (!isNaN(numericAmount)) {
                            transaction.amount = Math.abs(numericAmount);
                            transaction.type = numericAmount >= 0 ? 'income' : 'expense';
                            transaction.Income = numericAmount >= 0 ? numericAmount : 0;
                            transaction.Expense = numericAmount < 0 ? Math.abs(numericAmount) : 0;
                        } else { 
                            transaction.amount = 0; 
                            transaction.type = 'expense'; 
                            transaction.Income = 0; 
                            transaction.Expense = 0; 
                        }
                    } else { 
                        transaction.amount = 0; 
                        transaction.type = 'expense'; 
                        transaction.Income = 0; 
                        transaction.Expense = 0; 
                    }
                } else {
                    let key = header;
                    if (lowerCaseHeader === 'user id' || lowerCaseHeader === 'userid') key = 'User ID';
                    else if (lowerCaseHeader === 'timestamp') key = 'Timestamp';
                    else if (lowerCaseHeader === 'description') key = 'description';
                    else if (lowerCaseHeader === 'category') key = 'category';
                    transaction[key] = cellValue !== null && cellValue !== undefined ? cellValue : '';
                }
            });

            // Set defaults for missing fields
            if (!transaction.category || String(transaction.category).trim() === "") transaction.category = 'Uncategorized';
            if (transaction.Income === undefined) transaction.Income = 0;
            if (transaction.Expense === undefined) transaction.Expense = 0;
            if (transaction.amount === undefined) transaction.amount = 0;
            if (transaction.type === undefined) transaction.type = transaction.amount >= 0 ? (transaction.amount > 0 ? 'income' : 'expense') : 'expense';
            if (transaction['User ID'] === undefined) transaction['User ID'] = ''; 
            if (transaction.Timestamp === undefined) transaction.Timestamp = ''; 
            
            return transaction as AppTransaction;
        }).filter((t: AppTransaction) => t.parsedDate); // Only include transactions with valid dates

        console.log("Final processed transactions:", transactions);
        return { data: transactions, error: null };
    } catch (error) {
        console.error("Error fetching or parsing Google Sheet data via backend:", error);
        return { data: [], error: error instanceof Error ? error.message : "Unknown error fetching sheet data." };
    }
}

const formatCurrency = (value: number | undefined | null): string => { 
    if (typeof value !== 'number' || isNaN(value)) {
        return (0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};
const PIE_CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC0CB', '#A52A2A', '#FFD700', '#D2691E'];
const SummaryCard = ({ title, value, icon, color, details }: { title: string, value: number, icon: React.ReactElement, color: string, details?: string }) => { 
    return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
        <div>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
                {React.cloneElement(icon, { className: `w-8 h-8 ${color}` })}
            </div>
            <p className={`text-3xl font-bold ${color}`}>{formatCurrency(value)}</p>
        </div>
        {details && <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">{details}</p>}
    </div>
);};
// @ts-ignore
const renderActiveShape = (props: any) => { 
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';
  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold text-lg">
        {payload.name}
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill}/>
      <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 6} outerRadius={outerRadius + 10} fill={fill}/>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="var(--chart-text)" className="text-sm">{`${formatCurrency(value)}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="var(--chart-text-secondary)" className="text-xs">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmButtonText = "Delete" }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string, confirmButtonText?: string }) => { 
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out">
            <div className="bg-white dark:bg-slate-800 p-7 rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-in-out scale-95 group-hover:scale-100">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">{title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-8">{message}</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 focus:ring-4 focus:outline-none focus:ring-slate-200 dark:focus:ring-slate-700 transition-colors">Batal</button>
                    <button onClick={onConfirm} className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg focus:ring-4 focus:outline-none transition-colors ${confirmButtonText === "Hapus Permanen" ? "bg-red-600 hover:bg-red-700 focus:ring-red-300" : (confirmButtonText === "Simpan Perubahan" ? "bg-sky-600 hover:bg-sky-700 focus:ring-sky-300" : "bg-amber-500 hover:bg-amber-600 focus:ring-amber-300")}`}>{confirmButtonText}</button>
                </div>
            </div>
        </div>
    );
};

const renderMarkdownToReact = (markdownText: string): React.ReactNode => {
    const lines = markdownText.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(<ul key={`ul-${elements.length}-${Math.random()}`} className="list-disc list-inside pl-5 mb-2 text-slate-700 dark:text-slate-300">{listItems}</ul>);
            listItems = [];
        }
    };

    lines.forEach((line, index) => {
        const uniqueKeyPrefix = `md-${index}-${Math.random()}`; 
        line = line.trim();
        if (line.startsWith('## ')) {
            flushList();
            elements.push(<h3 key={`${uniqueKeyPrefix}-h3`} className="text-lg font-semibold mt-3 mb-1 text-slate-800 dark:text-slate-200">{line.substring(3)}</h3>);
        } else if (line.startsWith('# ')) {
            flushList();
            elements.push(<h2 key={`${uniqueKeyPrefix}-h2`} className="text-xl font-semibold mt-4 mb-2 text-slate-800 dark:text-slate-200">{line.substring(2)}</h2>);
        } else if (line.startsWith('* ') || line.startsWith('- ')) {
            const listItemText = line.substring(2);
            const parts = listItemText.split(/(\*\*.*?\*\*|\*.*?\*)/g).filter(part => part);
            listItems.push(
                <li key={`${uniqueKeyPrefix}-li`} className="text-slate-700 dark:text-slate-300">
                    {parts.map((part, partIndex) => {
                        const partKey = `${uniqueKeyPrefix}-li-part-${partIndex}`;
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={partKey} className="text-slate-800 dark:text-slate-200">{part.substring(2, part.length - 2)}</strong>;
                        }
                        if (part.startsWith('*') && part.endsWith('*')) {
                            return <em key={partKey} className="text-slate-700 dark:text-slate-300">{part.substring(1, part.length - 1)}</em>;
                        }
                        return <React.Fragment key={partKey}>{part}</React.Fragment>;
                    })}
                </li>
            );
        } else if (line === '') {
            flushList();
        } else {
            flushList();
            const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g).filter(part => part);
            elements.push(
                <p key={`${uniqueKeyPrefix}-p`} className="mb-2 text-slate-700 dark:text-slate-300">
                     {parts.map((part, partIndex) => {
                        const partKey = `${uniqueKeyPrefix}-p-part-${partIndex}`;
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={partKey} className="text-slate-800 dark:text-slate-200">{part.substring(2, part.length - 2)}</strong>;
                        }
                        if (part.startsWith('*') && part.endsWith('*')) {
                            return <em key={partKey} className="text-slate-700 dark:text-slate-300">{part.substring(1, part.length - 1)}</em>;
                        }
                        return <React.Fragment key={partKey}>{part}</React.Fragment>;
                    })}
                </p>
            );
        }
    });
    flushList(); 
    return <React.Fragment>{elements}</React.Fragment>;
};

// Custom label for Pie Chart slices - improved for dark mode and always visible
const RADIAN = Math.PI / 180;
// @ts-ignore
const renderImprovedPieLabel = ({ cx, cy, midAngle, outerRadius, percent, name, value }: any) => {
  // Show labels for slices larger than 2%
  if (percent * 100 < 2) return null;

  const radius = outerRadius + 40; // Position labels further outside
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
//   const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Line connection points
  const lineStartRadius = outerRadius + 10;
  const lineStartX = cx + lineStartRadius * Math.cos(-midAngle * RADIAN);
  const lineStartY = cy + lineStartRadius * Math.sin(-midAngle * RADIAN);
  
  const lineMidRadius = outerRadius + 25;
  const lineMidX = cx + lineMidRadius * Math.cos(-midAngle * RADIAN);
  const lineMidY = cy + lineMidRadius * Math.sin(-midAngle * RADIAN);

  // Determine text anchor and line direction based on position
  const isRightSide = x > cx;
  const textAnchor = isRightSide ? 'start' : 'end';
  const lineEndX = isRightSide ? lineMidX + 15 : lineMidX - 15;

  return (
    <g>
      {/* Connection line */}
      <path
        d={`M${lineStartX},${lineStartY}L${lineMidX},${lineMidY}L${lineEndX},${lineMidY}`}
        stroke="#64748b"
        strokeWidth={1}
        fill="none"
      />
      
      {/* Category name */}
      <text
        x={lineEndX + (isRightSide ? 5 : -5)}
        y={lineMidY - 8}
        textAnchor={textAnchor}
        dominantBaseline="central"
        className="fill-slate-700 dark:fill-slate-300 text-sm font-medium"
        fontSize="13px"
      >
        {name}: {(percent * 100).toFixed(0)}%
      </text>
      
      {/* Percentage value */}
      <text
        x={lineEndX + (isRightSide ? 5 : -5)}
        y={lineMidY + 8}
        textAnchor={textAnchor}
        dominantBaseline="central"
        className="fill-slate-600 dark:fill-slate-400 text-xs"
        fontSize="11px"
      >
        {formatCurrency(value)}
      </text>
    </g>
  );
};

// Fallback label for inside pie slices (for very large slices)
// @ts-ignore
const renderInsidePieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent * 100 < 15) return null; // Only show inside labels for very large slices

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="11px"
      fontWeight="bold"
      className="pointer-events-none drop-shadow-sm"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Main Dashboard Component
const Dashboard = () => {
    // Dark mode hook
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    
    // User configuration hook
    const { getGoogleSheetId, getGeminiApiKey, getBackendApiUrl, config, loading: configLoading } = useUserConfig();

    const [rawData, setRawData] = useState<AppTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof AppTransaction | 'parsedDate', direction: string }>({ key: 'Timestamp', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
    const [selectedMonthKey, setSelectedMonthKey] = useState('');
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<AppTransaction | null>(null);
    
    const [notification, setNotification] = useState({ show: false, message: '', type: 'info' as 'info' | 'success' | 'error' });
    
    const [geminiInsights, setGeminiInsights] = useState<string | null>(null);
    const [isGeminiLoading, setIsGeminiLoading] = useState(false);
    const [geminiError, setGeminiError] = useState<string | null>(null);

    const [activeView, setActiveView] = useState<'category' | 'daily'>('category'); 
    const [selectedDailyDetailsDate, setSelectedDailyDetailsDate] = useState<string | null>(null);


    const ITEMS_PER_PAGE = 10;

    const showNotification = (message: string, type: 'info' | 'success' | 'error' = 'info', duration = 3000) => { 
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), duration);
    };
    const fetchData = async (isRefresh = false) => { 
        setIsLoading(true); setError(null);
        try {
            const sheetId = getGoogleSheetId();
            console.log('Fetching data with Google Sheet ID:', sheetId);
            const { data: fetchedData, error: fetchError } = await fetchAndParseSheetData(sheetId, getBackendApiUrl());
            if (fetchError) throw new Error(fetchError);
            setRawData(fetchedData); setLastRefreshed(new Date());
            if (fetchedData.length > 0) {
                const tempMonthlyCategorized = processMonthlyCategories(fetchedData); 
                const monthKeys = Object.keys(tempMonthlyCategorized).sort((a,b) => new Date(b).getTime() - new Date(a).getTime()); 
                if (monthKeys.length > 0 && (!selectedMonthKey || isRefresh)) {
                    setSelectedMonthKey(monthKeys[0]);
                    setSelectedDailyDetailsDate(null); 
                }
            }
            if(isRefresh) showNotification("Data berhasil disegarkan dari Google Sheet!", "success");
        } catch (e: any) {
            setError(`Gagal mengambil/memproses data: ${e.message}`); setRawData([]); 
            console.error("Fetch/Processing Error in App component:", e);
            showNotification(`Error menyegarkan data: ${e.message}`, "error", 5000);
        }
        setIsLoading(false);
    };
    
    const processMonthlyCategories = (dataToProcess: AppTransaction[]) => { 
        const breakdown: { [key: string]: { name: string, displayName: string, categories: { [key: string]: { name: string, income: number, expense: number } }, incomeCategories?: any[], expenseCategories?: any[] } } = {};
        dataToProcess.forEach(item => {
            if (item.parsedDate && item.category) {
                const monthYear = `${item.parsedDate.getFullYear()}-${String(item.parsedDate.getMonth() + 1).padStart(2, '0')}`;
                if (!breakdown[monthYear]) breakdown[monthYear] = { name: monthYear, displayName: new Date(monthYear + "-01").toLocaleString('id-ID', { month: 'long', year: 'numeric' }), categories: {} };
                if (!breakdown[monthYear].categories[item.category]) breakdown[monthYear].categories[item.category] = { name: item.category, income: 0, expense: 0 };
                const incomeAmount = item.Income !== undefined ? item.Income : (item.type === 'income' ? item.amount : 0);
                const expenseAmount = item.Expense !== undefined ? item.Expense : (item.type === 'expense' ? item.amount : 0);
                breakdown[monthYear].categories[item.category].income += incomeAmount;
                breakdown[monthYear].categories[item.category].expense += expenseAmount;
            }
        });
        return breakdown;
    };

    const processDailyBreakdown = (dataToProcess: AppTransaction[]): MonthlyDailyBreakdown => {
        const dailyBreakdown: MonthlyDailyBreakdown = {};
        dataToProcess.forEach(item => {
            if (item.parsedDate) {
                const monthYear = `${item.parsedDate.getFullYear()}-${String(item.parsedDate.getMonth() + 1).padStart(2, '0')}`;
                const dayOfMonth = String(item.parsedDate.getDate()).padStart(2,'0'); 
                const fullDateKey = item.date; 

                if (!dailyBreakdown[monthYear]) {
                    dailyBreakdown[monthYear] = {
                        displayName: new Date(monthYear + "-01").toLocaleString('id-ID', { month: 'long', year: 'numeric' }),
                        dailyEntries: []
                    };
                }
                
                let dayEntry = dailyBreakdown[monthYear].dailyEntries.find(d => d.date === fullDateKey);
                if (!dayEntry) {
                    dayEntry = { date: fullDateKey, income: 0, expense: 0, day: dayOfMonth };
                    dailyBreakdown[monthYear].dailyEntries.push(dayEntry);
                }
                dayEntry.income += item.Income || 0;
                dayEntry.expense += item.Expense || 0;
            }
        });

        for (const month in dailyBreakdown) {
            dailyBreakdown[month].dailyEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }
        return dailyBreakdown;
    };

    // Effect to fetch data when user configuration is ready
    useEffect(() => { 
        // Don't fetch if config is still loading
        if (configLoading) {
            console.log('User configuration still loading...');
            return;
        }
        
        const sheetId = getGoogleSheetId();
        if (sheetId) {
            console.log('User configuration ready, fetching data with sheet ID:', sheetId);
            fetchData(); 
        } else {
            console.log('No Google Sheet ID configured, showing empty state');
            setIsLoading(false);
            setRawData([]);
        }
    }, [configLoading, config?.google_sheet_id]); // Re-fetch when config loading is done or sheet ID changes

    const processedData = useMemo(() => { 
        if (!rawData || rawData.length === 0) return { totalIncome: 0, totalExpenses: 0, netBalance: 0, monthlyTrends: [], monthlyExpenseCategoriesPie: [], filteredAndSortedData: [], monthlyCategorizedBreakdown: {}, dailyBreakdown: {} };
        let totalIncome = 0, totalExpenses = 0;
        const monthlyData: { [key: string]: { name: string, income: number, expenses: number } } = {};
        const monthlyCategorizedBreakdownResult = processMonthlyCategories(rawData);
        const dailyBreakdownResult = processDailyBreakdown(rawData);

        rawData.forEach(item => {
            const incomeAmount = item.Income !== undefined ? item.Income : (item.type === 'income' ? item.amount : 0);
            const expenseAmount = item.Expense !== undefined ? item.Expense : (item.type === 'expense' ? item.amount : 0);
            totalIncome += incomeAmount; 
            totalExpenses += expenseAmount;
            if (item.parsedDate) { 
                 const monthYear = `${item.parsedDate.getFullYear()}-${String(item.parsedDate.getMonth() + 1).padStart(2, '0')}`;
                if (!monthlyData[monthYear]) monthlyData[monthYear] = { name: monthYear, income: 0, expenses: 0 };
                monthlyData[monthYear].income += incomeAmount; 
                monthlyData[monthYear].expenses += expenseAmount;
            }
        });
        
        Object.values(monthlyCategorizedBreakdownResult).forEach(monthEntry => {
            monthEntry.incomeCategories = Object.values(monthEntry.categories).filter(cat => cat.income > 0).sort((a, b) => b.income - a.income);
            monthEntry.expenseCategories = Object.values(monthEntry.categories).filter(cat => cat.expense > 0).sort((a, b) => b.expense - a.expense);
        });

        const monthlyTrends = Object.values(monthlyData).sort((a, b) => new Date(a.name + "-01").getTime() - new Date(b.name + "-01").getTime()).map(m => ({...m, name: new Date(m.name + "-01").toLocaleString('default', { month: 'short', year: 'numeric' })}));
        
        let monthlyExpenseCategoriesPieData: { name: string, value: number }[] = [];
        if (selectedMonthKey && monthlyCategorizedBreakdownResult[selectedMonthKey]?.expenseCategories) {
            monthlyExpenseCategoriesPieData = monthlyCategorizedBreakdownResult[selectedMonthKey].expenseCategories.map(cat => ({ name: cat.name, value: cat.expense })).sort((a,b) => b.value - a.value);
        }
        
        const filtered = rawData.filter(item => (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) || (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) || (item.amount && item.amount.toString().includes(searchTerm.toLowerCase())));
        const sorted = [...filtered].sort((a, b) => { 
            const valA = a[sortConfig.key as keyof AppTransaction]; 
            const valB = b[sortConfig.key as keyof AppTransaction]; 
            if (valA === null || valA === undefined) return 1; 
            if (valB === null || valB === undefined) return -1; 
            if (sortConfig.key === 'parsedDate' && valA instanceof Date && valB instanceof Date) { return sortConfig.direction === 'ascending' ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime(); }
            if (sortConfig.key === 'Timestamp' && typeof valA === 'string' && typeof valB === 'string') {
                 const dateA = new Date(valA).getTime(); const dateB = new Date(valB).getTime();
                 if (!isNaN(dateA) && !isNaN(dateB)) { return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA; }
                 return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            if (typeof valA === 'number' && typeof valB === 'number') { return sortConfig.direction === 'ascending' ? valA - valB : valB - valA; }
            if (typeof valA === 'string' && typeof valB === 'string') { return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA); }
            return 0; 
        });
        return { totalIncome, totalExpenses, netBalance: totalIncome - totalExpenses, monthlyTrends, monthlyExpenseCategoriesPie: monthlyExpenseCategoriesPieData, filteredAndSortedData: sorted, monthlyCategorizedBreakdown: monthlyCategorizedBreakdownResult, dailyBreakdown: dailyBreakdownResult };
    }, [rawData, searchTerm, sortConfig, selectedMonthKey]); 
    useEffect(() => { 
        if (!selectedMonthKey && processedData.monthlyCategorizedBreakdown && Object.keys(processedData.monthlyCategorizedBreakdown).length > 0) {
            const monthKeys = Object.keys(processedData.monthlyCategorizedBreakdown).sort((a,b) => new Date(b).getTime() - new Date(a).getTime()); 
            if (monthKeys.length > 0) setSelectedMonthKey(monthKeys[0]);
        }
    }, [processedData.monthlyCategorizedBreakdown, selectedMonthKey]);

    const { totalIncome, totalExpenses, netBalance, monthlyTrends, monthlyExpenseCategoriesPie, filteredAndSortedData, monthlyCategorizedBreakdown, dailyBreakdown } = processedData;
    const paginatedData = useMemo(() => filteredAndSortedData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filteredAndSortedData, currentPage]);
    const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE);
    const requestSort = (key: keyof AppTransaction | 'parsedDate') => { 
        let direction = 'ascending'; if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending'; setSortConfig({ key, direction }); setCurrentPage(1); };
    const getSortIcon = (key: keyof AppTransaction | 'parsedDate') => { 
        if (sortConfig.key === key) return sortConfig.direction === 'ascending' ? <ChevronUp className="w-4 h-4 inline ml-1" /> : <ChevronDown className="w-4 h-4 inline ml-1" />; return <ListFilter className="w-4 h-4 inline ml-1 opacity-50" />; };
    const handleRefresh = () => {
        fetchData(true);
        setSelectedDailyDetailsDate(null); 
    };
    
    const handleDeleteRequest = (transaction: AppTransaction) => { 
        setTransactionToDelete(transaction); 
        setIsDeleteModalOpen(true); 
    };
    
    const confirmDeleteTransactionViaBackend = async () => { 
        if (!transactionToDelete || transactionToDelete.rowIndex === undefined) {
            showNotification("Tidak dapat menghapus: Detail transaksi atau indeks baris hilang.", "error");
            setIsDeleteModalOpen(false); return;
        }
        setIsLoading(true); 
        try {
            const backendApiUrl = getBackendApiUrl();
            if (!backendApiUrl) {
                throw new Error("Backend API URL not configured. Please set up your configuration in Settings.");
            }
            const sheetId = getGoogleSheetId();
            if (!sheetId) {
                throw new Error("Google Sheet ID not configured. Please set up your configuration in Settings.");
            }
            const deleteApiUrl = `${backendApiUrl}/delete-transaction`; 
            const response = await fetch(deleteApiUrl, { 
                method: 'POST', headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ sheetId: sheetId, rowIndex: transactionToDelete.rowIndex })
            });
            const responseData = await response.json(); 
            if (!response.ok) throw new Error(responseData.message || responseData.error || `Gagal menghapus transaksi via backend: ${response.status} ${response.statusText}`);
            showNotification("Transaksi berhasil dihapus permanen via backend!", "success");
            fetchData(true); 
        } catch (e: any) {
            console.error("Delete Error (via backend):", e);
            showNotification(`Error menghapus transaksi: ${e.message}`, "error", 5000);
        }
        setIsDeleteModalOpen(false); 
        setTransactionToDelete(null); 
        setIsLoading(false); 
    };

    const handleGetSpendingInsights = async () => { 
        if (!selectedMonthKey || !monthlyCategorizedBreakdown[selectedMonthKey]) {
            setGeminiError("Silakan pilih bulan dengan data pengeluaran."); return;
        }
        const monthData = monthlyCategorizedBreakdown[selectedMonthKey];
        const expenseDetails = monthData.expenseCategories?.map(cat => `${cat.name}: ${formatCurrency(cat.expense)}`).join(', ');
        if (!monthData.expenseCategories || monthData.expenseCategories.length === 0) {
            setGeminiInsights("Tidak ada data pengeluaran untuk dianalisis pada bulan ini."); setGeminiError(null); return;
        }
        const prompt = `Anda adalah asisten keuangan yang membantu. Analisis pengeluaran bulanan berikut untuk seorang individu di Indonesia. Semua jumlah dalam Rupiah Indonesia (IDR).
        Bulan: ${monthData.displayName}
        Rincian Pengeluaran: ${expenseDetails}
        Berikan dalam Bahasa Indonesia: 1. Ringkasan singkat (1-2 kalimat) pola pengeluaran. 2. 3-5 tips hemat yang praktis dan dapat dijalankan, disesuaikan dengan pengeluaran spesifik ini dan konteks Indonesia. 3. Jika ada kategori pengeluaran yang luar biasa tinggi, harap sorot.
        Format respons Anda dengan jelas, gunakan poin-poin (bullet points) untuk tips. Jaga agar bahasa tetap ringkas dan mudah dipahami. Gunakan markdown dasar untuk format (misalnya, **tebal** untuk penekanan, *miring* jika perlu, dan # atau ## untuk judul jika relevan).`;
        setIsGeminiLoading(true); setGeminiInsights(null); setGeminiError(null);
        try {
            const apiKey = getGeminiApiKey(); 
            if (!apiKey) {
                throw new Error("Gemini API key not configured. Please set up your API key in Settings.");
            }
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData?.error?.message || `Permintaan ke Gemini API gagal dengan status: ${response.status}`); }
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text; setGeminiInsights(text);
            } else { throw new Error("Menerima respons kosong atau tidak valid dari Gemini API."); }
        } catch (e: any) {
            console.error("Error calling Gemini API:", e); setGeminiError(`Gagal mendapatkan wawasan: ${e.message}`); showNotification(`Error mendapatkan wawasan: ${e.message}`, "error", 5000);
        } finally { setIsGeminiLoading(false); }
    };

    const handleDailyChartClick = (data: any) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            const clickedDate = data.activePayload[0].payload.date; 
            setSelectedDailyDetailsDate(clickedDate);
        }
    };
    
    const dailyDetailsTransactions = useMemo(() => {
        if (!selectedDailyDetailsDate || !rawData) return [];
        return rawData.filter(t => t.date === selectedDailyDetailsDate);
    }, [selectedDailyDetailsDate, rawData]);


    const tableHeaders = ['Date', 'Description', 'Category', 'Amount', 'Type', 'Actions'];
    const headerKeysForSort: { [key: string]: keyof AppTransaction | 'parsedDate' } = { 'Date': 'parsedDate', 'Amount': 'amount', 'Description': 'description', 'Category': 'category', 'Type':'type' };
    
    const availableMonthsForCategoryView = Object.values(monthlyCategorizedBreakdown).sort((a, b) => new Date(b.name).getTime() - new Date(a.name).getTime()).map(month => ({ value: month.name, label: month.displayName }));
    const currentMonthIncomeCategories = monthlyCategorizedBreakdown[selectedMonthKey]?.incomeCategories || [];
    const currentMonthExpenseCategories = monthlyCategorizedBreakdown[selectedMonthKey]?.expenseCategories || [];
    const currentMonthDailyChartData = dailyBreakdown[selectedMonthKey]?.dailyEntries || [];


    if (isLoading && rawData.length === 0) { 
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 sm:p-6 md:p-8 font-sans">
                {notification.show && <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-md text-white z-[100] ${notification.type === 'success' ? 'bg-emerald-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-sky-500'}`}>{notification.message}</div>}
                
                <header className="mb-6 flex flex-col sm:flex-row justify-between items-center">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Logo onClick={handleRefresh} loading={isLoading} />
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-200">Dasbor Keuangan</h1>
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Data dari Google Sheet (via Backend API dengan Service Account).</p>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                            <DonationButton variant="secondary" size="sm" />
                            <button 
                                onClick={toggleDarkMode}
                                className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                            <button onClick={handleRefresh} className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center gap-2 shadow-md disabled:opacity-70" disabled={isLoading}>
                                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /> {isLoading ? 'Menyegarkan...' : 'Segarkan Data'}
                            </button>
                            <UserProfile />
                        </div>
                        {lastRefreshed && !isLoading && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Terakhir disegarkan: {lastRefreshed.toLocaleTimeString('id-ID')}</p>}
                    </div>
                </header>
                
                <div className="flex flex-col justify-center items-center h-[70vh]">
                    <RefreshCw size={48} className="text-sky-500 mb-4 animate-spin" />
                    <p className="text-xl text-slate-700 dark:text-slate-200">Memuat Data Keuangan...</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Mengambil dari Google Sheet...</p>
                </div>
            </div>
        ); 
    }
    
    if (error && rawData.length === 0) { 
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 sm:p-6 md:p-8 font-sans">
                {notification.show && <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-md text-white z-[100] ${notification.type === 'success' ? 'bg-emerald-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-sky-500'}`}>{notification.message}</div>}
                
                <header className="mb-6 flex flex-col sm:flex-row justify-between items-center">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Logo onClick={handleRefresh} loading={isLoading} />
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-200">Dasbor Keuangan</h1>
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Data dari Google Sheet (via Backend API dengan Service Account).</p>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                            <DonationButton variant="secondary" size="sm" />
                            <button 
                                onClick={toggleDarkMode}
                                className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                            <button onClick={handleRefresh} className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center gap-2 shadow-md disabled:opacity-70" disabled={isLoading}>
                                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /> {isLoading ? 'Menyegarkan...' : 'Segarkan Data'}
                            </button>
                            <UserProfile />
                        </div>
                        {lastRefreshed && !isLoading && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Terakhir disegarkan: {lastRefreshed.toLocaleTimeString('id-ID')}</p>}
                    </div>
                </header>
                
                <div className="flex flex-col justify-center items-center h-[70vh] bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-center">
                    <Info size={48} className="text-red-500 mb-4" />
                    <h2 className="text-2xl font-semibold text-red-700 dark:text-red-200 mb-2">Gagal Memuat Data</h2>
                    <p className="text-red-600 dark:text-red-300 mb-6 max-w-md">{error}</p>
                    <button onClick={() => fetchData(true)} className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center gap-2 mb-4">
                        <RefreshCw size={18} /> Coba Lagi
                    </button>
                    <div className="text-xs text-slate-500 dark:text-slate-400 max-w-lg">
                        <p className="mb-2">💡 <strong>Tip:</strong> Jika ini masalah dengan Google Sheet ID, gunakan tombol Settings di atas untuk mengonfigurasi sheet yang benar.</p>
                        <p>Pastikan Google Sheet sudah dibagikan dengan service account email dan memiliki format header yang benar (Date, Description, Category, Amount).</p>
                    </div>
                </div>
            </div>
        ); 
    }
    
    if (!isLoading && rawData.length === 0 && !error) { 
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 sm:p-6 md:p-8 font-sans">
                {notification.show && <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-md text-white z-[100] ${notification.type === 'success' ? 'bg-emerald-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-sky-500'}`}>{notification.message}</div>}
                
                <header className="mb-6 flex flex-col sm:flex-row justify-between items-center">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Logo onClick={handleRefresh} loading={isLoading} />
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-200">Dasbor Keuangan</h1>
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Data dari Google Sheet (via Backend API dengan Service Account).</p>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                            <DonationButton variant="secondary" size="sm" />
                            <button 
                                onClick={toggleDarkMode}
                                className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                            <button onClick={handleRefresh} className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center gap-2 shadow-md disabled:opacity-70" disabled={isLoading}>
                                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /> {isLoading ? 'Menyegarkan...' : 'Segarkan Data'}
                            </button>
                            <UserProfile />
                        </div>
                        {lastRefreshed && !isLoading && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Terakhir disegarkan: {lastRefreshed.toLocaleTimeString('id-ID')}</p>}
                    </div>
                </header>
                
                <div className="flex flex-col justify-center items-center h-[70vh] bg-slate-50 dark:bg-slate-800 rounded-xl p-6 text-center">
                    <Info size={48} className="text-slate-500 mb-4" />
                    <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Data Tidak Tersedia</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">Google Sheet mungkin kosong, atau tidak ada baris data valid yang dapat diproses.</p>
                    <button onClick={() => fetchData(true)} className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center gap-2 mb-4">
                        <RefreshCw size={18} /> Segarkan Data
                    </button>
                    <div className="text-sm text-slate-500 dark:text-slate-400 max-w-lg space-y-2">
                        <p className="font-medium">💡 Kemungkinan penyebab:</p>
                        <ul className="list-disc list-inside text-left space-y-1">
                            <li>Google Sheet kosong atau tidak memiliki data</li>
                            <li>Google Sheet ID salah atau tidak dapat diakses</li>
                            <li>Sheet belum dibagikan dengan service account email</li>
                            <li>Format header kolom tidak sesuai (harus ada: Date, Description, Category, Amount)</li>
                            <li>Backend API tidak dapat mengakses Google Sheets</li>
                        </ul>
                        <p className="mt-4">
                            <strong>Gunakan tombol Settings</strong> di atas untuk mengonfigurasi Google Sheet ID dan pastikan sheet sudah dibagikan dengan service account.
                        </p>
                    </div>
                </div>
            </div>
        ); 
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 sm:p-6 md:p-8 font-sans">
            <style>{`
                :root {
                    --tooltip-bg: #ffffff;
                    --tooltip-border: #e2e8f0;
                    --tooltip-text: #334155;
                    --legend-text: #64748b;
                    --chart-text: #334155;
                    --chart-text-secondary: #64748b;
                }
                .dark {
                    --tooltip-bg: #1e293b;
                    --tooltip-border: #475569;
                    --tooltip-text: #e2e8f0;
                    --legend-text: #cbd5e1;
                    --chart-text: #e2e8f0;
                    --chart-text-secondary: #cbd5e1;
                }
                
                /* Ensure Recharts tooltips use proper colors */
                .recharts-tooltip-wrapper .recharts-default-tooltip {
                    background-color: var(--tooltip-bg) !important;
                    border: 1px solid var(--tooltip-border) !important;
                    border-radius: 8px !important;
                    color: var(--tooltip-text) !important;
                }
                
                .recharts-tooltip-item {
                    color: var(--tooltip-text) !important;
                }
                
                .recharts-tooltip-label {
                    color: var(--tooltip-text) !important;
                }
                
                /* Fix legend text colors */
                .recharts-legend-item-text {
                    color: var(--legend-text) !important;
                }
                
                /* Fix axis text colors */
                .recharts-cartesian-axis-tick-value {
                    fill: var(--chart-text-secondary) !important;
                }
                
                .recharts-label {
                    fill: var(--chart-text-secondary) !important;
                }
            `}</style>
            {notification.show && <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-md text-white z-[100] ${notification.type === 'success' ? 'bg-emerald-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-sky-500'}`}>{notification.message}</div>}
            <ConfirmationModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={confirmDeleteTransactionViaBackend} 
                title="Konfirmasi Penghapusan Permanen" 
                message="Apakah Anda yakin ingin menghapus transaksi ini secara permanen dari Google Sheet melalui API backend? Tindakan ini tidak dapat dibatalkan."
                confirmButtonText="Hapus Permanen"
            />
            
            <header className="mb-6 flex flex-col sm:flex-row justify-between items-center">
                <div className="flex items-center gap-3 sm:gap-4">
                    <Logo onClick={handleRefresh} loading={isLoading} />
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-200">Dasbor Keuangan</h1>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Data dari Google Sheet (via Backend API dengan Service Account).</p>
                    </div>
                </div>
                <div className="mt-4 sm:mt-0 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                        <DonationButton variant="secondary" size="sm" />
                        <button 
                            onClick={toggleDarkMode}
                            className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button onClick={handleRefresh} className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center gap-2 shadow-md disabled:opacity-70" disabled={isLoading}><RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /> {isLoading ? 'Menyegarkan...' : 'Segarkan Data'}</button>
                        <UserProfile />
                    </div>
                    {lastRefreshed && !isLoading && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Terakhir disegarkan: {lastRefreshed.toLocaleTimeString('id-ID')}</p>}
                </div>
            </header>
            {error && rawData.length > 0 && <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200 rounded-md text-sm"><strong>Peringatan saat memuat data:</strong> {error} Data yang ditampilkan mungkin tidak lengkap atau usang.</div>}

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <SummaryCard title="Total Pemasukan" value={totalIncome} icon={<ArrowUpCircle />} color="text-emerald-500" details="Semua pemasukan tercatat." />
                <SummaryCard title="Total Pengeluaran" value={totalExpenses} icon={<ArrowDownCircle />} color="text-red-500" details="Semua pengeluaran tercatat." />
                <SummaryCard title="Saldo Bersih" value={netBalance} icon={<DollarSign />} color={netBalance >= 0 ? "text-sky-500" : "text-amber-500"} details="Selisih antara pemasukan dan pengeluaran." />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-1">Tren Bulanan</h2><p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Pemasukan vs. Pengeluaran Seiring Waktu</p>
                    {monthlyTrends.length > 0 ? <ResponsiveContainer width="100%" height={400}><LineChart data={monthlyTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis dataKey="name" tick={{ fill: 'var(--chart-text-secondary)', fontSize: 12 }} /><YAxis tickFormatter={(value: any) => formatCurrency(Number(value))} tick={{ fill: 'var(--chart-text-secondary)', fontSize: 12 }} /><Tooltip formatter={(value) => formatCurrency(Number(value))} labelStyle={{ color: 'var(--tooltip-text)' }} itemStyle={{ color: 'var(--tooltip-text)' }} contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)', borderRadius: '8px', color: 'var(--tooltip-text)' }} /><Legend wrapperStyle={{ paddingTop: '20px', color: 'var(--legend-text)' }} /><Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Pemasukan" /><Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Pengeluaran" /></LineChart></ResponsiveContainer> : <p className="text-slate-500 dark:text-slate-400 text-center py-10">Data tidak cukup untuk tren bulanan.</p>}
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                     <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-1">Rincian Pengeluaran {selectedMonthKey && monthlyCategorizedBreakdown[selectedMonthKey] ? `Bulan ${monthlyCategorizedBreakdown[selectedMonthKey]?.displayName || ''}` : 'Keseluruhan'}</h2>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Distribusi berdasarkan Kategori</p>
                    {monthlyExpenseCategoriesPie.length > 0 ? 
                        <ResponsiveContainer width="100%" height={500}>
                            <PieChart margin={{ top: 20, right: 120, bottom: 20, left: 120 }}>
                                <Pie 
                                    dataKey="value" 
                                    data={monthlyExpenseCategoriesPie} 
                                    cx="50%" 
                                    cy="50%" 
                                    labelLine={true} 
                                    outerRadius={80} 
                                    fill="#ef4444" 
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {monthlyExpenseCategoriesPie.map((_entry, index) => <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />)}
                                </Pie>
                                <Tooltip 
                                    formatter={(value) => formatCurrency(value as number)} 
                                    contentStyle={{
                                        backgroundColor: 'var(--tooltip-bg)',
                                        border: '1px solid var(--tooltip-border)',
                                        borderRadius: '8px',
                                        color: 'var(--tooltip-text)'
                                    }}
                                    labelStyle={{ color: 'var(--tooltip-text)' }}
                                    itemStyle={{ color: 'var(--tooltip-text)' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer> 
                        : <p className="text-slate-500 dark:text-slate-400 text-center py-10">Tidak ada data pengeluaran untuk bulan yang dipilih.</p>
                    }
                </div>
            </section>

            <div className="mb-6 flex items-center border-b border-slate-300 dark:border-slate-700">
                <button onClick={() => {setActiveView('category'); setSelectedDailyDetailsDate(null);}} className={`px-4 py-3 text-sm font-medium transition-colors ${activeView === 'category' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>Rincian Kategori</button>
                <button onClick={() => {setActiveView('daily'); setSelectedDailyDetailsDate(null);}} className={`px-4 py-3 text-sm font-medium transition-colors ${activeView === 'daily' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>Rincian Harian</button>
            </div>
            
            {activeView === 'category' && (
                <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                        <div className="flex items-center gap-2"><BarChart3 className="w-7 h-7 text-sky-600" /><h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">Rincian Kategori Bulanan</h2></div>
                        {availableMonthsForCategoryView.length > 0 && <select value={selectedMonthKey} onChange={(e) => { setSelectedMonthKey(e.target.value); setGeminiInsights(null); setGeminiError(null); setSelectedDailyDetailsDate(null);}} className="mt-3 sm:mt-0 p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">{availableMonthsForCategoryView.map(month => <option key={month.value} value={month.value}>{month.label}</option>)}</select>}
                    </div>
                    {selectedMonthKey && monthlyCategorizedBreakdown[selectedMonthKey]?.expenseCategories && monthlyCategorizedBreakdown[selectedMonthKey]?.expenseCategories.length > 0 && (
                        <div className="my-4 p-4 border-t border-b border-slate-200 dark:border-slate-600">
                            <button onClick={handleGetSpendingInsights} disabled={isGeminiLoading} className="mb-3 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-colors flex items-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                                {isGeminiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                {isGeminiLoading ? 'Menganalisis...' : '✨ Dapatkan Wawasan Pengeluaran'}
                            </button>
                            {isGeminiLoading && <p className="text-sm text-slate-600 dark:text-slate-400 italic">Mengambil wawasan dari Gemini API...</p>}
                            {geminiError && <div className="mt-2 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 border border-red-300 dark:border-red-700 rounded-md text-sm">{geminiError}</div>}
                            {geminiInsights && (
                                <div className="mt-2 p-4 bg-sky-50 dark:bg-sky-900 border border-sky-200 dark:border-sky-700 rounded-lg">
                                    <h4 className="text-lg font-semibold text-sky-700 dark:text-sky-300 mb-3">Wawasan Keuangan dari Gemini:</h4>
                                    <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">{renderMarkdownToReact(geminiInsights)}</div>
                                </div>
                            )}
                        </div>
                    )}
                    {availableMonthsForCategoryView.length > 0 && selectedMonthKey ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-6 h-6 text-emerald-600" /><h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Pemasukan per Kategori</h3></div>
                                {currentMonthIncomeCategories.length > 0 ? <div className="overflow-x-auto border border-slate-200 dark:border-slate-600 rounded-lg"><table className="w-full text-left table-auto"><thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600"><tr><th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Kategori</th><th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider text-right">Jumlah</th></tr></thead><tbody className="divide-y divide-slate-200 dark:divide-slate-600">{currentMonthIncomeCategories.map(catItem => <tr key={`income-${catItem.name}`} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">{catItem.name}</td><td className="px-4 py-3 whitespace-nowrap text-sm text-emerald-600 text-right">{formatCurrency(catItem.income)}</td></tr>)}</tbody></table></div> : <p className="text-center text-slate-500 dark:text-slate-400 py-8 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700">Tidak ada pemasukan tercatat untuk bulan ini.</p>}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-4"><TrendingDown className="w-6 h-6 text-red-600" /><h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Pengeluaran per Kategori</h3></div>
                                {currentMonthExpenseCategories.length > 0 ? <div className="overflow-x-auto border border-slate-200 dark:border-slate-600 rounded-lg"><table className="w-full text-left table-auto"><thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600"><tr><th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Kategori</th><th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider text-right">Jumlah</th></tr></thead><tbody className="divide-y divide-slate-200 dark:divide-slate-600">{currentMonthExpenseCategories.map(catItem => <tr key={`expense-${catItem.name}`} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">{catItem.name}</td><td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 text-right">{formatCurrency(catItem.expense)}</td></tr>)}</tbody></table></div> : <p className="text-center text-slate-500 dark:text-slate-400 py-8 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700">Tidak ada pengeluaran tercatat untuk bulan ini.</p>}
                            </div>
                        </div>
                    ) : <p className="text-center text-slate-500 dark:text-slate-400 py-8">{availableMonthsForCategoryView.length === 0 ? "Tidak ada data bulanan untuk rincian kategori." : "Pilih bulan untuk melihat rincian kategori, atau data masih dimuat."}</p>}
                </section>
            )}

            {activeView === 'daily' && (
                 <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                        <div className="flex items-center gap-2"><CalendarDays className="w-7 h-7 text-sky-600" /><h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">Rincian Harian</h2></div>
                        {availableMonthsForCategoryView.length > 0 && <select value={selectedMonthKey} onChange={(e) => {setSelectedMonthKey(e.target.value); setSelectedDailyDetailsDate(null);}} className="mt-3 sm:mt-0 p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">{availableMonthsForCategoryView.map(month => <option key={month.value} value={month.value}>{month.label}</option>)}</select>}
                    </div>

                    {selectedMonthKey && currentMonthDailyChartData.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Grafik Pemasukan & Pengeluaran Harian</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={currentMonthDailyChartData} onClick={handleDailyChartClick} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="day" tick={{ fill: 'var(--chart-text-secondary)', fontSize: 12 }} label={{ value: "Hari ke-", position: 'insideBottomRight', offset: -2, fill: 'var(--chart-text-secondary)', fontSize: 12 }} />
                                    <YAxis tickFormatter={(value: any) => formatCurrency(Number(value))} tick={{ fill: 'var(--chart-text-secondary)', fontSize: 12 }} />
                                    <Tooltip formatter={(value) => formatCurrency(value as number)} labelFormatter={(label) => `Tanggal: ${selectedMonthKey}-${label}`} contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)', borderRadius: '8px', color: 'var(--tooltip-text)' }} labelStyle={{ color: 'var(--tooltip-text)' }} itemStyle={{ color: 'var(--tooltip-text)' }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px', color: 'var(--legend-text)' }} />
                                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Pemasukan" activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Pengeluaran" activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {selectedDailyDetailsDate && (
                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Detail Transaksi untuk {selectedDailyDetailsDate}</h3>
                                <button onClick={() => setSelectedDailyDetailsDate(null)} className="text-sm text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-1"><XCircle size={16}/> Tutup Detail</button>
                            </div>
                            {dailyDetailsTransactions.length > 0 ? (
                                <div className="overflow-x-auto border border-slate-200 dark:border-slate-600 rounded-lg">
                                    <table className="w-full text-left table-auto">
                                        <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                                            <tr>
                                                <th className="px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Deskripsi</th>
                                                <th className="px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Kategori</th>
                                                <th className="px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider text-right">Jumlah</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                                            {dailyDetailsTransactions.map(tx => (
                                                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                                    <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300">{tx.description}</td>
                                                    <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300">{tx.category}</td>
                                                    <td className={`px-4 py-2 text-sm text-right font-medium ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-center text-slate-500 dark:text-slate-400 py-4">Tidak ada transaksi untuk tanggal ini.</p>
                            )}
                        </div>
                    )}

                    {selectedMonthKey && currentMonthDailyChartData.length > 0 && !selectedDailyDetailsDate ? ( 
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                            <div>
                                <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-6 h-6 text-emerald-600" /><h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Pemasukan Harian (Tabel)</h3></div>
                                <div className="overflow-x-auto border border-slate-200 dark:border-slate-600 rounded-lg max-h-96">
                                    <table className="w-full text-left table-auto">
                                        <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 sticky top-0"><tr><th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Tanggal</th><th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider text-right">Jumlah</th></tr></thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-600">{currentMonthDailyChartData.filter(d => d.income > 0).map(day => <tr key={`daily-income-tbl-${day.date}`} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">{day.date}</td><td className="px-4 py-3 whitespace-nowrap text-sm text-emerald-600 text-right">{formatCurrency(day.income)}</td></tr>)}</tbody>
                                    </table>
                                    {currentMonthDailyChartData.filter(d => d.income > 0).length === 0 && <p className="text-center text-slate-500 dark:text-slate-400 p-4">Tidak ada pemasukan harian.</p>}
                                </div>
                            </div>
                             <div>
                                <div className="flex items-center gap-2 mb-4"><TrendingDown className="w-6 h-6 text-red-600" /><h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Pengeluaran Harian (Tabel)</h3></div>
                                <div className="overflow-x-auto border border-slate-200 dark:border-slate-600 rounded-lg max-h-96">
                                    <table className="w-full text-left table-auto">
                                        <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 sticky top-0"><tr><th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Tanggal</th><th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider text-right">Jumlah</th></tr></thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-600">{currentMonthDailyChartData.filter(d => d.expense > 0).map(day => <tr key={`daily-expense-tbl-${day.date}`} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">{day.date}</td><td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 text-right">{formatCurrency(day.expense)}</td></tr>)}</tbody>
                                    </table>
                                     {currentMonthDailyChartData.filter(d => d.expense > 0).length === 0 && <p className="text-center text-slate-500 dark:text-slate-400 p-4">Tidak ada pengeluaran harian.</p>}
                                </div>
                            </div>
                        </div>
                    ) : (!selectedMonthKey && <p className="text-center text-slate-500 dark:text-slate-400 py-8">{availableMonthsForCategoryView.length === 0 ? "Tidak ada data bulanan untuk rincian harian." : "Pilih bulan untuk melihat rincian harian, atau data masih dimuat."}</p>)}
                 </section>
            )}


            <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                     <div className="flex items-center gap-2"><LayoutList className="w-7 h-7 text-sky-600" /><h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">Semua Transaksi</h2></div>
                    <div className="relative mt-3 sm:mt-0"><input type="text" placeholder="Cari transaksi..." className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}/><Search className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 transform -translate-y-1/2" /></div>
                </div>
                
                {/* Card-based Transaction List */}
                <div className="space-y-3">
                    {paginatedData.map((item) => (
                        <div key={item.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between">
                                {/* Left side - Transaction Icon and Details */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {/* Transaction Type Icon */}
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                        item.type === 'income' 
                                            ? 'bg-green-100 dark:bg-green-900/30' 
                                            : 'bg-red-100 dark:bg-red-900/30'
                                    }`}>
                                        {item.type === 'income' ? (
                                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                            </svg>
                                        )}
                                    </div>
                                    
                                    {/* Transaction Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                                {item.description || 'N/A'}
                                            </h3>
                                            <span className={`text-sm font-semibold ${
                                                item.type === 'income' 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                {item.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(item.amount))}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <span>{item.date || 'N/A'}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    item.category && item.category !== 'Uncategorized' 
                                                        ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300' 
                                                        : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                                                }`}>
                                                    {item.category || 'N/A'}
                                                </span>
                                            </div>
                                            
                                            {/* Delete Button */}
                                            <button 
                                                onClick={() => handleDeleteRequest(item)} 
                                                className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors ml-2" 
                                                title="Hapus Transaksi Permanen"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {paginatedData.length === 0 && filteredAndSortedData.length > 0 && <p className="text-center text-slate-500 dark:text-slate-400 py-8">Tidak ada transaksi di halaman ini.</p>}
                {filteredAndSortedData.length === 0 && !isLoading && <p className="text-center text-slate-500 dark:text-slate-400 py-8">Tidak ada transaksi yang cocok dengan kriteria Anda atau tidak ada data.</p>}
                {totalPages > 1 && <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-600"><p className="text-sm text-slate-600 dark:text-slate-400">Halaman {currentPage} dari {totalPages} (Total: {filteredAndSortedData.length} item)</p><div className="flex gap-2"><button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Sebelumnya</button><button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Berikutnya</button></div></div>}
            </section>
            <footer className="mt-12 text-center text-sm text-slate-500 dark:text-slate-400"><p>Dasbor Keuangan &copy; {new Date().getFullYear()}. Dibuat dengan React, Tailwind CSS, dan Recharts.</p><p>Data diakses melalui Backend API dengan Google Service Account.</p></footer>
            
            {/* Floating Donation Button */}
            <DonationButton variant="floating" size="lg" />
        </div>
    );
};

// Main App Component with Authentication
const App = () => {
    return (
        <AuthProvider>
            <UserConfigProvider>
                <AppContent />
            </UserConfigProvider>
        </AuthProvider>
    );
};

// App Content Component that handles authentication state
const AppContent = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-slate-100 dark:bg-slate-900">
                <Loader2 size={48} className="text-sky-500 mb-4 animate-spin" />
                <p className="text-xl text-slate-700 dark:text-slate-200">Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <LoginScreen />;
    }

    return <Dashboard />;
};

export default App;
