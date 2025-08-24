import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, 
  BookOpen, 
  AlertTriangle,
  Sparkles,
  ChefHat,
  Utensils,
  Plus,
  ArrowRight,
  Star,
  Zap,
  Clock,
  Search,
  Heart,
  Flame,
  Soup,
  Trophy,
  TrendingUp
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { StatsCard } from './StatsCard'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

export const Dashboard: React.FC = () => {
  const { 
    ingredients, 
    recipes, 
    fetchIngredients, 
    fetchRecipes, 
    setActiveView,
    user,
    language
  } = useStore()
  
  useEffect(() => {
    fetchIngredients()
    fetchRecipes()
  }, [])
  
  // Calculate stats
  const expiringIngredients = ingredients.filter(ing => {
    if (!ing.expiry_date) return false
    const expiryDate = new Date(ing.expiry_date)
    const today = new Date()
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays >= 0
  })
  
  const recentRecipes = recipes.slice(0, 4)
  const popularIngredients = ingredients.slice(0, 5)
  
  // Translations
  const translations = {
    welcomeBack: language === 'en' ? 'Welcome back' : 'Selamat datang kembali',
    chef: language === 'en' ? 'Chef' : 'Chef',
    readyToCreate: language === 'en' ? 'Ready to create something delicious today?' : 'Siap membuat sesuatu yang lezat hari ini?',
    aiPowered: language === 'en' ? 'Your AI-powered kitchen assistant is ready to help you discover new recipes and manage ingredients.' : 'Asisten dapur bertenaga AI Anda siap membantu menemukan resep baru dan mengelola bahan.',
    generateNewRecipe: language === 'en' ? 'Generate New Recipe' : 'Buat Resep Baru',
    addIngredients: language === 'en' ? 'Add Ingredients' : 'Tambah Bahan',
    quickActions: language === 'en' ? 'Quick Actions' : 'Tindakan Cepat',
    stockKitchen: language === 'en' ? 'Stock your kitchen inventory' : 'Isi inventaris dapur Anda',
    aiRecipeCreation: language === 'en' ? 'AI-powered recipe creation' : 'Pembuatan resep dengan AI',
    browseRecipes: language === 'en' ? 'Browse your recipe collection' : 'Jelajahi koleksi resep Anda',
    getStarted: language === 'en' ? 'Get started' : 'Mulai',
    kitchenOverview: language === 'en' ? 'Kitchen Overview' : 'Ikhtisar Dapur',
    totalIngredients: language === 'en' ? 'Total Ingredients' : 'Total Bahan',
    savedRecipes: language === 'en' ? 'Saved Recipes' : 'Resep Tersimpan',
    expiringSoon: language === 'en' ? 'Expiring Soon' : 'Segera Kedaluwarsa',
    useWithin: language === 'en' ? 'Use within 3 days' : 'Gunakan dalam 3 hari',
    thisWeek: language === 'en' ? 'this week' : 'minggu ini',
    newRecipes: language === 'en' ? 'new recipes' : 'resep baru',
    recentRecipes: language === 'en' ? 'Recent Recipes' : 'Resep Terbaru',
    viewAll: language === 'en' ? 'View all' : 'Lihat semua',
    mins: language === 'en' ? 'mins' : 'menit',
    noRecipesYet: language === 'en' ? 'No recipes yet' : 'Belum ada resep',
    generateFirstRecipe: language === 'en' ? 'Generate your first recipe' : 'Buat resep pertama Anda',
    popularIngredients: language === 'en' ? 'Popular Ingredients' : 'Bahan Populer',
    lowStock: language === 'en' ? 'Low Stock' : 'Stok Rendah',
    viewInventory: language === 'en' ? 'View inventory' : 'Lihat inventaris',
    noIngredients: language === 'en' ? 'No ingredients yet' : 'Belum ada bahan',
    addFirstIngredient: language === 'en' ? 'Add your first ingredient' : 'Tambahkan bahan pertama Anda',
    needInspiration: language === 'en' ? 'Need inspiration?' : 'Butuh inspirasi?',
    aiPoweredSuggestions: language === 'en' ? 'Get AI-powered recipe suggestions' : 'Dapatkan saran resep bertenaga AI',
    askAiChef: language === 'en' ? 'Ask AI Chef' : 'Tanya Chef AI',
    trendingRecipes: language === 'en' ? 'Trending Recipes' : 'Resep Tren',
    exploreNew: language === 'en' ? 'Explore new cooking ideas' : 'Jelajahi ide memasak baru',
  }

  const quickActions = [
    {
      title: translations.addIngredients,
      description: translations.stockKitchen,
      icon: <Package className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      action: () => setActiveView('inventory')
    },
    {
      title: translations.generateNewRecipe,
      description: translations.aiRecipeCreation,
      icon: <Sparkles className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      action: () => setActiveView('ai-chat')
    },
    {
      title: translations.recentRecipes,
      description: translations.browseRecipes,
      icon: <BookOpen className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      action: () => setActiveView('recipes')
    }
  ]
  
  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Hero Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-3xl p-4 sm:p-6 md:p-8 text-white"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-4 right-4 w-32 h-32 bg-white bg-opacity-10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-yellow-300 bg-opacity-20 rounded-full blur-xl animate-bounce-gentle"></div>
            <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-pink-300 bg-opacity-15 rounded-full blur-lg animate-float"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-lg">
                    <ChefHat className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">{translations.welcomeBack}, {user?.email?.split('@')[0] || translations.chef}! 👨‍🍳</h1>
                    <p className="text-white text-opacity-90 text-base sm:text-lg">{translations.readyToCreate}</p>
                  </div>
                </motion.div>
                
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white text-opacity-80 text-base sm:text-lg mb-6 max-w-2xl"
                >
                  {translations.aiPowered}
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap gap-3 sm:gap-4"
                >
                  <Button 
                    variant="accent" 
                    size="lg"
                    leftIcon={<Sparkles className="w-5 h-5" />}
                    onClick={() => setActiveView('ai-chat')}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-lg border border-white border-opacity-30 text-sm sm:text-base"
                  >
                    {translations.generateNewRecipe}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="lg"
                    leftIcon={<Plus className="w-5 h-5" />}
                    onClick={() => setActiveView('inventory')}
                    className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-lg border border-white border-opacity-20 text-white text-sm sm:text-base"
                  >
                    {translations.addIngredients}
                  </Button>
                </motion.div>
              </div>
              
              {/* Stats Preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="hidden lg:flex flex-col gap-4 mt-6 lg:mt-0"
              >
                <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-4 border border-white border-opacity-30">
                  <div className="text-2xl font-bold">{ingredients.length}</div>
                  <div className="text-sm text-white text-opacity-80">{translations.totalIngredients}</div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-4 border border-white border-opacity-30">
                  <div className="text-2xl font-bold">{recipes.length}</div>
                  <div className="text-sm text-white text-opacity-80">{translations.savedRecipes}</div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{translations.quickActions}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group cursor-pointer"
                onClick={action.action}
              >
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-gray-200">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {action.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">{action.description}</p>
                  <div className="flex items-center text-gray-400 group-hover:text-gray-600 transition-colors">
                    <span className="text-sm font-medium">{translations.getStarted}</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{translations.kitchenOverview}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <StatsCard
              title={translations.totalIngredients}
              value={ingredients.length}
              change={`+3 ${translations.thisWeek}`}
              changeType="positive"
              icon={<Package className="w-6 h-6" />}
              color="primary"
            />
            <StatsCard
              title={translations.savedRecipes}
              value={recipes.length}
              change={`+2 ${translations.newRecipes}`}
              changeType="positive"
              icon={<BookOpen className="w-6 h-6" />}
              color="secondary"
            />
            <StatsCard
              title={translations.expiringSoon}
              value={expiringIngredients.length}
              change={translations.useWithin}
              changeType={expiringIngredients.length > 0 ? "warning" : "positive"}
              icon={<AlertTriangle className="w-6 h-6" />}
              color="warning"
            />
          </div>
        </motion.div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Recipes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="col-span-1 lg:col-span-2"
          >
            <Card className="h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">{translations.recentRecipes}</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => setActiveView('recipes')}
                >
                  {translations.viewAll}
                </Button>
              </div>
              
              <div className="space-y-4">
                {recentRecipes.length > 0 ? (
                  recentRecipes.map((recipe, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {recipe.image_url ? (
                          <img src={recipe.image_url} alt={recipe.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                            <Utensils className="w-8 h-8 text-orange-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 mb-1 truncate">{recipe.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{recipe.cooking_time || '30'} {translations.mins}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>{recipe.difficulty || 'Easy'}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {Array(5).fill(0).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < (recipe.rating || 4) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-gray-300" />
                    </div>
                    <h4 className="text-gray-500 mb-2">{translations.noRecipesYet}</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      leftIcon={<Plus className="w-4 h-4" />}
                      onClick={() => setActiveView('ai-chat')}
                    >
                      {translations.generateFirstRecipe}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
          
          {/* Popular Ingredients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">{translations.popularIngredients}</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => setActiveView('inventory')}
                >
                  {translations.viewInventory}
                </Button>
              </div>
              
              {popularIngredients.length > 0 ? (
                <div className="space-y-3">
                  {popularIngredients.map((ingredient, index) => (
                    <div key={index} className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{ingredient.name}</h4>
                            <p className="text-sm text-gray-500">{ingredient.quantity} {ingredient.unit}</p>
                          </div>
                        </div>
                        {ingredient.quantity < 2 && (
                          <Badge variant="warning" size="sm">{translations.lowStock}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-300" />
                  </div>
                  <h4 className="text-gray-500 mb-2">{translations.noIngredients}</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => setActiveView('inventory')}
                  >
                    {translations.addFirstIngredient}
                  </Button>
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{translations.needInspiration}</h4>
                    <p className="text-sm text-gray-500">{translations.aiPoweredSuggestions}</p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm"
                    leftIcon={<Zap className="w-4 h-4" />}
                    onClick={() => setActiveView('ai-chat')}
                  >
                    {translations.askAiChef}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
        
        {/* Trending Recipes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{translations.trendingRecipes}</h2>
            <Button 
              variant="ghost" 
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => setActiveView('ai-chat')}
            >
              {translations.exploreNew}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { name: 'Pasta Carbonara', icon: <Soup />, color: 'from-amber-400 to-orange-500' },
              { name: 'Chicken Curry', icon: <Flame />, color: 'from-red-400 to-red-600' },
              { name: 'Vegetable Stir Fry', icon: <Utensils />, color: 'from-green-400 to-green-600' },
              { name: 'Chocolate Cake', icon: <Heart />, color: 'from-pink-400 to-purple-600' }
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5, scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => setActiveView('ai-chat')}
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200">
                  <div className={`h-24 bg-gradient-to-r ${item.color} flex items-center justify-center`}>
                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                      {item.icon}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-500 font-medium">+24%</span>
                      </div>
                      <Badge variant="neutral" size="sm">Popular</Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}