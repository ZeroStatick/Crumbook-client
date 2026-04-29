import React, { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { get_all_recipes } from "../../../API/recipe.api"
import { toggle_favorite } from "../../../API/api.api"
import { DEFAULT_RECIPE_IMAGE } from "../../../constant/images.js"
import useUserStore from "../../global/user"
import toast from "react-hot-toast"
import RecipeFilters from "../RecipeFilters"
import ShareButton from "../ShareButton"

// SKELETON : Refactorisé en Dark Mode
const RecipeCardSkeleton = () => (
  <div className="flex animate-pulse flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0f141d] shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
    <div className="grow p-5">
      <div className="mb-4 h-7 w-3/4 rounded bg-zinc-800"></div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-zinc-800"></div>
        <div className="h-4 w-full rounded bg-zinc-800"></div>
        <div className="h-4 w-2/3 rounded bg-zinc-800"></div>
      </div>
    </div>
    <div className="border-t border-white/10 bg-[#0d1219] px-5 py-4">
      <div className="h-4 w-24 rounded bg-zinc-800"></div>
    </div>
  </div>
)

const RecipePage = () => {
  const { user, setUser } = useUserStore()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  const [guestFavorites, setGuestFavorites] = useState(() => {
    const saved = localStorage.getItem("recipe_favorites")
    return saved ? JSON.parse(saved) : []
  })

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
  const [searchInput, setSearchInput] = useState(searchTerm)

  useEffect(() => {
    setSearchInput(searchTerm)
  }, [searchTerm])

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

  const allTags = Array.from(
    new Set(
      recipes
        .flatMap((r) => r.tags || [])
        .filter(Boolean)
        .map((t) => t.trim()),
    ),
  ).sort()

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

  const indexOfLastRecipe = currentPage * recipesPerPage
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage
  const currentRecipes = sortedRecipes.slice(
    indexOfFirstRecipe,
    indexOfLastRecipe,
  )
  const totalPages = Math.ceil(sortedRecipes.length / recipesPerPage)

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
          <div className="h-9 w-48 animate-pulse rounded bg-zinc-800"></div>
          <div className="h-10 w-40 animate-pulse rounded bg-zinc-800"></div>
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
      <div className="mb-10 overflow-hidden rounded-4xl border border-white/10 bg-[#10151f]/95 p-8 shadow-2xl shadow-black/35 backdrop-blur-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs tracking-[0.32em] text-amber-200 uppercase">
              Curated for you
            </p>
            <h1 className="font-serif text-5xl font-black tracking-tight text-white sm:text-6xl">
              Discover New Flavors
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-amber-100/75">
              Curated recipes for every season, mood, and kitchen. Explore bold
              tastes and favorite dishes in one beautiful place.
            </p>
          </div>
          <Link
            to="/recipes/new"
            className="inline-flex items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/15 px-6 py-3 text-sm font-semibold text-amber-100 shadow-lg shadow-amber-950/15 transition-all hover:bg-amber-400/25"
          >
            + Create New
          </Link>
        </div>
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
        <div className="rounded-2xl border-2 border-dashed border-zinc-800 bg-[#1c1c1c] py-20 text-center">
          <div className="mb-4 text-4xl opacity-50">🔍</div>
          <h3 className="mb-1 font-serif text-lg text-[#EAE0D5]">
            No recipes found
          </h3>
          <p className="mb-6 text-zinc-500">
            Try adjusting your filters or search terms.
          </p>
          <button
            onClick={clearFilters}
            className="rounded-lg bg-zinc-800 px-6 py-2 font-medium text-zinc-300 transition-colors hover:text-white"
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
                className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0f141d] transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/20 hover:shadow-[0_30px_60px_rgba(0,0,0,0.35)]"
              >
                <div className="p-4">
                  <div className="relative overflow-hidden rounded-[1rem] border border-white/10 bg-[#0a0f16]">
                    <img
                      src={recipe.image || DEFAULT_RECIPE_IMAGE}
                      alt={recipe.title}
                      className="h-56 w-full rounded-[1rem] object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {recipe.imageSource === "ai" && (
                      <span className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-purple-300 uppercase shadow-lg backdrop-blur-md">
                        ✨ AI GENERATED
                      </span>
                    )}

                    <button
                      onClick={(e) => toggleFavoriteHandler(recipeId, e)}
                      className={`absolute top-3 right-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/40 text-base transition-all hover:bg-black/60 ${
                        isFav
                          ? "text-red-400"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      {isFav ? "❤️" : "🤍"}
                    </button>
                  </div>
                </div>

                <div className="grow p-6">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {recipe.difficulty && (
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase ${
                          recipe.difficulty === "Easy"
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                            : recipe.difficulty === "Medium"
                              ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
                              : "border-rose-400/20 bg-rose-400/10 text-rose-200"
                        }`}
                      >
                        {recipe.difficulty}
                      </span>
                    )}
                    {totalTime > 0 && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-white/70 uppercase">
                        ⏱️ {totalTime} min
                      </span>
                    )}
                    {recipe.servings && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-white/70 uppercase">
                        🍽️ Serves {recipe.servings}
                      </span>
                    )}
                  </div>

                  <h3 className="mb-3 font-serif text-2xl leading-tight font-black text-white transition-colors">
                    {recipe.title}
                  </h3>

                  <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-white/65">
                    {recipe.description ||
                      "A delicious recipe waiting for you to try it out."}
                  </p>

                  <div className="mt-auto flex flex-wrap gap-2">
                    {(recipe.tags || []).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/70"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-white/10 bg-[#0d1219] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <ShareButton
                      recipeId={recipeId}
                      className="text-white/60 transition-colors hover:text-white"
                    />
                  </div>
                  <Link
                    to={`/recipe/${recipeId}`}
                    className="flex items-center gap-1 text-sm font-medium text-white/70 transition-transform hover:translate-x-1 hover:text-white"
                  >
                    View Recipe <span className="text-amber-200">→</span>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* PAGINATION : Boutons dark mode */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-zinc-300 transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-zinc-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-zinc-300 transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default RecipePage
