import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { userConfigService, UserConfiguration } from '../services/userConfigService'

interface UserConfigContextType {
  config: UserConfiguration | null
  loading: boolean
  error: string | null
  updateConfig: (updates: Partial<Omit<UserConfiguration, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<boolean>
  refreshConfig: () => Promise<void>
  getGoogleSheetId: () => string | null
  getGeminiApiKey: () => string | null
  getBackendApiUrl: () => string | null
}

const UserConfigContext = createContext<UserConfigContextType | undefined>(undefined)

export const useUserConfig = () => {
  const context = useContext(UserConfigContext)
  if (context === undefined) {
    throw new Error('useUserConfig must be used within a UserConfigProvider')
  }
  return context
}

export const UserConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [config, setConfig] = useState<UserConfiguration | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const IS_LOCALHOST = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

  const loadUserConfig = async () => {
    if (!user?.id) {
      setConfig(null)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Loading user configuration for user:', user.id)
      
      const { data, error: configError } = await userConfigService.getUserConfig(user.id)
      
      if (configError) {
        console.error('Error loading user config:', configError)
        
        // More specific error messages based on error type
        if (configError.code === '42P01') {
          setError('Database table not found. Please run the database setup script.')
        } else if (configError.code === 'PGRST116') {
          // No configuration found - this is normal for new users
          console.log('No configuration found for user, this is normal for new users')
          setConfig(null)
          setError(null)
        } else if (configError.message?.includes('permission denied')) {
          setError('Permission denied. Please check your authentication.')
        } else {
          setError(`Failed to load configuration: ${configError.message || 'Unknown error'}`)
        }
        return
      }

      console.log('User configuration loaded successfully:', data)
      setConfig(data)
      setError(null)
    } catch (err) {
      console.error('Unexpected error loading user config:', err)
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = async (updates: Partial<Omit<UserConfiguration, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Updating user configuration:', updates)
      
      let result
      
      if (config) {
        // Update existing config
        result = await userConfigService.updateUserConfig(user.id, updates)
      } else {
        // Create new config
        result = await userConfigService.upsertUserConfig({
          user_id: user.id,
          ...updates
        })
      }

      if (result.error) {
        console.error('Error updating user config:', result.error)
        
        if (result.error.code === '42P01') {
          setError('Database table not found. Please run the database setup script.')
        } else if (result.error.message?.includes('permission denied')) {
          setError('Permission denied. Please check your authentication.')
        } else {
          setError(`Failed to update configuration: ${result.error.message || 'Unknown error'}`)
        }
        return false
      }

      console.log('User configuration updated successfully:', result.data)
      setConfig(result.data)
      setError(null)
      return true
    } catch (err) {
      console.error('Unexpected error updating user config:', err)
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  const refreshConfig = async () => {
    await loadUserConfig()
  }

  const getGoogleSheetId = (): string | null => {
    const userSheetId = config?.google_sheet_id
    const envSheetId = import.meta.env.VITE_GOOGLE_SHEET_ID
    
    const result = userSheetId || envSheetId || null
    console.log('Getting Google Sheet ID:', { userSheetId, envSheetId, result })
    return result
  }

  const getGeminiApiKey = (): string | null => {
    const userApiKey = config?.gemini_api_key
    const envApiKey = import.meta.env.VITE_GEMINI_API_KEY
    
    const result = userApiKey || envApiKey || null
    console.log('Getting Gemini API Key:', { hasUserKey: !!userApiKey, hasEnvKey: !!envApiKey, hasResult: !!result })
    return result
  }

  const getBackendApiUrl = (): string | null => {
    let userUrl, envUrl
    
    if (IS_LOCALHOST) {
      userUrl = config?.backend_api_url_localhost
      envUrl = import.meta.env.VITE_BACKEND_API_URL_LOCALHOST
    } else {
      userUrl = config?.backend_api_url_production
      envUrl = import.meta.env.VITE_BACKEND_API_URL_PRODUCTION
    }
    
    const result = userUrl || envUrl || null
    console.log('Getting Backend API URL:', { isLocalhost: IS_LOCALHOST, userUrl, envUrl, result })
    return result
  }

  useEffect(() => {
    loadUserConfig()
  }, [user?.id])

  const value = {
    config,
    loading,
    error,
    updateConfig,
    refreshConfig,
    getGoogleSheetId,
    getGeminiApiKey,
    getBackendApiUrl
  }

  return (
    <UserConfigContext.Provider value={value}>
      {children}
    </UserConfigContext.Provider>
  )
} 