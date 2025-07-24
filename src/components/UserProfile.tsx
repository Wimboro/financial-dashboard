import React, { useState, useRef, useEffect } from 'react'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import UserSettings from './UserSettings'

const UserProfile: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, signOut } = useAuth()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  const handleSettingsClick = () => {
    setIsSettingsOpen(true)
    setIsOpen(false)
  }

  if (!user) return null

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {user.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user.email}
            </p>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {user.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user.email}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Signed in since {new Date(user.created_at || '').toLocaleDateString()}
              </p>
            </div>
            
            <div className="py-1">
              <button
                onClick={handleSettingsClick}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      <UserSettings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  )
}

export default UserProfile 