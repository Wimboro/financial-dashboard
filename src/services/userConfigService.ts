import { supabase } from '../lib/supabase'

export interface UserConfiguration {
  id?: string
  user_id: string
  google_sheet_id?: string
  gemini_api_key?: string
  backend_api_url_localhost?: string
  backend_api_url_production?: string
  created_at?: string
  updated_at?: string
}

export const userConfigService = {
  // Get user configuration
  async getUserConfig(userId: string): Promise<{ data: UserConfiguration | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_configurations')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        return { data: null, error }
      }

      return { data: data || null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Create or update user configuration
  async upsertUserConfig(config: Omit<UserConfiguration, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: UserConfiguration | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_configurations')
        .upsert(config, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Update specific configuration fields
  async updateUserConfig(userId: string, updates: Partial<Omit<UserConfiguration, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<{ data: UserConfiguration | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_configurations')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Delete user configuration
  async deleteUserConfig(userId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('user_configurations')
        .delete()
        .eq('user_id', userId)

      return { error }
    } catch (error) {
      return { error }
    }
  }
} 