import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'
import { persist } from 'zustand/middleware'
import { translateIngredient, translateCategory } from '../lib/translations'

type Ingredient = Database['public']['Tables']['ingredients']['Row'] & {
  name_en?: string;
  name_id?: string;
}
type Recipe = Database['public']['Tables']['recipes']['Row']
type ChatMessage = Database['public']['Tables']['chat_history']['Row']

interface User {
  id: string
  email: string
}

interface AppState {
  // Auth
  user: User | null
  isLoading: boolean
  
  // Ingredients
  ingredients: Ingredient[]
  
  // Recipes
  recipes: Recipe[]
  currentRecipe: Recipe | null
  
  // Chat
  chatMessages: ChatMessage[]
  currentSessionId: string | null
  
  // UI State
  activeView: 'dashboard' | 'inventory' | 'recipes' | 'ai-chat'
  isGeneratingRecipe: boolean
  language: 'en' | 'id'
  
  // Actions
  setUser: (user: User | null) => void
  setActiveView: (view: AppState['activeView']) => void
  setIsLoading: (loading: boolean) => void
  setIsGeneratingRecipe: (generating: boolean) => void
  setLanguage: (language: 'en' | 'id') => void
  
  // Ingredient actions
  fetchIngredients: () => Promise<void>
  addIngredient: (ingredient: Omit<Ingredient, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>
  updateIngredient: (id: string, updates: Partial<Ingredient>) => Promise<void>
  deleteIngredient: (id: string) => Promise<void>
  
  // Recipe actions
  fetchRecipes: () => Promise<void>
  addRecipe: (recipe: Omit<Recipe, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  setCurrentRecipe: (recipe: Recipe | null) => void
  
  // Chat actions
  fetchChatHistory: () => Promise<void>
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'user_id' | 'created_at' | 'session_id' | 'tokens_used' | 'response_time_ms'>) => Promise<void>
  startNewChatSession: () => void
  clearChatHistory: () => Promise<void>
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      ingredients: [],
      recipes: [],
      currentRecipe: null,
      chatMessages: [],
      currentSessionId: null,
      activeView: 'dashboard',
      isGeneratingRecipe: false,
      language: 'en',
      
      // Actions
      setUser: (user) => set({ user }),
      setActiveView: (activeView) => set({ activeView }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setIsGeneratingRecipe: (isGeneratingRecipe) => set({ isGeneratingRecipe }),
      
      // Updated setLanguage to preserve ingredients when language changes
      setLanguage: (language) => {
        // Get current state
        const { ingredients } = get();
        
        // Update language in state
        set({ language });
        
        // No need to refetch ingredients as they're already in state
        // Just let the UI components use the appropriate name based on language
      },
      
      // Ingredient actions
      fetchIngredients: async () => {
        const { user } = get()
        if (!user) {
          console.log('No user found when fetching ingredients')
          return
        }
        
        console.log('Fetching ingredients for user:', user.id)
        
        const { data, error } = await supabase
          .from('ingredients')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Error fetching ingredients:', error)
          console.error('Supabase error details:', error.message, error.details, error.hint)
          return
        }
        
        console.log('Fetched ingredients:', data)
        
        // Process ingredients to ensure they have name_en and name_id
        const processedIngredients = (data || []).map(ingredient => {
          // If translations are missing, generate them
          if (!ingredient.name_en || !ingredient.name_id) {
            return {
              ...ingredient,
              name_en: ingredient.name_en || translateIngredient(ingredient.name, 'en'),
              name_id: ingredient.name_id || translateIngredient(ingredient.name, 'id')
            };
          }
          return ingredient;
        });
        
        set({ ingredients: processedIngredients })
      },
      
      addIngredient: async (ingredient) => {
        const { user } = get()
        if (!user) {
          console.error('No user found when adding ingredient')
          throw new Error('You must be logged in to add ingredients')
        }
        
        // Ensure both translations exist
        const name_en = ingredient.name_en || translateIngredient(ingredient.name, 'en');
        const name_id = ingredient.name_id || translateIngredient(ingredient.name, 'id');
        
        const ingredientToAdd = {
          ...ingredient,
          name_en,
          name_id,
          user_id: user.id
        };
        
        console.log('Adding ingredient:', ingredientToAdd)
        
        const { data, error } = await supabase
          .from('ingredients')
          .insert([ingredientToAdd])
          .select()
          .single()
        
        if (error) {
          console.error('Error adding ingredient:', error)
          console.error('Supabase error details:', error.message, error.details, error.hint)
          throw new Error(`Failed to add ingredient: ${error.message}`)
        }
        
        console.log('Ingredient added successfully:', data)
        
        set((state) => ({
          ingredients: [data, ...state.ingredients]
        }))
        
        return data
      },
      
      updateIngredient: async (id, updates) => {
        // If name is being updated, update translations too
        const updatedValues: any = { ...updates };
        
        if (updates.name) {
          updatedValues.name_en = translateIngredient(updates.name, 'en');
          updatedValues.name_id = translateIngredient(updates.name, 'id');
        }
        
        const { data, error } = await supabase
          .from('ingredients')
          .update({ ...updatedValues, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        
        if (error) {
          console.error('Error updating ingredient:', error)
          return
        }
        
        set((state) => ({
          ingredients: state.ingredients.map((ing) =>
            ing.id === id ? data : ing
          )
        }))
      },
      
      deleteIngredient: async (id) => {
        const { error } = await supabase
          .from('ingredients')
          .delete()
          .eq('id', id)
        
        if (error) {
          console.error('Error deleting ingredient:', error)
          return
        }
        
        set((state) => ({
          ingredients: state.ingredients.filter((ing) => ing.id !== id)
        }))
      },
      
      // Recipe actions
      fetchRecipes: async () => {
        const { user } = get()
        if (!user) return
        
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Error fetching recipes:', error)
          return
        }
        
        set({ recipes: data || [] })
      },
      
      addRecipe: async (recipe) => {
        const { user } = get()
        if (!user) return
        
        const { data, error } = await supabase
          .from('recipes')
          .insert([{ ...recipe, user_id: user.id }])
          .select()
          .single()
        
        if (error) {
          console.error('Error adding recipe:', error)
          return
        }
        
        set((state) => ({
          recipes: [data, ...state.recipes]
        }))
      },
      
      setCurrentRecipe: (currentRecipe) => set({ currentRecipe }),
      
      // Chat actions
      fetchChatHistory: async () => {
        const { user } = get()
        if (!user) return

        console.log('Fetching chat history for user:', user.id)

        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        if (error) {
          console.error('Error fetching chat history:', error)
          return
        }

        console.log('Fetched chat history:', data)

        // Group messages by session_id
        const messages = data || []
        
        // Get the most recent session_id
        const sessionIds = [...new Set(messages.map(msg => msg.session_id))]
        const currentSessionId = sessionIds.length > 0 ? sessionIds[sessionIds.length - 1] : null
        
        set({ 
          chatMessages: messages,
          currentSessionId
        })
      },
      
      addChatMessage: async (message) => {
        const { user, currentSessionId } = get()
        if (!user) {
          console.error('No user found when trying to add chat message')
          throw new Error('User not authenticated')
        }
        
        try {
          // Create a new session ID if none exists
          const session_id = currentSessionId || generateSessionId()
          
          // If this is a new session, update the state
          if (!currentSessionId) {
            set({ currentSessionId: session_id })
          }
          
          const startTime = Date.now()
          
          const { data, error } = await supabase
            .from('chat_history')
            .insert([{ 
              ...message, 
              user_id: user.id,
              session_id,
              tokens_used: 0,
              response_time_ms: Date.now() - startTime
            }])
            .select()
            .single()
          
          if (error) {
            console.error('Error adding chat message:', error)
            throw new Error(`Failed to save message: ${error.message}`)
          }
          
          set((state) => ({
            chatMessages: [...state.chatMessages, data]
          }))
          
          return data
        } catch (error) {
          console.error('Error in addChatMessage:', error)
          throw error
        }
      },
      
      startNewChatSession: () => {
        set({ currentSessionId: null })
      },
      
      clearChatHistory: async () => {
        const { user } = get()
        if (!user) {
          console.error('No user found when trying to clear chat history')
          throw new Error('User not authenticated')
        }
        
        try {
          const { error } = await supabase
            .from('chat_history')
            .delete()
            .eq('user_id', user.id)
          
          if (error) {
            console.error('Error clearing chat history:', error)
            throw new Error(`Failed to clear chat history: ${error.message}`)
          }
          
          // Reset state
          set({ 
            chatMessages: [],
            currentSessionId: null
          })
          
          console.log('Chat history cleared successfully')
        } catch (error) {
          console.error('Error in clearChatHistory:', error)
          throw error
        }
      }
    }),
    {
      name: 'chef-ai-storage',
      partialize: (state) => ({
        user: state.user,
        activeView: state.activeView,
        language: state.language
      })
    }
  )
)

function generateSessionId(): string {
  // Generate a proper UUID v4 format
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}