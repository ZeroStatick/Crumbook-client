import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { get_all_recipes } from "../../../API/recipe.api"
import toast from "react-hot-toast"

const RecipePage = () => {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtering and Pagination State
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const recipesPerPage = 20

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await get_all_recipes()

        if (Array.isArray(data)) {
          setRecipes(data)
        } else {
          console.error("Expected an array but got:", data)
          setRecipes([])
        }
      } catch (err) {
        setError(err.message)
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [])

  // Handle filtering safely - check if recipes is an array and each recipe is an object
  const filteredRecipes = Array.isArray(recipes)
    ? recipes.filter(
        (recipe) =>
          recipe &&
          (recipe.title || "").toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : []

  // Handle pagination
  const indexOfLastRecipe = currentPage * recipesPerPage
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage
  const currentRecipes = filteredRecipes.slice(
    indexOfFirstRecipe,
    indexOfLastRecipe,
  )
  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage)

  // Handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  if (loading) return <div className="p-8 text-center">Loading recipes...</div>

  if (error)
    return (
      <div className="p-8 text-center text-red-600">
        Error loading recipes: {error}
      </div>
    )

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">All Recipes</h1>
        <Link
          to="/recipes/new"
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          + Create New Recipe
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search recipes by title..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full max-w-md rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-12 text-center">
          <p className="text-gray-500">
            No recipes found matching your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {currentRecipes.map((recipe) => (
            <div
              key={recipe._id || recipe.id}
              className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex-grow p-5">
                <h3 className="mb-2 truncate text-xl font-bold text-gray-900">
                  {recipe.title || "Untitled Recipe"}
                </h3>
                <p className="line-clamp-3 text-sm text-gray-600">
                  {recipe.description || "No description provided."}
                </p>
              </div>
              <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                <Link
                  to={`/recipes/${recipe._id || recipe.id}`}
                  className="flex items-center text-sm font-semibold text-blue-600 hover:underline"
                >
                  View Details
                  <span className="ml-1">→</span>
                </Link>
              </div>
            </div>
          ))}
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
