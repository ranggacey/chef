import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, Languages } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import toast from 'react-hot-toast'
import { animeToast, kawaiiToast } from '../../lib/kawaii-toast'
import { 
  translateIngredient, 
  translateCategory, 
  translateUnit, 
  categoryTranslations, 
  ingredientTranslations 
} from '../../lib/translations'

interface AddIngredientModalProps {
  isOpen: boolean
  onClose: () => void
}

// Define categories with translations
const getCategories = (language: 'en' | 'id') => {
  return Object.entries(categoryTranslations).map(([value, translation]) => ({
    label: translation[language],
    value
  }))
}

// Define units with translations
const getUnits = (language: 'en' | 'id') => {
  return ['pieces', 'kg', 'g', 'lbs', 'oz', 'liters', 'ml', 'cups', 'tbsp', 'tsp', 'cans', 'bottles']
    .map(unit => ({
      label: translateUnit(unit, language),
      value: unit
    }))
}

export const AddIngredientModal: React.FC<AddIngredientModalProps> = ({
  isOpen,
  onClose
}) => {
  const { addIngredient, fetchIngredients, language } = useStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'pieces',
    category: 'other',
    expiry_date: ''
  })
  
  const [translatedName, setTranslatedName] = useState('')
  
  // Get translated categories and units based on current language
  const categories = getCategories(language as 'en' | 'id')
  const units = getUnits(language as 'en' | 'id')
  
  // Translations for UI text
  const translations = {
    addIngredient: language === 'en' ? 'Add Ingredient' : 'Tambah Bahan',
    addToInventory: language === 'en' ? 'Add a new ingredient to your inventory' : 'Tambahkan bahan baru ke inventaris Anda',
    ingredientName: language === 'en' ? 'Ingredient Name *' : 'Nama Bahan *',
    quantity: language === 'en' ? 'Quantity *' : 'Jumlah *',
    unit: language === 'en' ? 'Unit' : 'Satuan',
    category: language === 'en' ? 'Category' : 'Kategori',
    expiryDate: language === 'en' ? 'Expiry Date (Optional)' : 'Tanggal Kedaluwarsa (Opsional)',
    cancel: language === 'en' ? 'Cancel' : 'Batal',
    add: language === 'en' ? 'Add Ingredient' : 'Tambah Bahan',
    translatedAs: language === 'en' ? 'Will be saved as' : 'Akan disimpan sebagai',
    fillRequired: language === 'en' ? 'Please fill in all required fields' : 'Harap isi semua kolom yang diperlukan',
    addSuccess: language === 'en' ? 'Ingredient added successfully!' : 'Bahan berhasil ditambahkan!'
  }
  
  // Update translated name whenever the input name changes
  useEffect(() => {
    if (formData.name) {
      const otherLanguage = language === 'en' ? 'id' : 'en'
      const translated = translateIngredient(formData.name, otherLanguage)
      setTranslatedName(translated)
    } else {
      setTranslatedName('')
    }
  }, [formData.name, language])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.quantity) {
      animeToast.validationError(language === 'id')
      return
    }
    
    console.log('Form data being submitted:', formData)
    setIsLoading(true)
    
    try {
      // Store both English and Indonesian versions in the database
      // This allows us to display the correct language based on user preference
      const name_en = language === 'en' ? formData.name : translateIngredient(formData.name, 'en')
      const name_id = language === 'id' ? formData.name : translateIngredient(formData.name, 'id')
      
      // Always store the original name in the name field
      // and store translations in name_en and name_id fields
      const result = await addIngredient({
        name: formData.name, // Original name as entered
        name_en, // English version
        name_id, // Indonesian version
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        category: formData.category,
        expiry_date: formData.expiry_date || null
      })
      
      console.log('Add ingredient result:', result)
      animeToast.saveSuccess(language === 'id')
      
      // Refresh ingredients list to get the updated data with translations
      await fetchIngredients()
      
      setFormData({
        name: '',
        quantity: '',
        unit: 'pieces',
        category: 'other',
        expiry_date: ''
      })
      onClose()
    } catch (error: any) {
      console.error('Error in handleSubmit:', error)
      const errorMessage = error.message || 'Failed to add ingredient'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-2xl shadow-strong max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">{translations.addIngredient}</h2>
                  <p className="text-sm text-neutral-600">{translations.addToInventory}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <Input
                  label={translations.ingredientName}
                  placeholder={language === 'en' ? "e.g., Tomatoes, Chicken Breast" : "mis., Tomat, Dada Ayam"}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
                
                {/* Show translation preview */}
                {translatedName && (
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Languages className="w-4 h-4 mr-1" />
                    <span>{translations.translatedAs} "{translatedName}" {language === 'en' ? 'in Indonesian' : 'in English'}</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={translations.quantity}
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    {translations.unit}
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 bg-white"
                  >
                    {units.map(unit => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {translations.category}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 bg-white"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>
              
              <Input
                label={translations.expiryDate}
                type="date"
                value={formData.expiry_date}
                onChange={(e) => handleInputChange('expiry_date', e.target.value)}
              />
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1"
                >
                  {translations.cancel}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  className="flex-1"
                >
                  {translations.add}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}