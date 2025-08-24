import React from 'react'
import { motion } from 'framer-motion'
import { 
  Home, 
  Package, 
  BookOpen, 
  MessageCircle,
  LogOut,
  X,
  Globe
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { animeToast, kawaiiToast } from '../../lib/kawaii-toast'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'recipes', label: 'Recipes', icon: BookOpen },
  { id: 'ai-chat', label: 'AI Chef', icon: MessageCircle },
] as const

interface NavigationProps {
  onClose?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onClose }) => {
  const { activeView, setActiveView, user, setUser, language, setLanguage } = useStore()
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      kawaiiToast.success(language === 'en' ? 'Sayonara! See you later~' : 'Sayonara! Sampai jumpa lagi~', language === 'id')
    } catch (error) {
      kawaiiToast.error(language === 'en' ? 'Error signing out' : 'Gagal keluar', language === 'id')
    }
  }

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'id' : 'en'
    setLanguage(newLanguage)
    animeToast.languageChange(newLanguage)
  }
  
  // Translations for navigation items
  const getLabel = (id: string) => {
    if (language === 'id') {
      switch (id) {
        case 'dashboard': return 'Dasbor'
        case 'inventory': return 'Inventori'
        case 'recipes': return 'Resep'
        case 'ai-chat': return 'AI Chef'
        default: return id
      }
    }
    return navItems.find(item => item.id === id)?.label || id
  }
  
  return (
    <nav className="bg-white border-r border-neutral-200 w-full h-full flex flex-col shadow-lg md:shadow-none">
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/images/logo.png" alt="Chef AI Logo" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Chef AI</h1>
              <p className="text-sm text-neutral-500">
                {language === 'en' ? 'Smart Kitchen Assistant' : 'Asisten Dapur Pintar'}
              </p>
            </div>
          </div>
          
          {/* Close button - mobile only */}
          {onClose && (
            <button 
              onClick={onClose} 
              className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      
      {/* Navigation Items */}
      <div className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            
            return (
              <li key={item.id}>
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveView(item.id);
                    if (onClose) onClose();
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                    transition-all duration-200 group
                    ${isActive 
                      ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
                  <span className="font-medium">{getLabel(item.id)}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 bg-primary-500 rounded-full"
                    />
                  )}
                </motion.button>
              </li>
            )
          })}
        </ul>

        {/* Language Selector */}
        <div className="mt-6 pt-4 border-t border-neutral-200">
          <button 
            onClick={toggleLanguage}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                    transition-all duration-200 group text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
          >
            <Globe className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600" />
            <span className="font-medium">
              {language === 'en' ? 'Bahasa Indonesia' : 'English'}
            </span>
          </button>
        </div>
      </div>
      
      {/* User Profile */}
      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-secondary-400 to-primary-400 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-neutral-500">
              {language === 'en' ? 'Chef Level: Beginner' : 'Level Chef: Pemula'}
            </p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{language === 'en' ? 'Sign Out' : 'Keluar'}</span>
        </motion.button>
      </div>
    </nav>
  )
}