import React from 'react'
import { X, Heart, Star } from 'lucide-react'

interface DonationModalProps {
  isOpen: boolean
  onClose: () => void
}

const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                  Dukung Pengembangan Proyek Ini
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Bantu untuk menjaga proyek ini tetap berjalan
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Thank you message */}
          <div className="text-center">
            <div className="flex justify-center gap-1 mb-3">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
              Terimakasih atas Dukungan Kalian! 🙏
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Donasi kalian membantu kami untuk megurus Server, Domain dan API.
              Setiap kontribusi baik kecil maupun besar tidak ada bedanya!<Heart className="w-5 h-5 text-pink-600 mx-auto mb-1" />
            </p>
          </div>

          {/* Donation amounts */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">
              Nominal terserah kalian, Rp. 1 pun kami sangat senang!
            </h4>
          </div>

          {/* QRIS Payment */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Scan QRIS dibawah untuk berdonasi
            </h4>
            
            {/* QRIS Code */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4 inline-block border">
              {/* QRIS Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-black text-white px-2 py-1 text-xs font-bold">QRIS</div>
                  <span className="text-xs text-gray-600">Pembayaran Nasional</span>
                </div>
                <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">GPN</span>
                </div>
              </div>
              
              {/* QR Code Area */}
              <div className="flex justify-center mb-3">
                <img 
                  src="/qris.jpg" 
                  alt="QRIS Donation Code" 
                  className="w-48 h-48 object-contain rounded-lg border border-gray-200"
                />
              </div>
              
              {/* Donation Info */}
              <div className="text-center">
                <div className="text-sm font-bold text-gray-800 mb-1">Hiddenglam</div>
                <div className="text-xs text-gray-600 mb-1">NMID:ID102434I012853</div>
                <div className="text-xs text-gray-600">Any Amount Donation</div>
              </div>
              
              {/* Footer */}
              <div className="mt-3 pt-2 border-t border-gray-200 text-center">
                <div className="text-xs font-bold text-gray-800">SATU QRIS UNTUK SEMUA</div>
                <div className="text-xs text-gray-600">Scan & Pay with any e-wallet or banking app</div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Merchant:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">Hiddenglam</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">NMID:</span>
                <span className="font-mono text-xs text-slate-800 dark:text-slate-200">ID102434I012853</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Type:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">Nominal Bebas</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
              Cara Membayar dengan QRIS:
            </h4>
            <ol className="list-decimal list-inside text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>Buka aplikasi m-banking atau dompet digitalmu.</li>
              <li>Pilih menu "Scan QR" atau "QRIS".</li>
              <li>Scan aja kode QR yang ada di atas itu.</li>
              <li>Masukin berapa mau donasi.</li>
              <li>Selesain deh pembayarannya.</li>
            </ol>
          </div>

          {/* Footer message */}
          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            <p>Santai aja, dukungan kalian itu yang bikin proyek ini tetap gratis dan open source.</p>
            <p className="mt-1">Makasih ya! ❤️</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default DonationModal 