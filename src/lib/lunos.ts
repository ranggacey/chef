// Use different URL for development vs production
const LUNOS_API_URL = import.meta.env.DEV 
  ? 'http://localhost:3001/api/chat'  // Development server
  : '/api/chat'                       // Vercel API route
const LUNOS_MODEL = 'google/gemini-2.0-flash-lite'

// Only log API info in development
if (import.meta.env.DEV) {
  console.log('🤖 Using Lunos Model: google/gemini-2.0-flash-lite')
  console.log('🌐 API Endpoint:', LUNOS_API_URL)
  console.log('🔧 Development mode: Using local dev server')
}

// Indonesian words/patterns for language detection
const INDONESIAN_PATTERNS = [
  // Common Indonesian words
  'yang', 'dengan', 'untuk', 'dari', 'dan', 'atau', 'ini', 'itu', 'adalah', 'akan',
  'sudah', 'belum', 'bisa', 'tidak', 'bukan', 'juga', 'saja', 'hanya', 'masih',
  // Cooking related Indonesian words
  'masak', 'memasak', 'resep', 'bahan', 'bumbu', 'goreng', 'rebus', 'tumis', 
  'bakar', 'kukus', 'sajikan', 'hidangkan', 'potong', 'iris', 'cincang',
  // Common Indonesian question words
  'apa', 'bagaimana', 'cara', 'kapan', 'dimana', 'kenapa', 'mengapa',
  // Indonesian specific grammar patterns
  'di', 'ke', 'dari', 'pada', 'dalam', 'oleh', 'untuk', 'dengan'
]

// Function to detect language from user input
export function detectLanguage(text: string): 'en' | 'id' {
  const normalizedText = text.toLowerCase()
  
  // Count Indonesian patterns
  let indonesianScore = 0
  let totalWords = normalizedText.split(/\s+/).length
  
  INDONESIAN_PATTERNS.forEach(pattern => {
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi')
    const matches = normalizedText.match(regex)
    if (matches) {
      indonesianScore += matches.length
    }
  })
  
  // Calculate percentage of Indonesian words
  const indonesianPercentage = (indonesianScore / totalWords) * 100
  
  // If more than 15% of words are Indonesian patterns, consider it Indonesian
  // This threshold can be adjusted based on testing
  const isIndonesian = indonesianPercentage > 15
  
  if (import.meta.env.DEV) {
    console.log(`🌍 Language detection: ${text.slice(0, 50)}...`)
    console.log(`📊 Indonesian score: ${indonesianScore}/${totalWords} (${indonesianPercentage.toFixed(1)}%)`)
    console.log(`🎯 Detected language: ${isIndonesian ? 'Indonesian' : 'English'}`)
  }
  
  return isIndonesian ? 'id' : 'en'
}

export interface RecipeRequest {
  ingredients: string[]
  preferences?: string[]
  dietaryRestrictions?: string[]
  cookingTime?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  cuisine?: string
  mood?: string
  language?: string
}

export interface GeneratedRecipe {
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  prepTime: number
  cookTime: number
  servings: number
  difficulty: string
  cuisine: string
  tags: string[]
  tips?: string[]
  story?: string
}

export class LunosService {
  private async makeRequest(messages: any[], temperature: number = 0.7): Promise<string> {
    try {
      if (import.meta.env.DEV) {
        console.log('Making request to Lunos API via proxy...')
      }
      
      const requestBody = {
        messages: messages,
        temperature: temperature,
        max_tokens: 8192
      }

      const response = await fetch(LUNOS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (import.meta.env.DEV) {
        console.log('API proxy response status:', response.status)
      }

      if (!response.ok) {
        const errorData = await response.json().catch(async () => {
          return { error: await response.text() }
        })
        
        if (import.meta.env.DEV) {
          console.error('API proxy error response:', errorData)
        }
        
        if (response.status === 400) {
          throw new Error('Invalid request. Please check your input and try again.')
        } else if (response.status === 401) {
          throw new Error('Service authentication error. Please contact support.')
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.')
        } else if (response.status === 500) {
          throw new Error('Service temporarily unavailable. Please try again later.')
        } else {
          throw new Error(`Service error: ${response.status} - ${errorData.error || 'Unknown error'}`)
        }
      }

      const data = await response.json()
      if (import.meta.env.DEV) {
        console.log('API proxy response received successfully')
      }

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response generated. Please try with different input.')
      }

      const content = data.choices[0]?.message?.content
      if (!content) {
        throw new Error('Empty response from AI. Please try again.')
      }

      return content
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('API request failed:', error)
      }
      
      if (error instanceof Error) {
        throw error
      } else {
        throw new Error('Failed to connect to AI service. Please check your internet connection and try again.')
      }
    }
  }

  async generateRecipe(request: RecipeRequest): Promise<GeneratedRecipe> {
    const { language = 'en' } = request
    const prompt = this.buildRecipePrompt(request)
    
    const messages = [
      {
        role: 'system',
        content: language === 'en' 
          ? 'You are a professional chef AI assistant. Generate creative and detailed recipes based on user requirements. Always return responses in valid JSON format.'
          : 'Anda adalah asisten AI chef profesional. Buat resep kreatif dan detail berdasarkan kebutuhan pengguna. Selalu kembalikan respons dalam format JSON yang valid.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]

    const response = await this.makeRequest(messages, 0.9)
    return this.parseRecipeResponse(response)
  }

  async getCookingTips(recipe: string, language: string = 'en'): Promise<string[]> {
    const messages = [
      {
        role: 'system',
        content: language === 'en'
          ? 'You are a professional chef. Provide practical cooking tips in JSON array format.'
          : 'Anda adalah chef profesional. Berikan tips memasak praktis dalam format array JSON.'
      },
      {
        role: 'user',
        content: language === 'en' 
          ? `Give me 3-5 professional cooking tips for making this recipe better: ${recipe}. Return only the tips as a JSON array of strings.`
          : `Berikan saya 3-5 tips memasak profesional untuk membuat resep ini lebih baik: ${recipe}. Kembalikan hanya tips sebagai array JSON string.`
      }
    ]
    
    const response = await this.makeRequest(messages, 0.7)
    try {
      return JSON.parse(response)
    } catch {
      return response.split('\n').filter(tip => tip.trim().length > 0).slice(0, 5)
    }
  }

  async suggestSubstitutions(ingredient: string, language: string = 'en'): Promise<string[]> {
    const messages = [
      {
        role: 'system',
        content: language === 'en'
          ? 'You are a professional chef. Provide ingredient substitutions in JSON array format.'
          : 'Anda adalah chef profesional. Berikan pengganti bahan dalam format array JSON.'
      },
      {
        role: 'user',
        content: language === 'en'
          ? `What are 3-5 good substitutions for "${ingredient}" in cooking? Return only the substitutions as a JSON array of strings.`
          : `Apa 3-5 pengganti yang baik untuk "${ingredient}" dalam memasak? Kembalikan hanya pengganti sebagai array JSON string.`
      }
    ]
    
    const response = await this.makeRequest(messages, 0.7)
    try {
      return JSON.parse(response)
    } catch {
      return response.split('\n').filter(sub => sub.trim().length > 0).slice(0, 5)
    }
  }

  async answerCookingQuestion(question: string, context?: string, language: string = 'en'): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: language === 'en'
          ? 'You are a professional chef and cooking expert. Provide helpful, practical cooking advice.'
          : 'Anda adalah chef profesional dan ahli memasak. Berikan saran memasak yang membantu dan praktis.'
      },
      {
        role: 'user',
        content: language === 'en'
          ? `As a professional chef, answer this cooking question: "${question}" ${context ? `Context: ${context}` : ''} Provide a helpful, practical answer in 2-3 sentences.`
          : `Sebagai chef profesional, jawab pertanyaan memasak ini: "${question}" ${context ? `Konteks: ${context}` : ''} Berikan jawaban yang membantu dan praktis dalam 2-3 kalimat.`
      }
    ]
    
    return await this.makeRequest(messages, 0.7)
  }

  private buildRecipePrompt(request: RecipeRequest): string {
    const {
      ingredients,
      preferences = [],
      dietaryRestrictions = [],
      cookingTime,
      difficulty = 'medium',
      cuisine,
      mood,
      language = 'en'
    } = request

    // Determine the language for the prompt
    const promptLanguage = language === 'en' ? {
      create: "Create a unique and creative recipe using these ingredients",
      requirements: "Requirements",
      difficulty: "Difficulty",
      maxCookingTime: "Maximum cooking time",
      cuisineStyle: "Cuisine style",
      preferences: "Preferences",
      dietaryRestrictions: "Dietary restrictions",
      mood: "Mood/Style",
      returnFormat: "Return the recipe in this exact JSON format",
      makeCreative: "Make it creative and unique, not just a standard recipe. Include interesting flavor combinations and techniques."
    } : {
      create: "Buat resep unik dan kreatif menggunakan bahan-bahan ini",
      requirements: "Persyaratan",
      difficulty: "Tingkat kesulitan",
      maxCookingTime: "Waktu memasak maksimum",
      cuisineStyle: "Gaya masakan",
      preferences: "Preferensi",
      dietaryRestrictions: "Batasan makanan",
      mood: "Suasana/Gaya",
      returnFormat: "Kembalikan resep dalam format JSON yang tepat ini",
      makeCreative: "Buatlah kreatif dan unik, bukan hanya resep standar. Sertakan kombinasi rasa dan teknik yang menarik."
    }

    return `${promptLanguage.create}: ${ingredients.join(', ')}.

${promptLanguage.requirements}:
- ${promptLanguage.difficulty}: ${difficulty}
- ${cookingTime ? `${promptLanguage.maxCookingTime}: ${cookingTime} minutes` : ''}
- ${cuisine ? `${promptLanguage.cuisineStyle}: ${cuisine}` : ''}
- ${preferences.length > 0 ? `${promptLanguage.preferences}: ${preferences.join(', ')}` : ''}
- ${dietaryRestrictions.length > 0 ? `${promptLanguage.dietaryRestrictions}: ${dietaryRestrictions.join(', ')}` : ''}
- ${mood ? `${promptLanguage.mood}: ${mood}` : ''}

${promptLanguage.returnFormat}:
{
  "title": "${language === 'en' ? 'Recipe Name' : 'Nama Resep'}",
  "description": "${language === 'en' ? 'Brief appetizing description' : 'Deskripsi singkat yang menggugah selera'}",
  "ingredients": ["${language === 'en' ? 'ingredient 1 with amount' : 'bahan 1 dengan takaran'}", "${language === 'en' ? 'ingredient 2 with amount' : 'bahan 2 dengan takaran'}"],
  "instructions": ["${language === 'en' ? 'step 1' : 'langkah 1'}", "${language === 'en' ? 'step 2' : 'langkah 2'}", "${language === 'en' ? 'step 3' : 'langkah 3'}"],
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "difficulty": "easy|medium|hard",
  "cuisine": "${language === 'en' ? 'cuisine type' : 'jenis masakan'}",
  "tags": ["${language === 'en' ? 'tag1' : 'label1'}", "${language === 'en' ? 'tag2' : 'label2'}", "${language === 'en' ? 'tag3' : 'label3'}"],
  "tips": ["${language === 'en' ? 'tip 1' : 'tips 1'}", "${language === 'en' ? 'tip 2' : 'tips 2'}"],
  "story": "${language === 'en' ? 'Brief interesting story about the dish' : 'Cerita singkat yang menarik tentang hidangan ini'}"
}

${language === 'id' ? 'PENTING: Berikan SEMUA konten dalam Bahasa Indonesia yang natural dan mudah dipahami. Judul harus spesifik dan menarik. Instruksi harus detail dan lengkap. Gunakan istilah masakan Indonesia yang umum.' : 'IMPORTANT: Provide ALL content in natural English. Make the title specific and appealing. Instructions should be detailed and complete.'}
${promptLanguage.makeCreative}`
  }

  private parseRecipeResponse(response: string): GeneratedRecipe {
    try {
      if (import.meta.env.DEV) {
        console.log('🍳 Parsing AI response...')
      }
      
      // Remove markdown code blocks and clean response
      let cleanResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^```/g, '')
        .trim()
      
      // Try to extract JSON from the response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        
        if (import.meta.env.DEV) {
          console.log('✅ Recipe parsed successfully')
        }
        
        return {
          title: parsed.title || 'Generated Recipe',
          description: parsed.description || 'A delicious recipe created just for you',
          ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
          instructions: Array.isArray(parsed.instructions) ? parsed.instructions : [],
          prepTime: Number(parsed.prepTime) || 15,
          cookTime: Number(parsed.cookTime) || 30,
          servings: Number(parsed.servings) || 4,
          difficulty: parsed.difficulty || 'medium',
          cuisine: parsed.cuisine || 'fusion',
          tags: Array.isArray(parsed.tags) ? parsed.tags : ['ai-generated', 'creative'],
          tips: Array.isArray(parsed.tips) ? parsed.tips : [],
          story: parsed.story || ''
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('❌ Failed to parse recipe response:', error)
      }
    }

    // Fallback parsing if JSON parsing fails
    if (import.meta.env.DEV) {
      console.log('⚠️ Using fallback parsing')
    }
    return this.fallbackParseRecipe(response)
  }

  private fallbackParseRecipe(response: string): GeneratedRecipe {
    const lines = response.split('\n').filter(line => line.trim())
    
    return {
      title: lines[0]?.replace(/^#+\s*/, '') || 'Generated Recipe',
      description: 'A delicious recipe created just for you',
      ingredients: lines.filter(line => line.includes('cup') || line.includes('tbsp') || line.includes('tsp')).slice(0, 10),
      instructions: lines.filter(line => line.match(/^\d+\./) || line.toLowerCase().includes('step')).slice(0, 8),
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      difficulty: 'medium',
      cuisine: 'fusion',
      tags: ['ai-generated', 'creative'],
      tips: [],
      story: ''
    }
  }
}

export const lunosService = new LunosService()

// Direct API test function via proxy
export const testLunosDirect = async (): Promise<boolean> => {
  try {
    if (import.meta.env.DEV) {
      console.log('🔥 Testing Lunos API via proxy...')
    }
    
    const response = await fetch(LUNOS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Say hello in one word.'
          }
        ],
        max_tokens: 50
      })
    })

    if (import.meta.env.DEV) {
      console.log('🌐 API proxy response status:', response.status)
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      if (import.meta.env.DEV) {
        console.error('❌ API proxy error:', errorData)
      }
      return false
    }

    const data = await response.json()
    
    if (data.choices && data.choices[0]?.message?.content) {
      if (import.meta.env.DEV) {
        console.log('✅ API proxy test successful!')
      }
      return true
    } else {
      if (import.meta.env.DEV) {
        console.log('❌ API proxy returned no content')
      }
      return false
    }
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('❌ API proxy test failed:', error)
    }
    return false
  }
}

// Test function for debugging
export const testLunosConnection = async (): Promise<boolean> => {
  try {
    if (import.meta.env.DEV) {
      console.log('🧪 Testing Lunos API connection...')
      console.log('🔑 API Key available:', !!LUNOS_API_KEY)
    }
    
    // Simple test prompt
    const testPrompt = 'Say "Hello from Lunos" in one sentence.'
    
    const testResponse = await lunosService.answerCookingQuestion(testPrompt)
    
    if (testResponse && testResponse.length > 0) {
      if (import.meta.env.DEV) {
        console.log('🎉 Lunos API connection successful!')
      }
      return true
    } else {
      if (import.meta.env.DEV) {
        console.log('❌ Empty response from Lunos API')
      }
      return false
    }
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('❌ Lunos connection test failed:', error)
    }
    return false
  }
}

// Export aliases for backward compatibility
export { lunosService as geminiService }
export { testLunosConnection as testGeminiConnection }
export { testLunosDirect as testGeminiDirect }
