'use client'

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { RecipeCard } from "@/components/recipe-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// Using emoji alternatives to avoid Lucide React TypeScript issues
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

// This constant will dynamically use the live URL on Render or the local one on your machine.
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Recipe {
  id: string
  name: string
  description: string
  ingredients: Array<{ name: string; quantity?: number; unit?: string }>
  instructions: string[]
  prep_time?: number
  cook_time?: number
  servings?: number
  difficulty?: string
  cuisine?: string
  image_url?: string
  match_score?: number
  match_percentage?: number
  matched_ingredients?: string[]
  missing_ingredients?: string[]
  total_matched?: number
  total_user_ingredients?: number
  substitution_suggestions?: Record<string, string[]>
  algorithm_used?: string
}

interface AlgorithmStats {
  graph_traversals: number
  greedy_selections: number
  backtracking_calls: number
  total_execution_time: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [ingredients, setIngredients] = useState("")
  const [algorithmStats, setAlgorithmStats] = useState<AlgorithmStats | null>(null)
  const [backendConnected, setBackendConnected] = useState(false)
  const ingredientSearchAbortRef = useRef<AbortController | null>(null)
  const querySearchAbortRef = useRef<AbortController | null>(null)
  const lastIngredientKeyRef = useRef<string>("")
  const lastQueryRef = useRef<string>("")
  
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Check authentication and load initial data
  useEffect(() => {
    checkAuth()
    checkBackendConnection()
    loadInitialRecipes()
  }, [])

  const checkAuth = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      router.push("/auth/login")
      return
    }
    setUser(user)
  }

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        setBackendConnected(true)
      } else {
        throw new Error('Backend not responding')
      }
    } catch (error) {
      console.log('Backend not available')
      setBackendConnected(false)
    }
  }

  const loadInitialRecipes = async () => {
    setLoading(true)
    try {
      // Optimized: fetch with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // **FIXED: Increased to 60 second timeout**
      
      const response = await fetch(`${apiUrl}/api/recipes/search?limit=12`, { 
        signal: controller.signal,
        keepalive: true 
      })
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Initial recipes loaded:', data)
        setRecipes(data.recipes || [])
        setBackendConnected(true)
      } else {
        throw new Error('Backend request failed')
      }
    } catch (error: any) {
      console.error('Error loading recipes:', error)
      if (error.name === 'AbortError') {
        toast({
          title: "Loading Timeout",
          description: "Backend is taking too long. Please check if it's running.",
          variant: "destructive"
        })
      }
      setRecipes([])
      setBackendConnected(false)
    } finally {
      setLoading(false)
    }
  }

  const getSampleRecipes = (): Recipe[] => []

  const searchRecipesByIngredients = async () => {
    if (!ingredients.trim()) {
      toast({
        title: "Please enter ingredients",
        description: "Add some ingredients to find matching recipes! (e.g., chicken, rice, onion)",
        variant: "destructive"
      })
      return
    }

    // Avoid duplicate searches for same inputs
    const key = ingredients.split(',').map(i => i.trim().toLowerCase()).filter(Boolean).sort().join(',')
    if (key && key === lastIngredientKeyRef.current) {
      toast({
        title: "Already Searched",
        description: "These ingredients were just searched. Try different ones!",
      })
      return
    }
    lastIngredientKeyRef.current = key

    setSearching(true)
    try {
      const ingredientList = ingredients.split(',').map(i => i.trim()).filter(i => i)
      
      if (!backendConnected) {
        toast({
          title: "Backend Not Connected",
          description: "Please start the backend server first!",
          variant: "destructive"
        })
        setSearching(false)
        return
      }

      // Use Python backend with algorithms
      // Cancel any in-flight request
      if (ingredientSearchAbortRef.current) ingredientSearchAbortRef.current.abort()
      ingredientSearchAbortRef.current = new AbortController()
      
      console.log('Searching with ingredients:', ingredientList)
      
      // Optimized: Add timeout for search
      const timeoutId = setTimeout(() => {
        if (ingredientSearchAbortRef.current) {
          ingredientSearchAbortRef.current.abort()
        }
      }, 60000) // **FIXED: Increased to 60 second timeout**
      
      const recipesResponse = await fetch(`${apiUrl}/api/recipes/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          available_ingredients: ingredientList,
          max_recipes: 12
        }),
        signal: ingredientSearchAbortRef.current.signal,
        keepalive: true
      })
      clearTimeout(timeoutId)

      if (recipesResponse.ok) {
        const recipesData = await recipesResponse.json()
        console.log('Recipes received:', recipesData)
        
        // Handle both array and object responses
        const recipeArray = Array.isArray(recipesData) ? recipesData : (recipesData.recipes || [])
        
        setRecipes(recipeArray)
        
        if (recipeArray.length > 0) {
          toast({
            title: "✅ Recipes Found!",
            description: `Found ${recipeArray.length} delicious recipes matching your ingredients!`,
          })
        } else {
          toast({
            title: "No Recipes Found",
            description: "Try different ingredients like: chicken, rice, tomato, onion",
            variant: "destructive"
          })
        }
      } else {
        throw new Error(`Backend returned ${recipesResponse.status}`)
      }
    } catch (error: any) {
      console.error('Search error:', error)
      if (error.name === 'AbortError') {
        toast({
          title: "Search Timeout",
          description: "Search is taking too long. Backend might be slow. Try again.",
          variant: "destructive"
        })
        setSearching(false)
        return
      }
      toast({
        title: "Search Error",
        description: "Failed to search recipes. Check if backend is running on port 8000.",
        variant: "destructive"
      })
      setRecipes([])
    } finally {
      setSearching(false)
    }
  }

  const searchRecipesByQuery = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Please enter a recipe name",
        description: "Try searching for: biryani, butter chicken, dosa, etc.",
        variant: "destructive"
      })
      return
    }

    // Avoid duplicate searches for same query
    if (searchQuery.toLowerCase() === lastQueryRef.current) {
      toast({
        title: "Already Searched",
        description: "This recipe was just searched. Try a different one!",
      })
      return
    }
    lastQueryRef.current = searchQuery.toLowerCase()

    if (!backendConnected) {
      toast({
        title: "Backend Not Connected",
        description: "Please start the backend server first!",
        variant: "destructive"
      })
      return
    }

    setSearching(true)
    try {
      // Cancel any in-flight request
      if (querySearchAbortRef.current) querySearchAbortRef.current.abort()
      querySearchAbortRef.current = new AbortController()
      
      console.log('Searching for recipe:', searchQuery)
      
      const response = await fetch(`${apiUrl}/api/recipes/search?query=${encodeURIComponent(searchQuery)}&limit=12`, { 
        signal: querySearchAbortRef.current.signal, 
        keepalive: true 
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Query search results:', data)
        
        const recipeArray = data.recipes || []
        setRecipes(recipeArray)
        
        if (recipeArray.length > 0) {
          toast({
            title: "✅ Recipes Found!",
            description: `Found ${recipeArray.length} recipes for "${searchQuery}"`,
          })
        } else {
          toast({
            title: "No Recipes Found",
            description: "Try: biryani, butter chicken, dosa, samosa, paneer",
            variant: "destructive"
          })
        }
      } else {
        throw new Error(`Backend returned ${response.status}`)
      }
    } catch (error: any) {
      console.error('Query search error:', error)
      if (error.name === 'AbortError') {
        // Request was cancelled, ignore
        return
      }
      toast({
        title: "Search Error",
        description: "Failed to search recipes. Check if backend is running on port 8000.",
        variant: "destructive"
      })
      setRecipes([])
    } finally {
      setSearching(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 w-full max-w-6xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg">Loading your recipe dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            PantryIQ Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email}! Discover recipes with AI-powered algorithms.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={backendConnected ? "default" : "secondary"}>
            {backendConnected ? "API Connected" : "Offline Mode"}
          </Badge>
          <Button 
            className="w-fit"
            onClick={() => {
              // Focus on the ingredients input to help user start searching
              const input = document.querySelector('input[placeholder*="Enter ingredients"]') as HTMLInputElement
              if (input) {
                input.focus()
                toast({
                  title: "Find Recipes",
                  description: "Enter ingredients you have (e.g., chicken, rice, onion) and click 'Find Recipes' button!",
                })
              }
            }}
          >
            Find Recipes
          </Button>
        </div>
      </div>


      {/* Ingredient Search */}
      <Card>
        <CardHeader>
          <CardTitle>
            Recipe Search
          </CardTitle>
          <CardDescription>
            Search by ingredients or recipe name to find matching recipes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Enter ingredients (comma-separated): chicken, tomato, onion..." 
              className="flex-1"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchRecipesByIngredients()}
            />
            <Button onClick={searchRecipesByIngredients} disabled={searching} className="min-w-[140px]">
              {searching ? '🔍 Searching...' : '🔍 Find Recipes'}
            </Button>
            
          </div>
          
          <div className="flex gap-2">
            <Input 
              placeholder="Or search by recipe name (e.g., biryani, dosa)..." 
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchRecipesByQuery()}
            />
            <Button variant="outline" onClick={searchRecipesByQuery} disabled={searching} className="min-w-[100px]">
              {searching ? '🔍...' : '🔍 Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recipe Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">
            {ingredients ? 'Recommended Recipes' : 'Featured Recipes'} ({recipes.length})
          </h2>
          {recipes.length > 0 && (
            <Button variant="outline" onClick={loadInitialRecipes}>
              Reset
            </Button>
          )}
        </div>
        
        {recipes.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              <p className="text-lg mb-2">No recipes found</p>
              <p>Try searching with different ingredients or recipe names</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
