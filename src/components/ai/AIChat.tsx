import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Sparkles, 
  ChefHat, 
  Clock, 
  Users, 
  Utensils,
  BookOpen,
  Heart,
  Loader2,
  Trash2,
  RotateCcw,
  Package,
  Plus,
  AlertCircle,
  Filter,
  X,
  ChevronUp,
  ChevronDown,
  Check,
  ListFilter
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { lunosService as geminiService, testLunosConnection as testGeminiConnection, testLunosDirect as testGeminiDirect, detectLanguage, type RecipeRequest, type GeneratedRecipe } from '../../lib/lunos'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { RecipeDetailModal } from '../recipes/RecipeDetailModal'
import toast from 'react-hot-toast'
import { animeToast, kawaiiToast } from '../../lib/kawaii-toast'
import { SearchBar } from '../ui/SearchBar'

interface Message {
  id: string
  type: 'user' | 'ai' | 'recipe'
  content: string
  recipe?: GeneratedRecipe
  timestamp: Date
}

export const AIChat: React.FC = () => {
  const { 
    ingredients, 
    addRecipe, 
    isGeneratingRecipe, 
    setIsGeneratingRecipe,
    chatMessages,
    fetchChatHistory,
    addChatMessage,
    startNewChatSession,
    clearChatHistory,
    setActiveView,
    language
  } = useStore()
  
  const [inputValue, setInputValue] = useState('')
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<GeneratedRecipe | null>(null)
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false)
  const [showIngredientsPanel, setShowIngredientsPanel] = useState(true)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [searchIngredient, setSearchIngredient] = useState('')
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  
  
  
  // Filter ingredients based on search
  const filteredIngredients = ingredients.filter(ing => 
    ing.name.toLowerCase().includes(searchIngredient.toLowerCase())
  );
  
  // Group ingredients by category
  const ingredientsByCategory = filteredIngredients.reduce((acc, ingredient) => {
    const category = ingredient.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(ingredient);
    return acc;
  }, {} as Record<string, typeof ingredients>);
  
  // Convert Supabase chat messages to local format
  const messages: Message[] = chatMessages.map(msg => ({
    id: msg.id,
    type: (msg.metadata?.recipe ? 'recipe' : msg.message_type) as 'user' | 'ai' | 'recipe',
    content: msg.content,
    recipe: msg.metadata?.recipe || undefined,
    timestamp: new Date(msg.created_at)
  }))
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log('🔄 Initializing chat...')
        // Load chat history when component mounts
        await fetchChatHistory()
        
        // Start new session if none exists
        if (!chatMessages.length) {
          console.log('📝 Starting new chat session...')
          startNewChatSession()
        }
        console.log('✅ Chat initialized successfully')
      } catch (error) {
        console.error('❌ Failed to initialize chat:', error)
        // Start a new session as fallback
        startNewChatSession()
      }
    }
    
    initializeChat()
  }, [])
  

  
  const handleTestConnection = async () => {
    setIsGeneratingRecipe(true)
    try {
      console.log('🚀 Starting AI connection test...')
      
      // Test direct API first
      console.log('📡 Step 1: Testing direct API...')
      const directTest = await testGeminiDirect()
      
      if (directTest) {
        console.log('✅ Direct API test passed, testing service layer...')
        const serviceTest = await testGeminiConnection()
        
        if (serviceTest) {
          animeToast.connectionSuccess(language === 'id')
        } else {
          animeToast.aiError(language === 'id')
        }
      } else {
        console.log('❌ Direct API test failed')
        animeToast.aiError(language === 'id')
      }
    } catch (error: any) {
      console.error('🚨 Connection test error:', error)
      toast.error(`Connection test failed: ${error.message}`)
    } finally {
      setIsGeneratingRecipe(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return
    
    setInputValue('')
    setIsGeneratingRecipe(true)
    
    try {
      console.log('Sending message to AI:', inputValue)
      
      // Detect language from user input
      const detectedLanguage = detectLanguage(inputValue)
      console.log('🌍 Detected language for response:', detectedLanguage)
      
      // Save user message
      await addMessage('user', inputValue, { selectedIngredients, detectedLanguage })
      
      // Check if user is asking for a recipe
      const isRecipeRequest = inputValue.toLowerCase().includes('recipe') || 
                             inputValue.toLowerCase().includes('cook') ||
                             inputValue.toLowerCase().includes('make') ||
                             inputValue.toLowerCase().includes('resep') ||
                             inputValue.toLowerCase().includes('masak') ||
                             inputValue.toLowerCase().includes('buat') ||
                             selectedIngredients.length > 0
      
      if (isRecipeRequest && (selectedIngredients.length > 0 || ingredients.length > 0)) {
        console.log('Generating recipe with ingredients:', selectedIngredients)
        await generateRecipe(inputValue, detectedLanguage)
      } else {
        console.log('Answering cooking question')
        // General cooking question using detected language
        const response = await geminiService.answerCookingQuestion(inputValue, undefined, detectedLanguage)
        
        // Save AI response
        await addMessage('ai', response)
      }
    } catch (error: any) {
      console.error('AI Chat error:', error)
      
      // More specific error messages
      let errorMessage = language === 'en' 
        ? 'Failed to get response. Please try again.'
        : 'Gagal mendapatkan respons. Silakan coba lagi.'
      
      if (error.message) {
        if (error.message.includes('API key')) {
          errorMessage = language === 'en'
            ? 'AI service configuration error. Please contact support.'
            : 'Kesalahan konfigurasi layanan AI. Silakan hubungi dukungan.'
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = language === 'en'
            ? 'Network error. Please check your internet connection.'
            : 'Kesalahan jaringan. Silakan periksa koneksi internet Anda.'
        } else if (error.message.includes('429')) {
          errorMessage = language === 'en'
            ? 'Too many requests. Please wait a moment and try again.'
            : 'Terlalu banyak permintaan. Harap tunggu sebentar dan coba lagi.'
        } else {
          errorMessage = language === 'en'
            ? `AI Error: ${error.message}`
            : `Kesalahan AI: ${error.message}`
        }
      }
      
      toast.error(errorMessage)
      
      // Add error message to chat
      try {
        console.log('💾 Saving error message to chat...')
        await addMessage('ai', language === 'en'
          ? `Sorry, I encountered an error: ${errorMessage}. Please try again or contact support if the problem persists.`
          : `Maaf, saya menemui kesalahan: ${errorMessage}. Silakan coba lagi atau hubungi dukungan jika masalah berlanjut.`, 
          { error: true }
        )
      } catch (dbError) {
        console.error('❌ Failed to save error message to database:', dbError)
        // Don't show another toast here to avoid spam
      }
    } finally {
      setIsGeneratingRecipe(false)
    }
  }
  
  const generateRecipe = async (prompt: string, detectedLanguage: 'en' | 'id' = 'en') => {
    try {
      const ingredientsToUse = selectedIngredients.length > 0 
        ? selectedIngredients 
        : ingredients.slice(0, 8).map(ing => ing.name)
      
      const request: RecipeRequest = {
        ingredients: ingredientsToUse,
        preferences: extractPreferences(prompt),
        mood: prompt,
        language: detectedLanguage // Use detected language instead of app language
      }
      
      console.log('🍳 Generating recipe with detected language:', detectedLanguage)
      
      const recipe = await geminiService.generateRecipe(request)
      
      // Save recipe message using detected language
      await addMessage('recipe', detectedLanguage === 'en' 
        ? `I've created a delicious recipe for you using your ingredients!`
        : `Saya telah membuat resep lezat untuk Anda menggunakan bahan-bahan Anda!`, 
        { recipe, language: detectedLanguage }
      )
      
      setSelectedIngredients([])
    } catch (error) {
      // Save error message using detected language
      await addMessage('ai', detectedLanguage === 'en'
        ? "I'm sorry, I couldn't generate a recipe right now. Please try again with different ingredients or preferences."
        : "Maaf, saya tidak bisa membuat resep saat ini. Silakan coba lagi dengan bahan atau preferensi yang berbeda.", 
        { error: true }
      )
    }
  }
  
  const extractPreferences = (prompt: string): string[] => {
    const preferences: string[] = []
    const lowerPrompt = prompt.toLowerCase()
    
    // English preferences
    if (lowerPrompt.includes('vegetarian')) preferences.push('vegetarian')
    if (lowerPrompt.includes('vegan')) preferences.push('vegan')
    if (lowerPrompt.includes('gluten-free')) preferences.push('gluten-free')
    if (lowerPrompt.includes('healthy')) preferences.push('healthy')
    if (lowerPrompt.includes('quick') || lowerPrompt.includes('fast')) preferences.push('quick')
    if (lowerPrompt.includes('easy')) preferences.push('easy')
    
    // Indonesian preferences
    if (lowerPrompt.includes('vegetarian') || lowerPrompt.includes('nabati')) preferences.push('vegetarian')
    if (lowerPrompt.includes('vegan') || lowerPrompt.includes('tanpa hewani')) preferences.push('vegan')
    if (lowerPrompt.includes('bebas gluten') || lowerPrompt.includes('tanpa gluten')) preferences.push('gluten-free')
    if (lowerPrompt.includes('sehat') || lowerPrompt.includes('bergizi')) preferences.push('healthy')
    if (lowerPrompt.includes('cepat') || lowerPrompt.includes('kilat') || lowerPrompt.includes('praktis')) preferences.push('quick')
    if (lowerPrompt.includes('mudah') || lowerPrompt.includes('gampang') || lowerPrompt.includes('sederhana')) preferences.push('easy')
    if (lowerPrompt.includes('pedas') || lowerPrompt.includes('panas')) preferences.push('spicy')
    if (lowerPrompt.includes('manis')) preferences.push('sweet')
    if (lowerPrompt.includes('gurih')) preferences.push('savory')
    
    return preferences
  }
  
  const handleSaveRecipe = async (recipe: GeneratedRecipe) => {
    try {
      await addRecipe({
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prep_time: recipe.prepTime,
        cook_time: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        cuisine: recipe.cuisine,
        tags: recipe.tags
      })
      
      animeToast.saveSuccess(language === 'id')
    } catch (error) {
      kawaiiToast.error('Failed to save recipe', language === 'id')
    }
  }
  
  const toggleIngredient = (ingredientName: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredientName)
        ? prev.filter(name => name !== ingredientName)
        : [...prev, ingredientName]
    )
  }
  
  const handleClearChat = () => {
    setShowClearConfirmModal(true)
  }

  const confirmClearChat = async () => {
    try {
      console.log('🗑️ Clearing chat history...')
      await clearChatHistory()
      startNewChatSession()
      animeToast.deleteSuccess(language === 'id')
      setShowClearConfirmModal(false)
      console.log('✅ Chat cleared and new session started')
    } catch (error) {
      console.error('❌ Failed to clear chat:', error)
      kawaiiToast.error(language === 'en' ? 'Failed to clear conversation' : 'Gagal menghapus percakapan', language === 'id')
      setShowClearConfirmModal(false)
    }
  }
  
  const handleViewRecipe = (recipe: GeneratedRecipe) => {
    setSelectedRecipe(recipe)
    setIsRecipeModalOpen(true)
  }
  
  const addMessage = async (type: 'user' | 'ai' | 'system' | 'recipe', content: string, metadata: any = {}) => {
    try {
      console.log(`💬 Adding ${type} message:`, content.substring(0, 50) + '...')
      const result = await addChatMessage({
        message_type: type,
        content,
        metadata
      })
      console.log('✅ Message added successfully')
      return result
    } catch (error) {
      console.error('❌ Failed to add message:', error)
      throw error
    }
  }
  
  const clearSelectedIngredients = () => {
    setSelectedIngredients([]);
    animeToast.deleteSuccess(language === 'id');
  }
  
  // Translations
  const translations = {
    aiChef: language === 'en' ? 'AI Chef' : 'AI Chef',
    assistant: language === 'en' ? 'Your personal culinary assistant' : 'Asisten kuliner pribadi Anda',
    testAI: language === 'en' ? 'Test AI' : 'Tes AI',
    clearChat: language === 'en' ? 'New Chat' : 'Chat Baru',
    selectIngredients: language === 'en' ? 'Select Ingredients for Your Recipe' : 'Pilih Bahan untuk Resep Anda',
    selected: language === 'en' ? 'selected' : 'dipilih',
    searchIngredients: language === 'en' ? 'Search ingredients...' : 'Cari bahan...',
    filter: language === 'en' ? 'Filter' : 'Filter',
    noIngredientsFound: language === 'en' ? 'No ingredients found matching your search.' : 'Tidak ada bahan yang sesuai dengan pencarian Anda.',
    noIngredientsAvailable: language === 'en' ? 'No ingredients available in your inventory' : 'Tidak ada bahan tersedia di inventori Anda',
    addIngredientsFirst: language === 'en' ? 'Add ingredients to your inventory first' : 'Tambahkan bahan ke inventori Anda terlebih dahulu',
    addIngredients: language === 'en' ? 'Add Ingredients' : 'Tambah Bahan',
    tip: language === 'en' ? 'Tip: Select ingredients above before asking for a recipe for better results' : 'Tip: Pilih bahan di atas sebelum meminta resep untuk hasil yang lebih baik',
    askToCook: language === 'en' ? 'Ask me to cook something with your ingredients...' : 'Minta saya memasak sesuatu dengan bahan Anda...',
    ingredients: language === 'en' ? 'Ingredients' : 'Bahan',
    done: language === 'en' ? 'Done' : 'Selesai',
    clearAll: language === 'en' ? 'Clear All' : 'Hapus Semua',
    selectedIngredients: language === 'en' ? 'Selected Ingredients:' : 'Bahan Terpilih:',
    ingredientsSelected: language === 'en' ? 'ingredients selected' : 'bahan dipilih',
    viewRecipe: language === 'en' ? 'View Recipe' : 'Lihat Resep',
    saveRecipe: language === 'en' ? 'Save Recipe' : 'Simpan Resep',
    selectIngredientsTitle: language === 'en' ? 'Select Ingredients' : 'Pilih Bahan',
    selectIngredientsDesc: language === 'en' ? 'Select ingredients to use in your recipe' : 'Pilih bahan untuk digunakan dalam resep Anda',
    readyToCook: language === 'en' ? 'Ready to Cook?' : 'Siap Memasak?',
    startChatDesc: language === 'en' ? 'Start a new chat to get recipe ideas and cooking tips' : 'Mulai chat baru untuk mendapatkan ide resep dan tips memasak',
    startNewChat: language === 'en' ? 'Start New Chat' : 'Mulai Chat Baru',

  }
  
  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col relative">
      <div className="p-4 md:p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{translations.aiChef}</h1>
                <p className="text-sm text-gray-600">{translations.assistant}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                leftIcon={<RotateCcw className="w-4 h-4" />}
                onClick={handleTestConnection}
                disabled={isGeneratingRecipe}
                className="hidden sm:flex"
              >
                {translations.testAI}
              </Button>
            </div>
          </div>
          
          {/* Collapsible Ingredients Panel */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <button 
                onClick={() => setShowIngredientsPanel(!showIngredientsPanel)}
                className="flex items-center gap-2 text-primary-700 font-medium"
              >
                <Package className="w-5 h-5" />
                <span>{translations.selectIngredients}</span>
                {showIngredientsPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              <div className="flex items-center gap-2">
                <Badge variant="primary" className="text-xs">
                  {selectedIngredients.length} {translations.selected}
                </Badge>
                {selectedIngredients.length > 0 && (
                  <button 
                    onClick={clearSelectedIngredients}
                    className="p-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            
            {showIngredientsPanel && (
              <Card className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-primary-100">
                <div className="flex flex-col gap-4">
                  {ingredients.length > 0 ? (
                    <>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <SearchBar
                            placeholder={translations.searchIngredients}
                            value={searchIngredient}
                            onChange={(value) => setSearchIngredient(value)}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Filter className="w-4 h-4" />}
                          onClick={() => setShowFilterModal(true)}
                          className="whitespace-nowrap"
                        >
                          {translations.filter}
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
                        {filteredIngredients.length > 0 ? (
                          filteredIngredients.map((ingredient) => (
                            <Badge 
                              key={ingredient.id} 
                              variant={selectedIngredients.includes(ingredient.name) ? 'primary' : 'outline'}
                              onClick={() => toggleIngredient(ingredient.name)}
                              className="cursor-pointer text-sm py-1.5 px-3 hover:bg-primary-50 transition-colors flex items-center gap-1 active:scale-95 active:bg-primary-100"
                            >
                              {selectedIngredients.includes(ingredient.name) && (
                                <Check className="w-3 h-3" />
                              )}
                              {ingredient.name}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 p-2">{translations.noIngredientsFound}</p>
                        )}
                      </div>
                      
                      {selectedIngredients.length > 0 && (
                        <div className="bg-primary-50 p-3 rounded-lg border border-primary-100">
                          <p className="text-sm font-medium text-primary-700">
                            {translations.selected}: {selectedIngredients.join(', ')}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
                        <AlertCircle className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-gray-700 mb-2">{translations.noIngredientsAvailable}</p>
                        <p className="text-sm text-gray-500 mb-4">{translations.addIngredientsFirst}</p>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Plus className="w-4 h-4" />}
                          onClick={() => setActiveView('inventory')}
                        >
                          {translations.addIngredients}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
            
            {ingredients.length > 0 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                {translations.tip}
              </p>
            )}
          </div>
        </div>
        
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          <AnimatePresence>
            {messages.length > 0 ? (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'recipe' ? (
                    <Card className="max-w-3xl w-full bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 overflow-hidden">
                      <div className="relative">
                        {/* Recipe Header */}
                        <div className="bg-gradient-to-r from-primary-500 via-accent-500 to-secondary-500 p-4 text-white">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-lg">
                              <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-white">{message.recipe?.title}</h3>
                              <p className="text-sm text-white/80">{message.recipe?.cuisine || 'Custom'} {language === 'en' ? 'Recipe' : 'Resep'}</p>
                            </div>
                          </div>
                          
                          <p className="text-white/90 mb-4 text-sm">{message.recipe?.description}</p>
                        </div>
                        
                        {/* Recipe Stats */}
                        <div className="p-4 bg-white">
                          <div className="flex flex-wrap gap-4 mb-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="w-4 h-4 text-primary-500" />
                              <span>{message.recipe?.prepTime + message.recipe?.cookTime} {language === 'en' ? 'min' : 'menit'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Users className="w-4 h-4 text-primary-500" />
                              <span>{message.recipe?.servings} {language === 'en' ? 'servings' : 'porsi'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Utensils className="w-4 h-4 text-primary-500" />
                              <span>{message.recipe?.difficulty}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {message.recipe?.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" size="sm" className="px-3 py-1">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2 mt-4">
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={<BookOpen className="w-4 h-4" />}
                              onClick={() => handleViewRecipe(message.recipe!)}
                              className="flex-1"
                            >
                              {translations.viewRecipe}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<Heart className="w-4 h-4" />}
                              onClick={() => handleSaveRecipe(message.recipe!)}
                              className="flex-1"
                            >
                              {translations.saveRecipe}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <div 
                      className={`rounded-2xl px-4 py-3 max-w-[85%] sm:max-w-[75%] ${
                        message.type === 'user' 
                          ? 'bg-primary-500 text-white ml-auto' 
                          : 'bg-white border border-gray-200 mr-auto'
                      }`}
                    >
                      <p className={message.type === 'user' ? 'text-white' : 'text-gray-800'}>
                        {message.content}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-64 p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {translations.readyToCook}
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  {translations.startChatDesc}
                </p>
                <Button 
                  variant="primary"
                  size="lg"
                  leftIcon={<Sparkles className="w-5 h-5" />}
                  onClick={async () => {
                    try {
                      await addMessage('ai', "Hello! I'm your AI Chef assistant. I can help you create amazing recipes using the ingredients you have, answer cooking questions, and provide culinary tips. What would you like to cook today?", { isWelcome: true })
                      localStorage.setItem('welcomeMessageShown', 'true')
                    } catch (error) {
                      console.error('Failed to add welcome message:', error)
                      toast.error('Failed to start new chat')
                    }
                  }}
                >
                  {translations.startNewChat}
                </Button>
              </div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        

        
        {/* Sticky Ingredient Filter Button (Mobile) */}
        <div className="fixed bottom-20 right-4 z-10">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowFilterModal(true)}
            className="rounded-full shadow-lg w-14 h-14 flex items-center justify-center p-0 bg-gradient-to-r from-blue-500 to-purple-600 border-2 border-white"
          >
            <div className="flex flex-col items-center justify-center">
              <ListFilter className="w-6 h-6" />
              <span className="text-[10px] font-medium mt-0.5">{translations.ingredients}</span>
            </div>
            {selectedIngredients.length > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center border border-white">
                {selectedIngredients.length}
              </span>
            )}
          </Button>
        </div>
        
        {/* Input area */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder={translations.askToCook}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                disabled={isGeneratingRecipe}
                className="pr-10"
              />
              {isGeneratingRecipe && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                </div>
              )}
            </div>
            <Button
              variant="primary"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isGeneratingRecipe}
            >
              <Send className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              onClick={handleClearChat}
              className="text-red-600 hover:bg-red-50"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Language Detection Indicator */}
          {inputValue.trim() && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                <span>
                  {detectLanguage(inputValue) === 'id' 
                    ? 'Akan merespons dalam Bahasa Indonesia' 
                    : 'Will respond in English'
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Recipe modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          isOpen={isRecipeModalOpen}
          onClose={() => setIsRecipeModalOpen(false)}
          recipe={{
            id: 'temp',
            title: selectedRecipe.title,
            description: selectedRecipe.description,
            ingredients: selectedRecipe.ingredients,
            instructions: selectedRecipe.instructions,
            prep_time: selectedRecipe.prepTime,
            cook_time: selectedRecipe.cookTime,
            servings: selectedRecipe.servings,
            difficulty: selectedRecipe.difficulty,
            cuisine: selectedRecipe.cuisine,
            tags: selectedRecipe.tags,
            user_id: '',
            created_at: new Date().toISOString()
          }}
          onSave={() => handleSaveRecipe(selectedRecipe)}
        />
      )}
      
      {/* Ingredients Filter Modal (Mobile) */}
      <AnimatePresence>
        {showFilterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterModal(false)}
              className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-2xl shadow-strong max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{translations.selectIngredientsTitle}</h3>
                    <p className="text-xs text-gray-500">{translations.selectIngredientsDesc}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Search */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <SearchBar
                  placeholder={translations.searchIngredients}
                  value={searchIngredient}
                  onChange={(value) => setSearchIngredient(value)}
                />
              </div>
              
              {/* Ingredients List */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {Object.entries(ingredientsByCategory).length > 0 ? (
                  Object.entries(ingredientsByCategory).map(([category, items]) => (
                    <div key={category} className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-primary-500 mr-2"></span>
                        {category}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {items.map(ingredient => (
                          <Badge
                            key={ingredient.id}
                            variant={selectedIngredients.includes(ingredient.name) ? 'primary' : 'outline'}
                            onClick={() => toggleIngredient(ingredient.name)}
                            className="cursor-pointer text-sm py-1.5 px-3 hover:bg-primary-50 transition-colors flex items-center gap-1 active:scale-95 active:bg-primary-100"
                          >
                            {selectedIngredients.includes(ingredient.name) && (
                              <Check className="w-3 h-3" />
                            )}
                            {ingredient.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))
                ) : ingredients.length > 0 ? (
                  <div className="flex flex-col items-center justify-center h-40">
                    <p className="text-gray-500">{translations.noIngredientsFound}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-8">
                    <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-gray-700 mb-2">{translations.noIngredientsAvailable}</p>
                      <p className="text-sm text-gray-500 mb-4">{translations.addIngredientsFirst}</p>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Plus className="w-4 h-4" />}
                        onClick={() => {
                          setShowFilterModal(false);
                          setActiveView('inventory');
                        }}
                      >
                        {translations.addIngredients}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Selected Ingredients Summary */}
              {selectedIngredients.length > 0 && (
                <div className="p-4 border-t border-gray-200 bg-primary-50">
                  <h4 className="text-sm font-medium text-primary-700 mb-2">{translations.selectedIngredients}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedIngredients.map((ing, idx) => (
                      <Badge 
                        key={idx}
                        variant="primary"
                        className="py-1 px-2 text-xs flex items-center gap-1"
                      >
                        {ing}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleIngredient(ing);
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Footer */}
              <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-white">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{selectedIngredients.length}</span> {translations.ingredientsSelected}
                  </p>
                </div>
                <div className="flex gap-2">
                  {selectedIngredients.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelectedIngredients}
                    >
                      {translations.clearAll}
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowFilterModal(false)}
                  >
                    {translations.done}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Kawaii Clear Chat Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirmModal(false)}
              className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 25px 50px -12px rgba(102, 126, 234, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              }}
            >
              {/* Cute decorative elements */}
              <div className="absolute top-4 right-4 text-white opacity-20">
                <div className="flex gap-1">
                  <span className="text-2xl">✨</span>
                  <span className="text-xl">🌸</span>
                  <span className="text-lg">💫</span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-8 text-center">
                {/* Cute avatar */}
                <div className="w-20 h-20 mx-auto mb-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <div className="text-4xl">🥺</div>
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-3">
                  {language === 'en' ? 'Are you sure desu?' : 'Yakin nih desu?'}
                </h3>
                
                {/* Message */}
                <p className="text-white text-opacity-90 mb-8 leading-relaxed">
                  {language === 'en' 
                    ? 'AI-chan will miss our conversation... 🥺 Starting fresh means saying goodbye to our chat history-nya~'
                    : 'AI-chan akan kangen obrolan kita... 🥺 Memulai yang baru berarti bye-bye sama history chat kita~'
                  }
                </p>
                
                {/* Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowClearConfirmModal(false)}
                    className="flex-1 px-6 py-3 bg-white bg-opacity-20 text-white font-semibold rounded-2xl backdrop-blur-sm border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-200"
                  >
                    {language === 'en' ? 'Keep chatting 💕' : 'Lanjut ngobrol 💕'}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={confirmClearChat}
                    className="flex-1 px-6 py-3 bg-white text-purple-600 font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-200 shadow-lg"
                  >
                    {language === 'en' ? 'Start fresh ✨' : 'Mulai baru ✨'}
                  </motion.button>
                </div>
                
                {/* Cute footer message */}
                <p className="text-white text-opacity-70 text-xs mt-4">
                  {language === 'en' ? 'AI-chan will always remember you~ 🌸' : 'AI-chan akan selalu ingat kamu~ 🌸'}
                </p>
              </div>
              
              {/* Bottom decoration */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-50"></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}