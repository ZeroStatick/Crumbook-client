import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import { BASE_URL, RECIPE_URL } from "../../../constant/endpoints"
import toast from "react-hot-toast"

const CreateRecipePage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await axios.post(`${BASE_URL}${RECIPE_URL}`, formData, {
        headers: {
          "Content-Type": "application/json",
          // Note: If your endpoint requires a token, you'd add the Authorization header here
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      })

      toast.success("Recipe created successfully!")
      // Redirect back to the recipe list upon success
      navigate("/recipes")
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="create-recipe-page"
      style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>Create New Recipe</h1>
        <Link
          to="/recipes"
          style={{ textDecoration: "none", color: "#007bff" }}
        >
          &larr; Back to Recipes
        </Link>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "15px" }}>Error: {error}</div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <div>
          <label
            htmlFor="title"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Recipe Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            placeholder="E.g., Grandma's Chocolate Chip Cookies"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="5"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            placeholder="A brief description of the recipe..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 15px",
            backgroundColor: loading ? "#ccc" : "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: "10px",
          }}
        >
          {loading ? "Creating..." : "Create Recipe"}
        </button>
      </form>
    </div>
  )
}

export default CreateRecipePage
