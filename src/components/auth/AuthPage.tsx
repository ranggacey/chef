import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Sparkles,
  BookOpen,
  Calendar,
  Utensils,
  ShieldCheck,
  ChevronRight,
  ChefHat,
  Package
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { animeToast, kawaiiToast } from '../../lib/kawaii-toast'
import { useStore } from '../../store/useStore'

interface AuthPageProps {
  onAuthSuccess: () => void
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [activeField, setActiveField] = useState<string | null>(null)
  const { language } = useStore()
  
  // Translations
  const translations = {
    welcomeBack: language === 'en' ? 'Welcome back' : 'Selamat datang kembali',
    signIn: language === 'en' ? 'Sign in to continue your culinary journey' : 'Masuk untuk melanjutkan perjalanan kuliner Anda',
    join: language === 'en' ? 'Join Chef AI' : 'Bergabung dengan Chef AI',
    createAccount: language === 'en' ? 'Create your account to get started' : 'Buat akun Anda untuk memulai',
    email: language === 'en' ? 'Email address' : 'Alamat email',
    password: language === 'en' ? 'Password' : 'Kata sandi',
    confirmPassword: language === 'en' ? 'Confirm password' : 'Konfirmasi kata sandi',
    forgotPassword: language === 'en' ? 'Forgot password?' : 'Lupa kata sandi?',
    passwordHint: language === 'en' ? 'Password must be 8+ characters with uppercase, lowercase, number, and special character' : 'Password harus 8+ karakter dengan huruf besar, kecil, angka, dan karakter khusus',
    signInButton: language === 'en' ? 'Sign in' : 'Masuk',
    createAccountButton: language === 'en' ? 'Create account' : 'Buat akun',
    noAccount: language === 'en' ? "Don't have an account? Create one" : 'Belum punya akun? Buat akun',
    haveAccount: language === 'en' ? 'Already have an account? Sign in' : 'Sudah punya akun? Masuk',
    secure: language === 'en' ? 'Secure authentication powered by Supabase' : 'Autentikasi aman didukung oleh Supabase',
    transform: language === 'en' ? 'Transform your cooking' : 'Transformasi cara memasak Anda',
    aiPowered: language === 'en' ? 'Chef AI uses artificial intelligence to help you create amazing meals with ingredients you already have.' : 'Chef AI menggunakan kecerdasan buatan untuk membantu Anda membuat makanan lezat dengan bahan yang sudah Anda miliki.'
  }
  
  // Benefits of using the app
  const benefits = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: language === 'en' ? "AI-Powered Recipes" : "Resep dengan AI",
      description: language === 'en' ? "Generate personalized recipes based on your available ingredients" : "Buat resep yang dipersonalisasi berdasarkan bahan yang tersedia"
    },
    {
      icon: <Package className="w-5 h-5" />,
      title: language === 'en' ? "Inventory Management" : "Manajemen Inventori",
      description: language === 'en' ? "Track and manage your kitchen inventory with expiry alerts" : "Lacak dan kelola inventori dapur Anda dengan peringatan kadaluarsa"
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: language === 'en' ? "Recipe Collection" : "Koleksi Resep",
      description: language === 'en' ? "Save and organize your favorite recipes in one place" : "Simpan dan atur resep favorit Anda dalam satu tempat"
    },
    {
      icon: <ChefHat className="w-5 h-5" />,
      title: language === 'en' ? "Cooking Assistant" : "Asisten Memasak",
      description: language === 'en' ? "Get cooking tips and answers to your culinary questions" : "Dapatkan tips memasak dan jawaban untuk pertanyaan kuliner Anda"
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLogin) {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })

        if (error) {
          // Handle specific email confirmation error
          if (error.message.includes('Email not confirmed')) {
            toast.error(language === 'en' 
              ? 'Please check your email and click the confirmation link before signing in.'
              : 'Silakan periksa email Anda dan klik tautan konfirmasi sebelum masuk.', {
              duration: 6000,
              style: {
                maxWidth: '400px',
              }
            })
          } else {
            throw error
          }
          return
        }
        
        animeToast.welcome('Chef', language === 'id')
        onAuthSuccess()
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          animeToast.validationError(language === 'id')
          return
        }

        // Strong password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        if (!passwordRegex.test(formData.password)) {
          kawaiiToast.error(language === 'en'
            ? 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
            : 'Password harus minimal 8 karakter dengan huruf besar, kecil, angka, dan karakter khusus', 
            language === 'id'
          )
          return
        }

        // Gunakan URL situs yang benar untuk redirect
        const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
        
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${siteUrl}/auth/callback`
          }
        })

        if (error) throw error
        
        kawaiiToast.success(language === 'en'
          ? 'Account created successfully! Please check your email to confirm your account before signing in.'
          : 'Akun berhasil dibuat! Silakan periksa email Anda untuk mengonfirmasi akun Anda sebelum masuk.', 
          language === 'id'
        )
        
        // Switch to login mode after successful registration
        setIsLogin(true)
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
      }
    } catch (error: any) {
      kawaiiToast.error(error.message || (language === 'en' ? 'Authentication failed' : 'Autentikasi gagal'), language === 'id')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 z-0">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:72px_72px]"></div>
        
        {/* Subtle radial glow */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary-100/30 rounded-full blur-[120px] opacity-30"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-[100px] opacity-20"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top navigation */}
        <header className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <img src="/images/logo.png" alt="Chef AI Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="text-xl font-medium tracking-tight text-gray-900">Chef AI</span>
          </div>
        </header>
        
        {/* Main section */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          {/* Auth card */}
          <div className="w-full max-w-md relative">
            {/* Card background with glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-200/30 to-accent-200/30 rounded-2xl blur-md"></div>
            
            {/* Card content */}
            <div className="relative bg-white rounded-xl border border-gray-200 p-8 overflow-hidden shadow-lg">
              {/* Animated corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32">
                <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0L100 0L100 100" stroke="url(#paint0_linear)" strokeWidth="0.5" />
                  <defs>
                    <linearGradient id="paint0_linear" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#6366F1" />
                      <stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? 'login' : 'register'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Form header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                        <ChefHat className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                          {isLogin ? translations.welcomeBack : translations.join}
                        </h1>
                        <p className="text-gray-500 text-sm">
                          {isLogin ? translations.signIn : translations.createAccount}
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative h-[2px] bg-gray-100 overflow-hidden">
                      <motion.div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-accent-500"
                        animate={{
                          width: ["0%", "100%", "0%"],
                          left: ["0%", "0%", "100%"],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email field */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {translations.email}
                      </label>
                      <div 
                        className={`absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 opacity-${activeField === 'email' ? '30' : '0'} transition-opacity duration-300`}
                      ></div>
                      <div className="relative bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            onFocus={() => setActiveField('email')}
                            onBlur={() => setActiveField(null)}
                            className="w-full bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 text-lg"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Password field */}
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {translations.password}
                        </label>
                        {isLogin && (
                          <a href="#" className="text-xs text-primary-600 hover:text-primary-700 transition-colors">
                            {translations.forgotPassword}
                          </a>
                        )}
                      </div>
                      <div 
                        className={`absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 opacity-${activeField === 'password' ? '30' : '0'} transition-opacity duration-300`}
                      ></div>
                      <div className="relative bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••••"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            onFocus={() => setActiveField('password')}
                            onBlur={() => setActiveField(null)}
                            className="w-full bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 text-lg"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Confirm Password field (Register only) */}
                    <AnimatePresence>
                      {!isLogin && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {translations.confirmPassword}
                            </label>
                            <div 
                              className={`absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 opacity-${activeField === 'confirmPassword' ? '30' : '0'} transition-opacity duration-300`}
                            ></div>
                            <div className="relative bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5 text-gray-400" />
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="••••••••••"
                                  value={formData.confirmPassword}
                                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                  onFocus={() => setActiveField('confirmPassword')}
                                  onBlur={() => setActiveField(null)}
                                  className="w-full bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 text-lg"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 ml-1">
                            {translations.passwordHint}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Submit button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full relative group"
                      >
                        {/* Button background with animated gradient border */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
                        <div className="relative bg-white rounded-lg px-6 py-4 flex items-center justify-center">
                          {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent" />
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{isLogin ? translations.signInButton : translations.createAccountButton}</span>
                              <ArrowRight className="w-4 h-4 text-gray-900 group-hover:translate-x-1 transition-transform" />
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                    
                    {/* Switch between login/register */}
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        {isLogin ? translations.noAccount : translations.haveAccount}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </AnimatePresence>
              
              {/* Security note */}
              <div className="mt-8 flex items-center gap-2 justify-center">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">{translations.secure}</span>
              </div>
            </div>
          </div>
          
          {/* Feature highlights */}
          <div className="mt-16 w-full max-w-4xl">
            <h2 className="text-center text-3xl font-bold tracking-tight mb-2 text-gray-900">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">
                {translations.transform}
              </span>
            </h2>
            <p className="text-center text-gray-600 mb-10 max-w-lg mx-auto">
              {translations.aiPowered}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative bg-white rounded-lg p-5 border border-gray-200 h-full shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center mb-4">
                      {benefit.icon}
                    </div>
                    <h3 className="font-medium text-lg mb-2 text-gray-900">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} Chef AI. All rights reserved.</p>
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Contact'].map((item, i) => (
                <a key={i} href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}