import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  Users, 
  Utensils,
  Heart,
  BookOpen,
  Plus,
  ChefHat,
  Globe
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { SearchBar } from '../ui/SearchBar'
import { RecipeDetailModal } from './RecipeDetailModal'
import { FilterPanel, DropdownFilter, FilterCategory } from '../ui/FilterPanel'
import type { GeneratedRecipe } from '../../lib/lunos'

export const RecipeManager: React.FC = () => {
  const { recipes, fetchRecipes, setCurrentRecipe, setActiveView, language } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([])
  const [selectedCuisine, setSelectedCuisine] = useState<string[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<GeneratedRecipe | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  useEffect(() => {
    fetchRecipes()
  }, [])
  
  // Get unique difficulties and cuisines from recipes
  const difficulties = Array.from(new Set(recipes.map(r => r.difficulty))).filter(Boolean)
  const cuisines = Array.from(new Set(recipes.map(r => r.cuisine))).filter(Boolean)
  
  // Translations
  const translations = {
    recipeCollection: language === 'en' ? 'Recipe Collection' : 'Koleksi Resep',
    savedRecipes: language === 'en' ? 'Your saved recipes and AI-generated creations' : 'Resep tersimpan dan kreasi AI Anda',
    generateRecipe: language === 'en' ? 'Generate Recipe' : 'Buat Resep',
    searchRecipes: language === 'en' ? 'Search recipes...' : 'Cari resep...',
    filters: language === 'en' ? 'Filters' : 'Filter',
    difficulty: language === 'en' ? 'Difficulty' : 'Tingkat Kesulitan',
    cuisine: language === 'en' ? 'Cuisine' : 'Masakan',
    all: language === 'en' ? 'All' : 'Semua',
    easy: language === 'en' ? 'Easy' : 'Mudah',
    medium: language === 'en' ? 'Medium' : 'Sedang',
    hard: language === 'en' ? 'Hard' : 'Sulit',
    min: language === 'en' ? 'min' : 'menit',
    servings: language === 'en' ? 'servings' : 'porsi',
    viewRecipe: language === 'en' ? 'View Recipe' : 'Lihat Resep',
    noRecipesFound: language === 'en' ? 'No recipes found' : 'Tidak ada resep ditemukan',
    adjustFilters: language === 'en' ? 'Try adjusting your search or filters' : 'Coba sesuaikan pencarian atau filter Anda',
    startGenerating: language === 'en' ? 'Start by generating your first recipe with AI' : 'Mulai dengan membuat resep pertama Anda dengan AI',
    clearAll: language === 'en' ? 'Clear All' : 'Hapus Semua',
    apply: language === 'en' ? 'Apply' : 'Terapkan',
    selected: language === 'en' ? 'selected' : 'dipilih',
    sort: language === 'en' ? 'Sort' : 'Urut',
    newest: language === 'en' ? 'Newest' : 'Terbaru',
    oldest: language === 'en' ? 'Oldest' : 'Terlama',
    popular: language === 'en' ? 'Popular' : 'Populer',
  }
  
  // Define filter categories
  const filterCategories: FilterCategory[] = [
    {
      id: 'difficulty',
      label: translations.difficulty,
      icon: <ChefHat className="w-4 h-4" />,
      options: difficulties.map(difficulty => ({
        id: difficulty,
        label: translateDifficulty(difficulty),
      }))
    },
    {
      id: 'cuisine',
      label: translations.cuisine,
      icon: <Globe className="w-4 h-4" />,
      options: cuisines.map(cuisine => ({
        id: cuisine,
        label: cuisine,
      }))
    }
  ]
  
  // Define selected filters object
  const selectedFilters = {
    difficulty: selectedDifficulty,
    cuisine: selectedCuisine
  }
  
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filter by difficulty - if none selected, show all
    const matchesDifficulty = selectedDifficulty.length === 0 || 
                             selectedDifficulty.includes(recipe.difficulty)
    
    // Filter by cuisine - if none selected, show all
    const matchesCuisine = selectedCuisine.length === 0 || 
                          selectedCuisine.includes(recipe.cuisine)
    
    return matchesSearch && matchesDifficulty && matchesCuisine
  })
  
  const handleRecipeClick = (recipe: any) => {
    // Convert database recipe to GeneratedRecipe format
    const convertedRecipe: GeneratedRecipe = {
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      prepTime: recipe.prep_time,
      cookTime: recipe.cook_time,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      cuisine: recipe.cuisine,
      tags: recipe.tags || [],
      tips: [],
      story: ''
    }
    
    setSelectedRecipe(convertedRecipe)
    setIsModalOpen(true)
  }
  
  // Handle filter change
  const handleFilterChange = (categoryId: string, optionId: string) => {
    if (categoryId === 'difficulty') {
      if (selectedDifficulty.includes(optionId)) {
        setSelectedDifficulty(selectedDifficulty.filter(d => d !== optionId))
      } else {
        setSelectedDifficulty([...selectedDifficulty, optionId])
      }
    } else if (categoryId === 'cuisine') {
      if (selectedCuisine.includes(optionId)) {
        setSelectedCuisine(selectedCuisine.filter(c => c !== optionId))
      } else {
        setSelectedCuisine([...selectedCuisine, optionId])
      }
    }
  }
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedDifficulty([])
    setSelectedCuisine([])
  }
  
  // Translate difficulty
  function translateDifficulty(difficulty: string) {
    if (language === 'id') {
      if (difficulty.toLowerCase() === 'easy') return 'Mudah'
      if (difficulty.toLowerCase() === 'medium') return 'Sedang'
      if (difficulty.toLowerCase() === 'hard') return 'Sulit'
    }
    return difficulty
  }
  
  // Sorting options
  const sortOptions = [
    { id: 'newest', label: translations.newest },
    { id: 'oldest', label: translations.oldest },
    { id: 'popular', label: translations.popular }
  ]
  
  const [sortOption, setSortOption] = useState('newest')
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{translations.recipeCollection}</h1>
          <p className="text-neutral-600">{translations.savedRecipes}</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setActiveView('ai-chat')}
        >
          {translations.generateRecipe}
        </Button>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1">
            <SearchBar
              placeholder={translations.searchRecipes}
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          
          {/* Sort Dropdown */}
          <DropdownFilter
            label={translations.sort}
            options={sortOptions}
            selectedOption={sortOption}
            onChange={(option) => setSortOption(option)}
          />
          
          {/* Filter Panel */}
          <FilterPanel
            categories={filterCategories}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            translations={{
              filters: translations.filters,
              clearAll: translations.clearAll,
              apply: translations.apply,
              selected: translations.selected
            }}
          />
        </div>
      </div>
      
      {/* Recipes Grid */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredRecipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <Card hover className="h-full flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      {recipe.title}
                    </h3>
                    <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
                      {recipe.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="primary" size="sm">
                        <Clock className="w-3 h-3 mr-1" />
                        {recipe.prep_time + recipe.cook_time} {translations.min}
                      </Badge>
                      <Badge variant="secondary" size="sm">
                        <Users className="w-3 h-3 mr-1" />
                        {recipe.servings} {translations.servings}
                      </Badge>
                      <Badge variant="accent" size="sm">
                        <Utensils className="w-3 h-3 mr-1" />
                        {translateDifficulty(recipe.difficulty)}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {recipe.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="neutral" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4 border-t border-neutral-200">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<BookOpen className="w-4 h-4" />}
                      onClick={() => handleRecipeClick(recipe)}
                      className="flex-1"
                    >
                      {translations.viewRecipe}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Heart className="w-4 h-4" />}
                    >
                      <span className="sr-only">Favorite</span>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">{translations.noRecipesFound}</h3>
          <p className="text-neutral-600 mb-4">
            {searchTerm || selectedDifficulty.length > 0 || selectedCuisine.length > 0
              ? translations.adjustFilters
              : translations.startGenerating
            }
          </p>
          <Button
            variant="primary"
            onClick={() => setActiveView('ai-chat')}
          >
            {translations.generateRecipe}
          </Button>
        </Card>
      )}
      
      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recipe={selectedRecipe}
      />
    </div>
  )
}