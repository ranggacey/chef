import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabase'
import { useStore } from './store/useStore'
import { AuthPage } from './components/auth/AuthPage'
import { AuthCallback } from './components/auth/AuthCallback'
import { Navigation } from './components/layout/Navigation'
import { Header } from './components/layout/Header'
import { Dashboard } from './components/dashboard/Dashboard'
import { InventoryManager } from './components/inventory/InventoryManager'
import { RecipeManager } from './components/recipes/RecipeManager'
import { MealPlanManager } from './components/meal-plan/MealPlanManager'
import { AIChat } from './components/ai/AIChat'
import { Menu } from 'lucide-react'

// Komponen layout utama
const AppLayout = () => {
  const { activeView } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />
      case 'inventory':
        return <InventoryManager />
      case 'recipes':
        return <RecipeManager />
      case 'meal-plan':
        return <MealPlanManager />
      case 'ai-chat':
        return <AIChat />
      default:
        return <Dashboard />
    }
  }
  
  // Close mobile menu when view changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeView]);
  
  return (
    <div className="h-screen bg-neutral-50 flex flex-col md:flex-row">
      {/* Mobile menu button */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      </div>
      
      {/* Mobile navigation overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>
      
      {/* Navigation sidebar - responsive */}
      <div 
        className={`fixed inset-y-0 left-0 transform z-50 md:relative md:translate-x-0 transition duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:w-64 w-3/4 max-w-xs`}
      >
        <Navigation onClose={() => setMobileMenuOpen(false)} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

function App() {
  const { setUser, user } = useStore()
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  
  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || ''
        })
      }
      setIsAuthChecked(true)
    })
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || ''
        })
      } else {
        setUser(null)
      }
      setIsAuthChecked(true)
    })
    
    return () => subscription.unsubscribe()
  }, [setUser])
  
  // Show loading while checking auth
  if (!isAuthChecked) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.5 14.5L4 19L5.5 20.5L10 16M15 5L9 11L13 15L19 9M15 5L19 9M15 5L19 1M19 9L23 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-white">Chef AI</h1>
          <p className="text-white text-opacity-80">Loading your kitchen...</p>
        </div>
      </div>
    )
  }
  
    return (
    <BrowserRouter>
      <Routes>
        {/* Rute autentikasi */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route 
          path="/auth" 
          element={user ? <Navigate to="/dashboard" replace /> : <AuthPage onAuthSuccess={() => {}} />} 
        />
        
        {/* Rute aplikasi yang dilindungi */}
        <Route 
          path="/*" 
          element={user ? <AppLayout /> : <Navigate to="/auth" replace />} 
        />
      </Routes>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            borderRadius: '20px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 25px -5px rgba(102, 126, 234, 0.4), 0 10px 10px -5px rgba(118, 75, 162, 0.3)',
            backdropFilter: 'blur(16px)',
            fontSize: '14px',
            fontWeight: '500',
            padding: '16px 20px',
          },
          success: {
            style: {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 20px 25px -5px rgba(102, 126, 234, 0.4), 0 10px 10px -5px rgba(118, 75, 162, 0.3)',
            },
            iconTheme: {
              primary: '#fff',
              secondary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            },
          },
          error: {
            style: {
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
              color: '#721c24',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 20px 25px -5px rgba(255, 154, 158, 0.4), 0 10px 10px -5px rgba(254, 207, 239, 0.3)',
            },
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fff',
            },
          },
          loading: {
            style: {
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              color: '#1f2937',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 20px 25px -5px rgba(168, 237, 234, 0.4), 0 10px 10px -5px rgba(254, 214, 227, 0.3)',
            },
          },
        }}
      />
    </BrowserRouter>
  )
}

export default App