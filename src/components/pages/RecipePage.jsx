import React, { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { get_all_recipes } from "../../../API/recipe.api"
import { toggle_favorite } from "../../../API/api.api"
import { DEFAULT_RECIPE_IMAGE } from "../../../constant/images.js"
import useUserStore from "../../global/user"
import toast from "react-hot-toast"
import RecipeFilters from "../RecipeFilters"
import ShareButton from "../ShareButton"

const RecipeCardSkeleton = () => (
  // ... (rest of the file stays mostly same but with the component call)
  <div className="theme-card flex animate-pulse flex-col overflow-hidden rounded-xl">
    <div className="flex-grow p-5">
      <div className="mb-4 h-7 w-3/4 rounded bg-amber-100"></div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-amber-100"></div>
        <div className="h-4 w-full rounded bg-amber-100"></div>
        <div className="h-4 w-2/3 rounded bg-amber-100"></div>
      </div>
    </div>
    <div className="border-cb-border border-t bg-amber-50/60 px-5 py-4">
      <div className="h-4 w-24 rounded bg-amber-100"></div>
    </div>
  </div>
)

const RecipePage = () => {
  const { user, setUser } = useUserStore()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  // Local guest favorites as fallback
  const [guestFavorites, setGuestFavorites] = useState(() => {
    const saved = localStorage.getItem("recipe_favorites")
    return saved ? JSON.parse(saved) : []
  })

  // Determine current favorites based on login status
  const favorites = user ? user.favorites || [] : guestFavorites

  const toggleFavoriteHandler = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()

    if (user) {
      try {
        const updatedUser = await toggle_favorite(id)
        setUser(updatedUser)
        const isNowFav = updatedUser.favorites.includes(id)
        toast.success(
          isNowFav ? "Added to favorites" : "Removed from favorites",
        )
      } catch {
        toast.error("Failed to update favorites")
      }
    } else {
      // Guest mode
      const newFavs = guestFavorites.includes(id)
        ? guestFavorites.filter((favId) => favId !== id)
        : [...guestFavorites, id]

      setGuestFavorites(newFavs)
      localStorage.setItem("recipe_favorites", JSON.stringify(newFavs))
      toast.success(
        newFavs.includes(id)
          ? "Added to favorites (Guest)"
          : "Removed from favorites (Guest)",
      )
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
      } catch {
        toast.error("Failed to fetch recipes")
      } finally {
        setLoading(false)
      }
    }
    fetchRecipes()
  }, [])

  // Extract unique tags from all recipes
  const allTags = Array.from(
    new Set(
      recipes
        .flatMap((r) => r.tags || [])
        .filter(Boolean)
        .map((t) => t.trim()),
    ),
  ).sort()

  // Handle filtering logic
  const filteredRecipes = Array.isArray(recipes)
    ? recipes.filter((recipe) => {
        if (!recipe) return false

        const matchesSearch = (recipe.title || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
        const matchesFavorites = onlyFavorites
          ? favorites.includes(recipe._id || recipe.id)
          : true
        const matchesDifficulty = difficulty
          ? recipe.difficulty === difficulty
          : true

        const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)
        const matchesMaxTime = maxTime
          ? totalTime <= parseInt(maxTime, 10)
          : true

        const matchesTag = selectedTag
          ? (recipe.tags || []).includes(selectedTag)
          : true

        let matchesServings = true
        if (servings === "1-2") matchesServings = recipe.servings <= 2
        else if (servings === "3-4")
          matchesServings = recipe.servings >= 3 && recipe.servings <= 4
        else if (servings === "5+") matchesServings = recipe.servings >= 5

        return (
          matchesSearch &&
          matchesFavorites &&
          matchesDifficulty &&
          matchesMaxTime &&
          matchesTag &&
          matchesServings
        )
      })
    : []

  // Handle sorting logic
  const getSortedRecipes = () => {
    return [...filteredRecipes].sort((a, b) => {
      switch (sortBy) {
        case "title-asc":
          return a.title.localeCompare(b.title)
        case "title-desc":
          return b.title.localeCompare(a.title)
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      }
    })
  }

  const sortedRecipes = getSortedRecipes()

  // Pagination
  const indexOfLastRecipe = currentPage * recipesPerPage
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage
  const currentRecipes = sortedRecipes.slice(
    indexOfFirstRecipe,
    indexOfLastRecipe,
  )
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
      <div className="mx-auto max-w-6xl p-4 px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-9 w-48 animate-pulse rounded bg-amber-100"></div>
          <div className="h-10 w-40 animate-pulse rounded bg-amber-100"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-4 px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-cb-text text-3xl font-bold">Explore Recipes</h1>
        <Link
          to="/recipes/new"
          className="theme-button-primary px-4 py-2 shadow-sm"
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
        <div className="theme-card border-cb-border rounded-2xl border-2 border-dashed py-20 text-center">
          <div className="mb-4 text-4xl">🔍</div>
          <h3 className="text-cb-text mb-1 text-lg font-bold">
            No recipes found
          </h3>
          <p className="text-cb-text-soft mb-6">
            Try adjusting your filters or search terms.
          </p>
          <button
            onClick={clearFilters}
            className="theme-button-secondary px-6 py-2 font-medium"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {currentRecipes.map((recipe) => {
            const recipeId = recipe._id || recipe.id
            const isFav = favorites.includes(recipeId)
            const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)

            return (
              <div
                key={recipeId}
                className="theme-card group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={recipe.image || DEFAULT_RECIPE_IMAGE}
                    alt={recipe.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {recipe.imageSource === "ai" && (
                    <span className="absolute bottom-2 left-2 rounded-md bg-purple-600/80 px-2 py-1 text-[10px] font-bold text-white shadow-lg backdrop-blur-sm">
                      ✨ AI GENERATED
                    </span>
                  )}
                  <button
                    onClick={(e) => toggleFavoriteHandler(recipeId, e)}
                    className={`absolute top-4 right-4 z-10 rounded-full bg-white/90 p-2.5 shadow-md backdrop-blur-sm transition-all hover:scale-110 ${
                      isFav
                        ? "scale-105 text-red-500"
                        : "text-gray-300 hover:text-red-400"
                    }`}
                  >
                    {isFav ? "❤️" : "🤍"}
                  </button>
                </div>

                <div className="flex-grow p-6">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {recipe.difficulty && (
                      <span
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-black tracking-widest uppercase ${
                          recipe.difficulty === "Easy"
                            ? "bg-amber-50 text-amber-700"
                            : recipe.difficulty === "Medium"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-50 text-red-600"
                        }`}
                      >
                        {recipe.difficulty}
                      </span>
                    )}
                    {totalTime > 0 && (
                      <span className="text-cb-text-soft rounded-lg bg-orange-50 px-2.5 py-1 text-[10px] font-black tracking-widest uppercase">
                        ⏱️ {totalTime} min
                      </span>
                    )}
                  </div>

                  <h3 className="text-cb-text group-hover:text-cb-primary mb-2 text-xl leading-tight font-extrabold transition-colors">
                    {recipe.title}
                  </h3>

                  <p className="text-cb-text-soft mb-4 line-clamp-2 text-sm leading-relaxed">
                    {recipe.description ||
                      "A delicious recipe waiting for you to try it out."}
                  </p>

                  <div className="mt-auto flex flex-wrap gap-1">
                    {(recipe.tags || []).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-cb-text-soft rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-cb-border mt-auto flex items-center justify-between border-t bg-amber-50/45 px-6 py-4">
                  <div className="flex gap-3">
                    <ShareButton
                      recipeId={recipeId}
                      className="px-2 py-1 text-xs"
                    />
                    <span className="text-cb-text-soft/75 self-center text-xs font-bold">
                      Serves {recipe.servings || "?"}
                    </span>
                  </div>
                  <Link
                    to={`/recipe/${recipeId}`}
                    className="text-cb-primary flex items-center gap-1 text-sm font-bold transition-transform hover:translate-x-1"
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
            className="theme-button-secondary rounded border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-cb-text-soft font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="theme-button-secondary rounded border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default RecipePage
