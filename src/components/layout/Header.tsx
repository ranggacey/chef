import React from 'react'
import { motion } from 'framer-motion'
import { Menu, Sparkles } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { Button } from '../ui/Button'

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { setActiveView, user, language } = useStore()
  
  // Translations
  const translations = {
    welcome: language === 'en' ? 'Welcome back' : 'Selamat datang kembali',
    ready: language === 'en' ? 'Ready to cook something amazing?' : 'Siap memasak sesuatu yang lezat?',
    generate: language === 'en' ? 'Generate Recipe' : 'Buat Resep'
  }
  
  return (
    <header className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        <button 
          onClick={onMenuToggle}
          className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Logo for mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center overflow-hidden">
            <img src="/images/logo.png" alt="Chef AI Logo" className="w-5 h-5 object-contain" />
          </div>
          <span className="text-lg font-medium">Chef AI</span>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-neutral-900">
              {translations.welcome}, {user?.email?.split('@')[0] || 'Chef'}!
            </p>
            <p className="text-xs text-neutral-500">{translations.ready}</p>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <Button 
              variant="primary" 
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4" />}
              onClick={() => setActiveView('ai-chat')}
              className="hidden sm:flex"
            >
              {translations.generate}
            </Button>
            
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => setActiveView('ai-chat')}
              className="sm:hidden p-2"
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}