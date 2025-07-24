import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Logo from './Logo'
import DonationButton from './DonationButton'

type AuthMode = 'signin' | 'signup' | 'reset'

const LoginScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null)

  const { signIn, signUp, resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) {
          setMessage({ type: 'error', text: error.message || 'Failed to sign in' })
        }
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          setMessage({ type: 'error', text: 'Passwords do not match' })
          setLoading(false)
          return
        }
        if (password.length < 6) {
          setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
          setLoading(false)
          return
        }
        const { error } = await signUp(email, password)
        if (error) {
          setMessage({ type: 'error', text: error.message || 'Failed to sign up' })
        } else {
          setMessage({ type: 'success', text: 'Check your email for verification link!' })
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email)
        if (error) {
          setMessage({ type: 'error', text: error.message || 'Failed to send reset email' })
        } else {
          setMessage({ type: 'success', text: 'Password reset email sent!' })
        }
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An unexpected error occurred' })
    }

    setLoading(false)
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setMessage(null)
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    resetForm()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-start mb-4">
            <div></div> {/* Spacer */}
            <div className="inline-block">
              <Logo size="large" className="mx-auto" />
            </div>
            <DonationButton variant="secondary" size="sm" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            Financial Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {mode === 'signin' && 'Welcome back! Please sign in to continue.'}
            {mode === 'signup' && 'Create your account to get started.'}
            {mode === 'reset' && 'Enter your email to reset your password.'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          {/* Mode Tabs */}
          {mode !== 'reset' && (
            <div className="flex mb-6 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => switchMode('signin')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchMode('signup')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
              message.type === 'error' 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                : message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
            }`}>
              {message.type === 'error' && <AlertCircle className="w-4 h-4" />}
              {message.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            {mode !== 'reset' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 transition-colors"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 dark:disabled:bg-sky-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'reset' && 'Send Reset Email'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            {mode === 'signin' && (
              <button
                onClick={() => switchMode('reset')}
                className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
              >
                Forgot your password?
              </button>
            )}
            {mode === 'reset' && (
              <button
                onClick={() => switchMode('signin')}
                className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
          <p>&copy; {new Date().getFullYear()} Financial Dashboard. All rights reserved.</p>
        </div>
      </div>
      
      {/* Floating Donation Button */}
      <DonationButton variant="floating" size="md" />
    </div>
  )
}

export default LoginScreen 