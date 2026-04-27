import React, { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { get_all_recipes } from "../../../API/recipe.api"
import { toggle_favorite } from "../../../API/api.api"
import useUserStore from "../../global/user"
import toast from "react-hot-toast"
import RecipeFilters from "../RecipeFilters"
import ShareButton from "../ShareButton"

const RecipeCardSkeleton = () => (
// ... (rest of the file stays mostly same but with the component call)
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col animate-pulse">
    <div className="p-5 flex-grow">
      <div className="h-7 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
    <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
)

const RecipePage = () => {
  const { user, setUser } = useUserStore()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Local guest favorites as fallback
  const [guestFavorites, setGuestFavorites] = useState(() => {
    const saved = localStorage.getItem("recipe_favorites")
    return saved ? JSON.parse(saved) : []
  })

  // Determine current favorites based on login status
  const favorites = user ? (user.favorites || []) : guestFavorites

  const toggleFavoriteHandler = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (user) {
      try {
        const updatedUser = await toggle_favorite(id)
        setUser(updatedUser)
        const isNowFav = updatedUser.favorites.includes(id)
        toast.success(isNowFav ? "Added to favorites" : "Removed from favorites")
      } catch (err) {
        toast.error("Failed to update favorites")
      }
    } else {
      // Guest mode
      const newFavs = guestFavorites.includes(id)
        ? guestFavorites.filter(favId => favId !== id)
        : [...guestFavorites, id]
      
      setGuestFavorites(newFavs)
      localStorage.setItem("recipe_favorites", JSON.stringify(newFavs))
      toast.success(newFavs.includes(id) ? "Added to favorites (Guest)" : "Removed from favorites (Guest)")
    }
  }

  // URL Search Params for Filtering and Pagination
  const [searchParams, setSearchParams] = useSearchParams()
  const searchTerm = searchParams.get("search") || ""
  const currentPage = parseInt(searchParams.get("page") || "1", 10)
  const sortBy = searchParams.get("sort") || "newest"
  const onlyFavorites = searchParams.get("favorites") === "true"
  const maxTime = searchParams.get("maxTime") || ""
  const difficulty = searchParams.get("difficulty") || ""
  const servings = searchParams.get("servings") || ""
  const selectedTag = searchParams.get("tag") || ""
  
  const recipesPerPage = 20

  // Local state for debounced search
  const [searchInput, setSearchInput] = useState(searchTerm)

  // Sync local input with URL if it changes externally
  useEffect(() => {
    setSearchInput(searchTerm)
  }, [searchTerm])

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchTerm) {
        setSearchParams(
          (prev) => {
            if (searchInput) {
              prev.set("search", searchInput)
            } else {
              prev.delete("search")
            }
            prev.set("page", "1")
            return prev
          },
          { replace: true },
        )
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [searchInput, setSearchParams, searchTerm])

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await get_all_recipes()
        if (Array.isArray(data)) {
          setRecipes(data)
        } else {
          setRecipes([])
        }
      } catch (err) {
        setError(err.message || "Failed to fetch recipes")
        toast.error(err.message || "Failed to fetch recipes")
      } finally {
        setLoading(false)
      }
    }
    fetchRecipes()
  }, [])

  // Extract unique tags from all recipes
  const allTags = Array.from(
    new Set(
      recipes.flatMap((r) => r.tags || [])
        .filter(Boolean)
        .map(t => t.trim())
    )
  ).sort()

  // Handle filtering logic
  const filteredRecipes = Array.isArray(recipes) 
    ? recipes.filter((recipe) => {
        if (!recipe) return false
        
        const matchesSearch = (recipe.title || "").toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFavorites = onlyFavorites ? favorites.includes(recipe._id || recipe.id) : true
        const matchesDifficulty = difficulty ? recipe.difficulty === difficulty : true
        
        const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)
        const matchesMaxTime = maxTime ? totalTime <= parseInt(maxTime, 10) : true
        
        const matchesTag = selectedTag ? (recipe.tags || []).includes(selectedTag) : true
        
        let matchesServings = true
        if (servings === "1-2") matchesServings = recipe.servings <= 2
        else if (servings === "3-4") matchesServings = recipe.servings >= 3 && recipe.servings <= 4
        else if (servings === "5+") matchesServings = recipe.servings >= 5

        return matchesSearch && matchesFavorites && matchesDifficulty && matchesMaxTime && matchesTag && matchesServings
      })
    : []

  // Handle sorting logic
  const getSortedRecipes = () => {
    return [...filteredRecipes].sort((a, b) => {
      switch (sortBy) {
        case "title-asc": return a.title.localeCompare(b.title)
        case "title-desc": return b.title.localeCompare(a.title)
        case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "newest":
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
  }

  const sortedRecipes = getSortedRecipes()

  // Pagination
  const indexOfLastRecipe = currentPage * recipesPerPage
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage
  const currentRecipes = sortedRecipes.slice(indexOfFirstRecipe, indexOfLastRecipe)
  const totalPages = Math.ceil(sortedRecipes.length / recipesPerPage)

  // Handlers for URL params
  const updateFilter = (key, value) => {
    setSearchParams((prev) => {
      if (!value || value === "") prev.delete(key)
      else prev.set(key, value)
      prev.set("page", "1")
      return prev
    })
  }

  const handlePageChange = (pageNumber) => {
    setSearchParams((prev) => {
      prev.set("page", pageNumber.toString())
      return prev
    })
  }

  const clearFilters = () => setSearchParams({})

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div className="h-9 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <RecipeCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-4 px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Explore Recipes</h1>
        <Link
          to="/recipes/new"
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 shadow-sm"
        >
          + Create New
        </Link>
      </div>

      <RecipeFilters 
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onlyFavorites={onlyFavorites}
        updateFilter={updateFilter}
        sortBy={sortBy}
        difficulty={difficulty}
        maxTime={maxTime}
        servings={servings}
        selectedTag={selectedTag}
        allTags={allTags}
        clearFilters={clearFilters}
      />

      {sortedRecipes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No recipes found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
          <button
            onClick={clearFilters}
            className="px-6 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-all font-medium"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentRecipes.map((recipe) => {
            const recipeId = recipe._id || recipe.id
            const isFav = favorites.includes(recipeId)
            const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)
            
            return (
              <div
                key={recipeId}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative group"
              >
                <button
                  onClick={(e) => toggleFavoriteHandler(recipeId, e)}
                  className={`absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all hover:scale-110 z-10 ${
                    isFav ? "text-red-500 scale-105" : "text-gray-300 hover:text-red-400"
                  }`}
                >
                  {isFav ? "❤️" : "🤍"}
                </button>

                <div className="p-6 flex-grow">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {recipe.difficulty && (
                      <span className={`text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-lg ${
                        recipe.difficulty === "Easy" ? "bg-emerald-50 text-emerald-600" :
                        recipe.difficulty === "Medium" ? "bg-amber-50 text-amber-600" :
                        "bg-rose-50 text-rose-600"
                      }`}>
                        {recipe.difficulty}
                      </span>
                    )}
                    {totalTime > 0 && (
                      <span className="text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-lg bg-slate-50 text-slate-500">
                        ⏱️ {totalTime} min
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-extrabold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                    {recipe.title}
                  </h3>
                  
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                    {recipe.description || "A delicious recipe waiting for you to try it out."}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-auto">
                    {(recipe.tags || []).slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 mt-auto flex justify-between items-center">
                  <div className="flex gap-3">
                    <ShareButton recipeId={recipeId} className="px-2 py-1 text-xs" />
                    <span className="text-xs font-bold text-gray-400 self-center">
                      Serves {recipe.servings || "?"}
                    </span>
                  </div>
                  <Link
                    to={`/recipe/${recipeId}`}
                    className="text-blue-600 font-bold text-sm hover:translate-x-1 transition-transform flex items-center gap-1"
                  >
                    View Recipe <span>→</span>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded border bg-white px-4 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="font-medium text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded border bg-white px-4 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default RecipePage
