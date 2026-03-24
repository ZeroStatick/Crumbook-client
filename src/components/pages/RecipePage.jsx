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
    ? recipes.filter((recipe) =>
        recipe && (recipe.title || "").toLowerCase().includes(searchTerm.toLowerCase())
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

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search recipes by title..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full max-w-md p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-500">No recipes found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentRecipes.map((recipe) => (
            <div
              key={recipe._id || recipe.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="p-5 flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                  {recipe.title || "Untitled Recipe"}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {recipe.description || "No description provided."}
                </p>
              </div>
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                <Link
                  to={`/recipes/${recipe._id || recipe.id}`}
                  className="text-blue-600 font-semibold text-sm hover:underline flex items-center"
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
