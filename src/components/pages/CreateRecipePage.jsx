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
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const data = new FormData()
    data.append("title", formData.title)
    data.append("description", formData.description)
    if (image) {
      data.append("image", image)
    }

    try {
      await axios.post(RECIPE_URL, data, {
        headers: {
          "Content-Type": "multipart/form-data",
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

        <div>
          <label
            htmlFor="image"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Recipe Image
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          {imagePreview && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: "300px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            </div>
          )}
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
