import React, { useState } from 'react'
import { Heart } from 'lucide-react'
import DonationModal from './DonationModal'

interface DonationButtonProps {
  variant?: 'primary' | 'secondary' | 'floating'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const DonationButton: React.FC<DonationButtonProps> = ({ 
  variant = 'primary', 
  size = 'md',
  className = '' 
}) => {
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false)

  const baseClasses = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-white dark:bg-slate-800 border-2 border-pink-500 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20",
    floating: "fixed bottom-6 right-6 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-2xl hover:shadow-3xl z-40 rounded-full hidden md:block"
  }
  
  const sizeClasses = {
    sm: variant === 'floating' ? 'w-12 h-12' : 'px-3 py-2 text-sm',
    md: variant === 'floating' ? 'w-14 h-14' : 'px-4 py-2.5 text-sm',
    lg: variant === 'floating' ? 'w-16 h-16' : 'px-6 py-3 text-base'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  return (
    <>
      <button
        onClick={() => setIsDonationModalOpen(true)}
        className={buttonClasses}
        title="Support this project"
      >
        <Heart className={`${iconSizes[size]} ${variant === 'floating' ? '' : 'animate-pulse'}`} />
        {variant !== 'floating' && (
          <span>
            {size === 'sm' ? 'Donasi' : 'Support Project'}
          </span>
        )}
        {variant === 'floating' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
        )}
      </button>

      <DonationModal 
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
      />
    </>
  )
}

export default DonationButton 