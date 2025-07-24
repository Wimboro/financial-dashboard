import React, { useState, useEffect } from 'react'
import { Settings, Save, Eye, EyeOff, AlertCircle, CheckCircle, X, ExternalLink } from 'lucide-react'
import { useUserConfig } from '../contexts/UserConfigContext'

interface UserSettingsProps {
  isOpen: boolean
  onClose: () => void
}

const UserSettings: React.FC<UserSettingsProps> = ({ isOpen, onClose }) => {
  const { config, updateConfig, refreshConfig, error } = useUserConfig()
  
  const [formData, setFormData] = useState({
    google_sheet_id: '',
    gemini_api_key: '',
    backend_api_url_localhost: '',
    backend_api_url_production: ''
  })
  
  const [showApiKey, setShowApiKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (config) {
      setFormData({
        google_sheet_id: config.google_sheet_id || '',
        gemini_api_key: config.gemini_api_key || '',
        backend_api_url_localhost: config.backend_api_url_localhost || 'http://localhost:4000/api',
        backend_api_url_production: config.backend_api_url_production || ''
      })
    }
  }, [config])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setSaveSuccess(false)
    setSaveError(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      console.log('Menyimpan konfigurasi:', formData) // Diubah ke Bahasa Indonesia
      const success = await updateConfig(formData)
      
      if (success) {
        setSaveSuccess(true)
        console.log('Konfigurasi berhasil disimpan, menyegarkan...') // Diubah ke Bahasa Indonesia
        
        await refreshConfig()
        
        setTimeout(() => setSaveSuccess(false), 5000)
        
        console.log('Konfigurasi berhasil disegarkan') // Diubah ke Bahasa Indonesia
      } else {
        setSaveError('Gagal menyimpan setelan') // Diubah ke Bahasa Indonesia
      }
    } catch (err) {
      console.error('Error menyimpan konfigurasi:', err) // Diubah ke Bahasa Indonesia
      setSaveError('Terjadi kesalahan pas menyimpan') // Diubah ke Bahasa Indonesia
    } finally {
      setSaving(false)
    }
  }

  const isFormValid = () => {
    return formData.google_sheet_id.trim() !== '' || 
           formData.gemini_api_key.trim() !== '' ||
           formData.backend_api_url_localhost.trim() !== '' ||
           formData.backend_api_url_production.trim() !== ''
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-sky-600" />
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                Setelan Akunmu {/* Diubah ke Bahasa Indonesia */}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          Atur dulu ya setelan Google Sheets sama API-mu. Ini setelannya khusus buat akunmu sendiri lho.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                {/* Asumsikan 'error' adalah variabel yang berisi pesan error yang mungkin sudah dilokalisasi atau dari sistem */}
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {saveSuccess && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Setelan berhasil disimpan! {/* Diubah ke Bahasa Indonesia */}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Dasbor sekarang akan pakai setelan ini ya. Mungkin perlu muat ulang data biar perubahannya keliatan. {/* Diubah ke Bahasa Indonesia */}
                  </p>
                </div>
              </div>
            </div>
          )}

          {saveError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-700 dark:text-red-300">{saveError}</p>
              </div>
            </div>
          )}

          {/* Google Sheets Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                ID Google Sheets {/* Diubah ke Bahasa Indonesia */}
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.google_sheet_id}
                  onChange={(e) => handleInputChange('google_sheet_id', e.target.value)}
                  placeholder="Masukkan ID Google Sheets-mu" // Diubah ke Bahasa Indonesia
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
                  <div>
                    <p className="font-medium">Langkah 1: Cari ID Google Sheets-mu</p> {/* Diubah ke Bahasa Indonesia */}
                    <p>Salin ID-nya dari URL Google Sheets-mu:</p> {/* Diubah ke Bahasa Indonesia */}
                    <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs block mt-1">
                      https://docs.google.com/spreadsheets/d/<span className="text-sky-600 font-semibold">ID_SHEET_KAMU</span>/edit {/* Diubah ke Bahasa Indonesia */}
                    </code>
                  </div>
                  <div>
                    <p className="font-medium">Langkah 2: Bagikan ke Service Account</p> {/* Diubah ke Bahasa Indonesia */}
                    <p>Bagikan spreadsheet-mu dengan email service account ini:</p> {/* Diubah ke Bahasa Indonesia */}
                    <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs block mt-1 text-green-600 font-medium">
                     telegram-sheets-bot@goog-455703.iam.gserviceaccount.com
                    </code>
                    <p className="mt-1 text-xs">
                      Kasih akses <span className="font-medium">Editor</span> ya (gak perlu dibikin publik sheet-nya jadi data dijamin aman) {/* Diubah ke Bahasa Indonesia */}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Langkah 3: Struktur Sheet yang Dibutuhkan</p> {/* Diubah ke Bahasa Indonesia */}
                    <p>Sheet-mu harus punya kolom-kolom ini di baris pertama:</p> {/* Diubah ke Bahasa Indonesia */}
                    <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs block mt-1">
                      Date | Amount | Category | Description | User ID | Timestamp {/* Diubah ke Bahasa Indonesia */}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gemini API Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Gemini API Key {/* Diubah ke Bahasa Indonesia */}
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={formData.gemini_api_key}
                    onChange={(e) => handleInputChange('gemini_api_key', e.target.value)}
                    placeholder="Masukkan API Key Gemini-mu" // Diubah ke Bahasa Indonesia
                    className="w-full p-3 pr-12 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <p>Dapetin API key dari Google AI Studio:</p> {/* Diubah ke Bahasa Indonesia */}
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:text-sky-700 inline-flex items-center gap-1"
                  >
                    https://aistudio.google.com/app/apikey <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Backend API Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
              URL API Backend {/* Diubah ke Bahasa Indonesia */}
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                URL API Lokal {/* Diubah ke Bahasa Indonesia */}
              </label>
              <input
                type="text"
                value={formData.backend_api_url_localhost}
                onChange={(e) => handleInputChange('backend_api_url_localhost', e.target.value)}
                placeholder="http://localhost:4000/api" // Placeholder URL umumnya tidak diubah
                className="w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Dipakai pas aplikasi jalan di lokal {/* Diubah ke Bahasa Indonesia */}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                URL API Produksi {/* Diubah ke Bahasa Indonesia */}
              </label>
              <input
                type="text"
                value={formData.backend_api_url_production}
                onChange={(e) => handleInputChange('backend_api_url_production', e.target.value)}
                placeholder="https://api-kamu.contoh.com/api" // Diubah ke Bahasa Indonesia (contoh URL)
                className="w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Dipakai pas aplikasi sudah di-deploy ke produksi {/* Diubah ke Bahasa Indonesia */}
              </p>
            </div>
          </div>

          {/* Information Box */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Prioritas Setelan:</p> {/* Diubah ke Bahasa Indonesia */}
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Setelan pribadimu bakal nindih environment variabel.</li> {/* Diubah ke Bahasa Indonesia */}
                  <li>Kalau ada kolom yang kosong, aplikasi bakal pakai environment variabel sebagai cadangan.</li> {/* Diubah ke Bahasa Indonesia */}
                  <li>Jika kolom Gemini API Key kosong maka akan memakai API key default dengan segala limitasinya.</li>
                  <li>Semua setelan disimpan dengan aman dan cuma kamu yang bisa lihat.</li> {/* Diubah ke Bahasa Indonesia */}
                  <li>Setelah disimpan, mungkin perlu muat ulang data biar perubahannya keliatan.</li> {/* Diubah ke Bahasa Indonesia */}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Batal {/* Diubah ke Bahasa Indonesia */}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isFormValid()}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menyimpan... {/* Diubah ke Bahasa Indonesia */}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Setelan {/* Diubah ke Bahasa Indonesia */}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserSettings