import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Coffee,
  Sun,
  Moon
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'

const mealTypes = [
  { id: 'breakfast', label: 'Breakfast', icon: Coffee },
  { id: 'lunch', label: 'Lunch', icon: Sun },
  { id: 'dinner', label: 'Dinner', icon: Moon }
]

export const MealPlanManager: React.FC = () => {
  const { mealPlans, recipes, fetchMealPlans, fetchRecipes, addMealPlan } = useStore()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedMealType, setSelectedMealType] = useState<string>('')
  
  useEffect(() => {
    fetchMealPlans()
    fetchRecipes()
  }, [])
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Monday start
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  
  const getMealForDay = (date: Date, mealType: string) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return mealPlans.find(meal => meal.date === dateStr && meal.meal_type === mealType)
  }
  
  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => addDays(prev, direction === 'next' ? 7 : -7))
  }
  
  const handleAddMeal = (day: Date, mealType: string) => {
    setSelectedDay(day)
    setSelectedMealType(mealType)
    setShowAddModal(true)
  }
  
  const handleQuickAddMeal = async () => {
    // Quick add meal logic - you can expand this
    const today = new Date()
    const mealType = 'lunch' // default
    const meal = {
      date: format(today, 'yyyy-MM-dd'),
      meal_type: mealType,
      notes: 'Quick meal added',
      recipe_id: null
    }
    
    try {
      await addMealPlan(meal)
      console.log('✅ Quick meal added')
    } catch (error) {
      console.error('❌ Failed to add quick meal:', error)
    }
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Meal Planner</h1>
          <p className="text-neutral-600">Plan your weekly meals and reduce food waste</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleQuickAddMeal}
        >
          Quick Add Meal
        </Button>
      </div>
      
      {/* Week Navigation */}
      <Card>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ChevronLeft className="w-4 h-4" />}
            onClick={() => navigateWeek('prev')}
          >
            Previous Week
          </Button>
          
          <div className="text-center">
            <h2 className="text-lg font-semibold text-neutral-900">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </h2>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ChevronRight className="w-4 h-4" />}
            onClick={() => navigateWeek('next')}
          >
            Next Week
          </Button>
        </div>
      </Card>
      
      {/* Meal Plan Grid */}
      <div className="grid grid-cols-8 gap-4">
        {/* Header Row */}
        <div className="col-span-1"></div>
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="text-center">
            <div className={`p-3 rounded-xl ${
              isSameDay(day, new Date()) 
                ? 'bg-primary-100 text-primary-800' 
                : 'bg-neutral-50 text-neutral-700'
            }`}>
              <div className="font-semibold">{format(day, 'EEE')}</div>
              <div className="text-sm">{format(day, 'd')}</div>
            </div>
          </div>
        ))}
        
        {/* Meal Rows */}
        {mealTypes.map((mealType) => {
          const Icon = mealType.icon
          
          return (
            <React.Fragment key={mealType.id}>
              {/* Meal Type Label */}
              <div className="flex items-center gap-2 p-3">
                <Icon className="w-5 h-5 text-neutral-600" />
                <span className="font-medium text-neutral-900">{mealType.label}</span>
              </div>
              
              {/* Meal Cards for Each Day */}
              {weekDays.map((day) => {
                const meal = getMealForDay(day, mealType.id)
                
                return (
                  <motion.div
                    key={`${day.toISOString()}-${mealType.id}`}
                    whileHover={{ scale: 1.02 }}
                    className="min-h-[100px]"
                  >
                    <Card 
                      hover 
                      padding="sm" 
                      className="h-full cursor-pointer border-dashed border-2 border-neutral-200 hover:border-primary-300"
                      onClick={() => handleAddMeal(day, mealType.id)}
                    >
                      {meal ? (
                        <div>
                          <div className="font-medium text-neutral-900 mb-1">
                            {meal.notes || 'Planned Meal'}
                          </div>
                          <Badge variant="success" size="sm">
                            Planned
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                          <Plus className="w-6 h-6 mb-1" />
                          <span className="text-xs">Add meal</span>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                )
              })}
            </React.Fragment>
          )
        })}
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {mealPlans.filter(meal => {
                const mealDate = new Date(meal.date)
                return mealDate >= weekStart && mealDate <= addDays(weekStart, 6)
              }).length}
            </div>
            <div className="text-sm text-neutral-600">Meals Planned This Week</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary-600 mb-1">
              {recipes.length}
            </div>
            <div className="text-sm text-neutral-600">Available Recipes</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-600 mb-1">
              {Math.round((mealPlans.filter(meal => {
                const mealDate = new Date(meal.date)
                return mealDate >= weekStart && mealDate <= addDays(weekStart, 6)
              }).length / 21) * 100)}%
            </div>
            <div className="text-sm text-neutral-600">Week Completion</div>
          </div>
        </Card>
      </div>
    </div>
  )
}