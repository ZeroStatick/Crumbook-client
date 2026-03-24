import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../../API/api.api"
import { RECIPE_URL } from "../../../constant/endpoints"
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
        const response = await api.get(RECIPE_URL)
        setRecipes(response.data)
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [])

  // Handle filtering
  const filteredRecipes = recipes.filter((recipe) =>
    (recipe.title || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
    setCurrentPage(1) // Reset to first page whenever the user types a new search
  }

  if (loading) return <div style={{ padding: "20px" }}>Loading recipes...</div>
  if (error)
    return (
      <div style={{ padding: "20px", color: "red" }}>
        Error loading recipes: {error}
      </div>
    )

  return (
    <div
      className="recipe-page"
      style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>All Recipes</h1>

        {/* Link to Create New Recipe Page */}
        <Link
          to="/recipes/new"
          style={{
            padding: "10px 15px",
            backgroundColor: "#007bff",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "5px",
            fontWeight: "bold",
          }}
        >
          + Create New Recipe
        </Link>
      </div>

      {/* Filter Section */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search recipes by title..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            padding: "10px",
            width: "100%",
            maxWidth: "400px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* Recipe Grid */}
      {filteredRecipes.length === 0 ? (
        <p>No recipes found matching your search.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          {currentRecipes.map((recipe) => (
            <div
              key={recipe._id || recipe.id}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {recipe.image && (
                <img
                  src={
                    recipe.image.startsWith("http")
                      ? recipe.image
                      : `${BASE_URL}${recipe.image}`
                  }
                  alt={recipe.title}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    marginBottom: "10px",
                  }}
                />
              )}
              <h3 style={{ marginTop: "0" }}>
                {recipe.title || "Untitled Recipe"}
              </h3>
              <p style={{ flexGrow: 1 }}>
                {recipe.description || "No description provided."}
              </p>
              <Link
                to={`/recipes/${recipe._id || recipe.id}`}
                style={{
                  color: "#007bff",
                  textDecoration: "none",
                  marginTop: "10px",
                  display: "inline-block",
                }}
              >
                View Details &rarr;
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "30px",
            gap: "15px",
          }}
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: "8px 12px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 12px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default RecipePage
