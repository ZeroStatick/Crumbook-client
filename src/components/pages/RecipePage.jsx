import React, { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { get_all_recipes } from "../../../API/recipe.api"
import toast from "react-hot-toast"

const RecipeCardSkeleton = () => (
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
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Favorites logic (Local Storage)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("recipe_favorites")
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem("recipe_favorites", JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (id, e) => {
    e.preventDefault() // Prevent navigation to detail page
    e.stopPropagation()
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id],
    )
  }

  // URL Search Params for Filtering and Pagination
  const [searchParams, setSearchParams] = useSearchParams()
  const searchTerm = searchParams.get("search") || ""
  const currentPage = parseInt(searchParams.get("page") || "1", 10)
  const sortBy = searchParams.get("sort") || "newest"
  const onlyFavorites = searchParams.get("favorites") === "true"
  const recipesPerPage = 20

  // Local state for debounced search
  const [searchInput, setSearchInput] = useState(searchTerm)

  // Sync local input with URL if it changes externally (e.g. Clear Filters)
  useEffect(() => {
    setSearchInput(searchTerm)
  }, [searchTerm])

  // Debounce effect
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
    }, 400) // 400ms debounce

    return () => clearTimeout(timer)
  }, [searchInput, setSearchParams, searchTerm])

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await get_all_recipes()
        console.log("API response data:", data)

        if (Array.isArray(data)) {
          setRecipes(data)
        } else {
          const errorMessage = `Expected an array but got: ${typeof data}`
          console.error(errorMessage, data)
          setError(errorMessage)
          setRecipes([])
        }
      } catch (err) {
        console.error("Fetch error:", err)
        setError(err.message || "Failed to fetch recipes")
        toast.error(err.message || "Failed to fetch recipes")
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [])

  // Handle filtering safely
  const filteredRecipes = Array.isArray(recipes) 
    ? recipes.filter((recipe) => {
        if (!recipe) return false
        const title = (recipe.title || recipe.name || "").toString().toLowerCase()
        const matchesSearch = title.includes(searchTerm.toLowerCase())
        const matchesFavorites = onlyFavorites ? favorites.includes(recipe._id || recipe.id) : true
        return matchesSearch && matchesFavorites
      })
    : []

  // Handle sorting safely
  const getSortedRecipes = () => {
    try {
      return [...filteredRecipes].sort((a, b) => {
        if (!a || !b) return 0
        switch (sortBy) {
          case "title-asc":
            return (a.title || a.name || "").toString().localeCompare((b.title || b.name || "").toString())
          case "title-desc":
            return (b.title || b.name || "").toString().localeCompare((a.title || a.name || "").toString())
          case "oldest":
            return (
              new Date(a.createdAt || a._id || 0).getTime() -
              new Date(b.createdAt || b._id || 0).getTime()
            )
          case "newest":
          default:
            return (
              new Date(b.createdAt || b._id || 0).getTime() -
              new Date(a.createdAt || a._id || 0).getTime()
            )
        }
      })
    } catch (err) {
      console.error("Sorting error:", err)
      return filteredRecipes
    }
  }

  const sortedRecipes = getSortedRecipes()

  // Handle pagination
  const indexOfLastRecipe = currentPage * recipesPerPage
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage
  const currentRecipes = sortedRecipes.slice(
    indexOfFirstRecipe,
    indexOfLastRecipe,
  )
  const totalPages = Math.ceil(sortedRecipes.length / recipesPerPage)

  // Handlers
  const handlePageChange = (pageNumber) => {
    setSearchParams((prev) => {
      prev.set("page", pageNumber.toString())
      return prev
    })
  }

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value)
  }

  const handleSortChange = (e) => {
    const value = e.target.value
    setSearchParams((prev) => {
      if (value === "newest") {
        prev.delete("sort")
      } else {
        prev.set("sort", value)
      }
      prev.set("page", "1")
      return prev
    })
  }

  const toggleFavoritesFilter = () => {
    setSearchParams((prev) => {
      if (onlyFavorites) {
        prev.delete("favorites")
      } else {
        prev.set("favorites", "true")
      }
      prev.set("page", "1")
      return prev
    })
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="h-9 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="h-10 bg-gray-100 rounded flex-grow max-w-md w-full animate-pulse"></div>
          <div className="h-10 bg-gray-100 rounded w-32 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error)
    return (
      <div className="p-8 text-center text-red-600">
        Error loading recipes: {error}
      </div>
    )

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">All Recipes</h1>
        <Link
          to="/recipes/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          + Create New Recipe
        </Link>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-grow max-w-md w-full">
          <input
            type="text"
            placeholder="Search recipes by title..."
            value={searchInput}
            onChange={handleSearchChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={toggleFavoritesFilter}
            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 ${
              onlyFavorites 
                ? "bg-red-50 border-red-200 text-red-600 shadow-sm" 
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {onlyFavorites ? "❤️ Favorites" : "🤍 Favorites"}
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={handleSortChange}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
            </select>
          </div>
        </div>

        {(searchTerm || sortBy !== "newest" || currentPage !== 1 || onlyFavorites) && (
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {sortedRecipes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-500 mb-4">No recipes found matching your search.</p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Show All Recipes
          </button>
        </div>
      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentRecipes.map((recipe) => {
            const recipeId = recipe._id || recipe.id
            const isFav = favorites.includes(recipeId)
            
            return (
              <div
                key={recipeId}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col relative group"
              >
                <button
                  onClick={(e) => toggleFavorite(recipeId, e)}
                  className={`absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-transform hover:scale-110 z-10 ${
                    isFav ? "text-red-500" : "text-gray-400 hover:text-red-400"
                  }`}
                  title={isFav ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFav ? "❤️" : "🤍"}
                </button>

                <div className="p-5 flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate pr-8">
                    {recipe.title || "Untitled Recipe"}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {recipe.description || "No description provided."}
                  </p>
                </div>
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                  <Link
                    to={`/recipes/${recipeId}`}
                    className="text-blue-600 font-semibold text-sm hover:underline flex items-center"
                  >
                    View Details 
                    <span className="ml-1">→</span>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-10 gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-gray-600 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default RecipePage
