import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Package, 
  Calendar,
  Edit3,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { SearchBar } from '../ui/SearchBar'
import { AddIngredientModal } from './AddIngredientModal'
import { translateCategory, categoryTranslations } from '../../lib/translations'

export const InventoryManager: React.FC = () => {
  const { ingredients, fetchIngredients, deleteIngredient, language } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  
  // Translations
  const translations = {
    kitchenInventory: language === 'en' ? 'Kitchen Inventory' : 'Inventaris Dapur',
    manageIngredients: language === 'en' ? 'Manage your ingredients and track expiry dates' : 'Kelola bahan dan pantau tanggal kedaluwarsa',
    addIngredient: language === 'en' ? 'Add Ingredient' : 'Tambah Bahan',
    searchIngredients: language === 'en' ? 'Search ingredients...' : 'Cari bahan...',
    expired: language === 'en' ? 'Expired' : 'Kedaluwarsa',
    expiresSoon: language === 'en' ? 'Expires Soon' : 'Segera Kedaluwarsa',
    useSoon: language === 'en' ? 'Use Soon' : 'Gunakan Segera',
    fresh: language === 'en' ? 'Fresh' : 'Segar',
    useWithinDays: language === 'en' ? 'Use within 3 days' : 'Gunakan dalam 3 hari',
    noIngredientsFound: language === 'en' ? 'No ingredients found' : 'Tidak ada bahan ditemukan',
    adjustFilters: language === 'en' ? 'Try adjusting your search' : 'Coba sesuaikan pencarian Anda',
    startAdding: language === 'en' ? 'Start by adding your first ingredient' : 'Mulai dengan menambahkan bahan pertama Anda'
  }
  
  useEffect(() => {
    fetchIngredients()
  }, [])
  
  // Get the ingredient name in the current language
  const getLocalizedName = (ingredient: any) => {
    if (language === 'en' && ingredient.name_en) {
      return ingredient.name_en;
    } else if (language === 'id' && ingredient.name_id) {
      return ingredient.name_id;
    }
    return ingredient.name;
  }
  
  // Get the category name in the current language
  const getLocalizedCategory = (category: string) => {
    return translateCategory(category, language as 'en' | 'id');
  }
  
  // Get expiry status of an ingredient
  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return 'none'
    
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'expired'
    if (diffDays <= 3) return 'expiring'
    if (diffDays <= 7) return 'warning'
    return 'fresh'
  }
  
  // Filter ingredients (simple search only)
  const filteredIngredients = ingredients
    .filter(ingredient => {
      const ingredientName = getLocalizedName(ingredient);
      return ingredientName.toLowerCase().includes(searchTerm.toLowerCase());
    })
  
  const getExpiryBadge = (expiryDate: string | null) => {
    const status = getExpiryStatus(expiryDate)
    
    switch (status) {
      case 'expired':
        return <Badge variant="error" size="sm">{translations.expired}</Badge>
      case 'expiring':
        return <Badge variant="warning" size="sm">{translations.expiresSoon}</Badge>
      case 'warning':
        return <Badge variant="accent" size="sm">{translations.useSoon}</Badge>
      case 'fresh':
        return <Badge variant="success" size="sm">{translations.fresh}</Badge>
      default:
        return null
    }
  }
  
  // Format date according to user's language
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{translations.kitchenInventory}</h1>
          <p className="text-neutral-600">{translations.manageIngredients}</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAddModal(true)}
        >
          {translations.addIngredient}
        </Button>
      </div>
      
      {/* Search */}
      <SearchBar
        placeholder={translations.searchIngredients}
        value={searchTerm}
        onChange={setSearchTerm}
      />
      
      {/* Ingredients Grid */}
      {filteredIngredients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredIngredients.map((ingredient) => (
              <motion.div
                key={ingredient.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <Card hover className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900 mb-1">
                        {getLocalizedName(ingredient)}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {ingredient.quantity} {ingredient.unit}
                      </p>
                    </div>
                    
                    <div className="flex gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteIngredient(ingredient.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge variant="neutral" size="sm">
                      {getLocalizedCategory(ingredient.category)}
                    </Badge>
                    
                    {ingredient.expiry_date && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-neutral-500">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {formatDate(ingredient.expiry_date)}
                          </span>
                        </div>
                        {getExpiryBadge(ingredient.expiry_date)}
                      </div>
                    )}
                    
                    {getExpiryStatus(ingredient.expiry_date) === 'expiring' && (
                      <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{translations.useWithinDays}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">{translations.noIngredientsFound}</h3>
          <p className="text-neutral-600 mb-4">
            {searchTerm ? translations.adjustFilters : translations.startAdding}
          </p>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
          >
            {translations.addIngredient}
          </Button>
        </Card>
      )}
      
      {/* Add Ingredient Modal */}
      <AddIngredientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  )
}