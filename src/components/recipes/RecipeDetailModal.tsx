import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Clock, 
  Users, 
  ChefHat, 
  Utensils,
  Star,
  Heart,
  Share2,
  ArrowLeft,
  Download,
  Check
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import type { GeneratedRecipe } from '../../lib/lunos'
import { useStore } from '../../store/useStore'
import toast from 'react-hot-toast'

interface RecipeDetailModalProps {
  isOpen: boolean
  onClose: () => void
  recipe: GeneratedRecipe | null
  onSave?: () => void
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  isOpen,
  onClose,
  recipe,
  onSave
}) => {
  const { language } = useStore()
  const [isGeneratingShareImage, setIsGeneratingShareImage] = useState(false)
  const [shareImageGenerated, setShareImageGenerated] = useState(false)
  
  if (!recipe) return null
  
  // Translations
  const translations = {
    saveRecipe: language === 'en' ? 'Save Recipe' : 'Simpan Resep',
    share: language === 'en' ? 'Share' : 'Bagikan',
    shareGenerating: language === 'en' ? 'Generating...' : 'Membuat...',
    shareDownload: language === 'en' ? 'Download Image' : 'Unduh Gambar',
    shareReady: language === 'en' ? 'Image Ready!' : 'Gambar Siap!',
    ingredients: language === 'en' ? 'Ingredients' : 'Bahan-bahan',
    instructions: language === 'en' ? 'Instructions' : 'Instruksi',
    chefTips: language === 'en' ? 'Chef\'s Tips' : 'Tips Chef',
    recipeStory: language === 'en' ? 'Recipe Story' : 'Cerita Resep',
    tags: language === 'en' ? 'Tags' : 'Tag',
    minutes: language === 'en' ? 'minutes' : 'menit',
    servings: language === 'en' ? 'servings' : 'porsi',
    level: language === 'en' ? 'level' : 'level',
    easyLevel: language === 'en' ? 'easy' : 'mudah',
    mediumLevel: language === 'en' ? 'medium' : 'sedang',
    hardLevel: language === 'en' ? 'hard' : 'sulit',
    back: language === 'en' ? 'Back' : 'Kembali',
    prepTime: language === 'en' ? 'Prep' : 'Persiapan',
    cookTime: language === 'en' ? 'Cook' : 'Memasak',
    totalTime: language === 'en' ? 'Total' : 'Total'
  }
  
  // Translate difficulty level
  const translateDifficulty = (difficulty: string) => {
    if (language === 'id') {
      if (difficulty.toLowerCase() === 'easy') return 'mudah'
      if (difficulty.toLowerCase() === 'medium') return 'sedang'
      if (difficulty.toLowerCase() === 'hard') return 'sulit'
    }
    return difficulty
  }
  
  // Handle share button click - simulate generating a shareable image
  const handleShareClick = () => {
    setIsGeneratingShareImage(true)
    setShareImageGenerated(false)
    
    // Simulate generating a nice shareable image
    setTimeout(() => {
      setIsGeneratingShareImage(false)
      setShareImageGenerated(true)
      toast.success(language === 'en' ? 'Recipe image created!' : 'Gambar resep telah dibuat!')
    }, 2000)
  }
  
  // Handle download of the generated image
  const handleDownloadImage = () => {
    // In a real implementation, this would download the actual generated image
    toast.success(language === 'en' ? 'Recipe image downloaded!' : 'Gambar resep telah diunduh!')
    setShareImageGenerated(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-xl md:rounded-3xl shadow-strong max-w-4xl w-full max-h-[100vh] md:max-h-[90vh] overflow-y-auto"
          >
            {/* Close button - always visible */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm text-gray-700 hover:text-gray-900 rounded-full shadow-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Back button - mobile only */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 z-10 p-2 md:hidden bg-white/80 backdrop-blur-sm text-gray-700 hover:text-gray-900 rounded-full shadow-md transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* Header */}
            <div className="relative">
              {/* Hero Section with gradient background */}
              <div className="bg-gradient-to-r from-primary-500 via-accent-500 to-secondary-500 px-6 py-16 md:p-12 text-white">
                <div className="max-w-3xl mx-auto">
                  {/* Cuisine & Difficulty Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-1.5">
                      {recipe.cuisine}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-1.5">
                      {translateDifficulty(recipe.difficulty)}
                    </Badge>
                  </div>
                  
                  {/* Recipe Title */}
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                    {recipe.title}
                  </h1>
                  
                  {/* Recipe Description */}
                  <p className="text-white/90 text-lg leading-relaxed mb-8">
                    {recipe.description}
                  </p>
                </div>
              </div>
              
              {/* Recipe Stats - Floating Card */}
              <div className="px-4 md:px-8 -mt-8 md:-mt-12 mb-8 relative z-10">
                <Card className="p-6 shadow-lg bg-white rounded-xl flex flex-wrap gap-6 justify-around">
                  {/* Prep Time */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center mb-2">
                      <Clock className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="text-sm text-gray-500">{translations.prepTime}</div>
                    <div className="font-semibold">{recipe.prepTime} {translations.minutes}</div>
                  </div>
                  
                  {/* Cook Time */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center mb-2">
                      <Utensils className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="text-sm text-gray-500">{translations.cookTime}</div>
                    <div className="font-semibold">{recipe.cookTime} {translations.minutes}</div>
                  </div>
                  
                  {/* Total Time */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-accent-50 rounded-full flex items-center justify-center mb-2">
                      <Clock className="w-5 h-5 text-accent-600" />
                    </div>
                    <div className="text-sm text-gray-500">{translations.totalTime}</div>
                    <div className="font-semibold">{recipe.prepTime + recipe.cookTime} {translations.minutes}</div>
                  </div>
                  
                  {/* Servings */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-secondary-50 rounded-full flex items-center justify-center mb-2">
                      <Users className="w-5 h-5 text-secondary-600" />
                    </div>
                    <div className="text-sm text-gray-500">{translations.servings}</div>
                    <div className="font-semibold">{recipe.servings}</div>
                  </div>
                  
                  {/* Difficulty */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-2">
                      <ChefHat className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-sm text-gray-500">{translations.level}</div>
                    <div className="font-semibold">{translateDifficulty(recipe.difficulty)}</div>
                  </div>
                </Card>
              </div>
            </div>
            
            {/* Content */}
            <div className="px-6 md:px-12 pb-12">
              <div className="max-w-3xl mx-auto">
                {/* Ingredients & Instructions */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  {/* Ingredients */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Utensils className="w-4 h-4 text-primary-600" />
                      </div>
                      {translations.ingredients}
                    </h2>
                    <div className="space-y-3">
                      {recipe.ingredients.map((ingredient, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0"
                        >
                          <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />
                          <span className="text-gray-800">{ingredient}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Instructions */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center">
                        <ChefHat className="w-4 h-4 text-accent-600" />
                      </div>
                      {translations.instructions}
                    </h2>
                    <div className="space-y-6">
                      {recipe.instructions.map((instruction, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex gap-4"
                        >
                          <div className="w-8 h-8 bg-accent-100 text-accent-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-gray-800 leading-relaxed">{instruction}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Tips & Story */}
                {(recipe.tips && recipe.tips.length > 0) || recipe.story ? (
                  <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {/* Chef's Tips */}
                    {recipe.tips && recipe.tips.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                          <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                            <Star className="w-4 h-4 text-secondary-600" />
                          </div>
                          {translations.chefTips}
                        </h2>
                        <div className="space-y-4">
                          {recipe.tips.map((tip, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-3 p-4 rounded-xl bg-secondary-50/50 border border-secondary-100"
                            >
                              <Star className="w-4 h-4 text-secondary-500 mt-1 flex-shrink-0" />
                              <p className="text-gray-700">{tip}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Recipe Story */}
                    {recipe.story && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">{translations.recipeStory}</h2>
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                          <p className="text-gray-700 leading-relaxed italic">
                            {recipe.story}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
                
                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">{translations.tags}</h2>
                    <div className="flex flex-wrap gap-2">
                      {recipe.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" size="sm" className="px-3 py-1.5">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                  {onSave && (
                    <Button
                      variant="primary"
                      leftIcon={<Heart className="w-5 h-5" />}
                      onClick={onSave}
                      className="flex-1"
                    >
                      {translations.saveRecipe}
                    </Button>
                  )}
                  
                  {/* Share button with different states */}
                  {shareImageGenerated ? (
                    <Button
                      variant="success"
                      leftIcon={<Download className="w-5 h-5" />}
                      onClick={handleDownloadImage}
                      className="flex-1"
                    >
                      {translations.shareDownload}
                    </Button>
                  ) : (
                    <Button
                      variant={isGeneratingShareImage ? "outline" : "outline"}
                      leftIcon={isGeneratingShareImage ? 
                        <span className="animate-spin"><Clock className="w-5 h-5" /></span> : 
                        <Share2 className="w-5 h-5" />
                      }
                      onClick={handleShareClick}
                      disabled={isGeneratingShareImage}
                      className="flex-1"
                    >
                      {isGeneratingShareImage ? translations.shareGenerating : translations.share}
                    </Button>
                  )}
                </div>
                
                {/* Share Preview - Show when image is generated */}
                {shareImageGenerated && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 border border-green-200 bg-green-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3 mb-3 text-green-700">
                      <Check className="w-5 h-5" />
                      <p className="font-medium">{translations.shareReady}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="aspect-[4/3] bg-gradient-to-br from-primary-500 via-accent-500 to-secondary-500 rounded-lg flex items-center justify-center">
                        <div className="text-center text-white p-6">
                          <h3 className="text-xl font-bold mb-2">{recipe.title}</h3>
                          <p className="text-sm opacity-90">{recipe.description.substring(0, 120)}...</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
} 