"""
FAST Simplified Recipe Service - Synchronous, no API calls
"""

import time
from typing import List, Dict, Optional, Tuple
import logging
from services.indian_recipe_service import IndianRecipeService
from services.accurate_image_service import get_accurate_image_service

logger = logging.getLogger(__name__)

class SimpleRecipeService:
    """Fast, synchronous recipe service"""
    
    def __init__(self):
        self.indian_service = IndianRecipeService()
        self.accurate_image_service = get_accurate_image_service()
        # Enhanced caching for better performance
        self._cache_ttl_seconds: int = 600  # 10 minutes (increased for better performance)
        self._cache_by_ingredients: Dict[str, Tuple[float, List[Dict]]] = {}
        self._cache_by_name: Dict[str, Tuple[float, List[Dict]]] = {}
        self._image_cache: Dict[str, str] = {}  # Cache for images
    
    async def search_by_ingredients(self, ingredients: List[str], limit: int = 10) -> List[Dict]:
        """Search recipes by ingredients - FAST (no API calls)"""
        if not ingredients:
            return []
        
        # Cache check
        key = ",".join(sorted(set([i.strip().lower() for i in ingredients if i])))
        cached = self._cache_by_ingredients.get(key)
        if cached and (time.time() - cached[0]) < self._cache_ttl_seconds:
            logger.info(f"⚡ Returning {len(cached[1])} cached recipes")
            return cached[1][:limit]
        
        # Use Indian dataset service (synchronous - no await needed)
        result = self.indian_service.search_by_ingredients(ingredients, limit)
        
        # Enhance with accurate images
        result = self._enhance_with_accurate_images(result)
        
        # Update cache
        self._cache_by_ingredients[key] = (time.time(), result)
        
        logger.info(f"⚡ Returning {len(result)} recipes (instant)")
        return result
    
    async def search_by_name(self, query: str, limit: int = 10) -> List[Dict]:
        """Search recipes by name - FAST"""
        if not query:
            return []
        
        # Cache check
        qkey = query.strip().lower()
        cached = self._cache_by_name.get(qkey)
        if cached and (time.time() - cached[0]) < self._cache_ttl_seconds:
            logger.info(f"⚡ Returning {len(cached[1])} cached recipes")
            return cached[1][:limit]
        
        # Use Indian dataset service (synchronous)
        result = self.indian_service.search_by_name(query, limit)
        
        # Enhance with accurate images
        result = self._enhance_with_accurate_images(result)
        
        # Update cache
        self._cache_by_name[qkey] = (time.time(), result)
        
        logger.info(f"⚡ Returning {len(result)} recipes for '{query}' (instant)")
        return result
    
    async def get_random_recipes(self, count: int = 10) -> List[Dict]:
        """Get random/featured recipes - FAST"""
        result = self.indian_service.get_random_recipes(count)
        
        # Enhance with accurate images
        result = self._enhance_with_accurate_images(result)
        
        logger.info(f"⚡ Returning {len(result)} featured recipes (instant)")
        return result
    
    def _enhance_with_accurate_images(self, recipes: List[Dict]) -> List[Dict]:
        """Enhance recipes with accurate, recipe-specific images (OPTIMIZED)"""
        for recipe in recipes:
            recipe_name = recipe.get('name', '')
            cuisine = recipe.get('cuisine', '')
            
            # Create cache key for image
            cache_key = f"{recipe_name}_{cuisine}".lower()
            
            # Check image cache first
            if cache_key in self._image_cache:
                recipe['image_url'] = self._image_cache[cache_key]
                recipe['image_source'] = 'accurate_recipe_specific_cached'
            else:
                # Extract ingredients for better image matching (only if not cached)
                ingredients_str = ''
                if 'ingredients' in recipe:
                    ingredients_list = []
                    for ing in recipe['ingredients']:
                        if isinstance(ing, dict):
                            ingredients_list.append(ing.get('name', ''))
                        else:
                            ingredients_list.append(str(ing))
                    ingredients_str = ', '.join(ingredients_list)
                
                # Get accurate image for this specific recipe
                accurate_image_url = self.accurate_image_service.get_recipe_image(
                    recipe_name=recipe_name,
                    cuisine=cuisine,
                    ingredients=ingredients_str
                )
                
                # Cache the image
                self._image_cache[cache_key] = accurate_image_url
                
                # Update recipe with accurate image
                recipe['image_url'] = accurate_image_url
                recipe['image_source'] = 'accurate_recipe_specific'
        
        return recipes
