import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { BASE_URL, RECIPE_URL } from "../../../constant/endpoints"

const RecipeDetailPage = () => {
  const { id } = useParams()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`${BASE_URL}${RECIPE_URL}/${id}`)
        setRecipe(response.data)
      } catch (err) {
        setError(err.response?.data?.message || err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [id])

  if (loading)
    return <div style={{ padding: "20px" }}>Loading recipe details...</div>
  if (error)
    return (
      <div style={{ padding: "20px", color: "red" }}>
        Error loading recipe: {error}
      </div>
    )
  if (!recipe) return <div style={{ padding: "20px" }}>Recipe not found.</div>

  return (
    <div
      className="recipe-detail-page"
      style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}
    >
      <Link
        to="/recipes"
        style={{
          textDecoration: "none",
          color: "#007bff",
          marginBottom: "20px",
          display: "inline-block",
        }}
      >
        &larr; Back to Recipes
      </Link>

      <div
        style={{
          border: "1px solid #ddd",
          padding: "30px",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h1 style={{ marginTop: "0", marginBottom: "20px" }}>
          {recipe.title || "Untitled Recipe"}
        </h1>

        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "4px",
            border: "1px solid #eee",
          }}
        >
          <h3
            style={{
              marginTop: "0",
              borderBottom: "2px solid #007bff",
              paddingBottom: "10px",
              display: "inline-block",
            }}
          >
            Description
          </h3>
          <p
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: "1.6",
              marginTop: "10px",
            }}
          >
            {recipe.description || "No description provided."}
          </p>
        </div>
      </div>
    </div>
  )
}

export default RecipeDetailPage
