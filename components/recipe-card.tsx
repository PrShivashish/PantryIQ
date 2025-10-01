import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface RecipeCardProps {
  recipe: {
    id: string
    name: string
    description: string
    ingredients?: Array<{ name: string; quantity?: number; unit?: string }>
    instructions?: string[]
    prep_time?: number | string
    cook_time?: number | string
    servings?: number
    difficulty?: string
    cuisine?: string
    image_url?: string
    match_score?: number
    match_percentage?: number
    matched_ingredients?: string[]
    total_matched?: number
    total_user_ingredients?: number
    missing_ingredients?: string[]
    substitution_suggestions?: Record<string, string[]>
    algorithm_used?: string
  }
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const formatTime = (time: number | string | undefined) => {
    if (!time) return null
    if (typeof time === 'string') return time
    return `${time} mins`
  }

  const totalTime = () => {
    const prep = typeof recipe.prep_time === 'number' ? recipe.prep_time : 0
    const cook = typeof recipe.cook_time === 'number' ? recipe.cook_time : 0
    return prep + cook
  }

  const router = useRouter()

  const handleViewRecipe = () => {
    // Store recipe in localStorage for the detail page
    localStorage.setItem(`recipe_${recipe.id}`, JSON.stringify(recipe))
    // Navigate to recipe detail page
    router.push(`/recipe/${recipe.id}`)
  }

  return (
    <Card className="recipe-card w-full h-full flex flex-col hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Image Section */}
      {recipe.image_url && (
        <div className="relative w-full h-48 overflow-hidden bg-gray-100">
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop'
            }}
          />
          {/* Match Percentage Badge */}
          {recipe.match_percentage !== undefined && (
            <Badge 
              variant={recipe.match_percentage >= 80 ? "default" : recipe.match_percentage >= 50 ? "secondary" : "outline"}
              className="absolute top-2 right-2 text-xs font-bold bg-white/90 backdrop-blur"
            >
              {recipe.match_percentage.toFixed(0)}% Match
            </Badge>
          )}
          {recipe.difficulty && (
            <Badge 
              variant={recipe.difficulty === 'Easy' ? 'default' : recipe.difficulty === 'Medium' ? 'secondary' : 'destructive'}
              className="absolute top-2 left-2"
            >
              {recipe.difficulty}
            </Badge>
          )}
        </div>
      )}
      
      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-2 text-lg">{recipe.name}</CardTitle>
        <CardDescription className="line-clamp-2 text-sm">{recipe.description}</CardDescription>
        
        {/* Cuisine and Algorithm badges */}
        <div className="flex gap-2 flex-wrap">
          {recipe.cuisine && (
            <Badge variant="outline" className="text-xs">
              {recipe.cuisine}
            </Badge>
          )}
          {recipe.algorithm_used && (
            <Badge variant="secondary" className="text-xs">
              AI: {recipe.algorithm_used.replace('_', ' ')}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-3 pt-0">
        {/* Matched/Missing Ingredients Summary */}
        {recipe.total_matched !== undefined && recipe.total_user_ingredients !== undefined && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Your ingredients:</span>
            <Badge variant="outline" className="text-xs">
              {recipe.total_matched}/{recipe.total_user_ingredients}
            </Badge>
          </div>
        )}
        
        {/* Matched Ingredients */}
        {recipe.matched_ingredients && recipe.matched_ingredients.length > 0 && (
          <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
            <strong className="text-green-700">✓ You have:</strong>
            <div className="text-green-600 mt-1">
              {recipe.matched_ingredients.slice(0, 3).join(', ')}
              {recipe.matched_ingredients.length > 3 && ` +${recipe.matched_ingredients.length - 3}`}
            </div>
          </div>
        )}
        
        {/* Missing Ingredients */}
        {recipe.missing_ingredients && recipe.missing_ingredients.length > 0 && (
          <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs">
            <strong className="text-orange-700">🛒 You need:</strong>
            <div className="text-orange-600 mt-1">
              {recipe.missing_ingredients.slice(0, 2).join(', ')}
              {recipe.missing_ingredients.length > 2 && ` +${recipe.missing_ingredients.length - 2}`}
            </div>
          </div>
        )}
        {/* Time and Servings Info */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          {recipe.prep_time && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">⏱️</span>
              <span className="text-xs">Prep: {formatTime(recipe.prep_time)}</span>
            </div>
          )}
          {recipe.cook_time && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">👨‍🍳</span>
              <span className="text-xs">Cook: {formatTime(recipe.cook_time)}</span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">👥</span>
              <span className="text-xs">{recipe.servings} servings</span>
            </div>
          )}
        </div>

        {/* Total Time */}
        {totalTime() > 0 && (
          <div className="text-sm font-medium text-primary">
            Total: {totalTime()} minutes
          </div>
        )}

        {/* Key Ingredients Preview */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Key Ingredients:</p>
            <div className="flex flex-wrap gap-1">
              {recipe.ingredients.slice(0, 4).map((ingredient, index) => (
                <Badge key={index} variant="outline" className="text-xs py-0">
                  {ingredient.name}
                </Badge>
              ))}
              {recipe.ingredients.length > 4 && (
                <Badge variant="outline" className="text-xs py-0">
                  +{recipe.ingredients.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Missing Ingredients Alert */}
        {recipe.missing_ingredients && recipe.missing_ingredients.length > 0 && (
          <div className="p-2 bg-orange-50 border border-orange-200 rounded-md">
            <p className="text-xs font-semibold text-orange-800 mb-1">Missing:</p>
            <div className="flex flex-wrap gap-1">
              {recipe.missing_ingredients.slice(0, 3).map((ingredient, index) => (
                <Badge key={index} variant="destructive" className="text-xs py-0">
                  {ingredient}
                </Badge>
              ))}
              {recipe.missing_ingredients.length > 3 && (
                <Badge variant="destructive" className="text-xs py-0">
                  +{recipe.missing_ingredients.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Match Score */}
        {recipe.match_score !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Match Score:</span>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${recipe.match_score * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-primary">
                {(recipe.match_score * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-3">
        <Button 
          variant="default" 
          className="w-full text-sm"
          onClick={handleViewRecipe}
        >
          View Full Recipe →
        </Button>
      </CardFooter>
    </Card>
  )
}
