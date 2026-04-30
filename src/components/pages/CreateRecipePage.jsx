import React, { useState, useEffect } from "react"
import { useNavigate, Link, useParams } from "react-router-dom"
import { create_recipe, get_recipe_by_id, update_recipe } from "../../../API/recipe.api"
import { get_all_ingredients } from "../../../API/ingredient.api"
import toast from "react-hot-toast"

const UNITS = [
  "g",
  "kg",
  "ml",
  "cl",
  "l",
  "tsp",
  "tbsp",
  "cup",
  "piece",
  "pinch",
  "slice",
  "clove",
  "sprig",
  "handful",
  "to taste",
]

const DIFFICULTIES = ["Easy", "Medium", "Hard"]

const CreateRecipePage = () => {
  const { id } = useParams()
  // Determine if we are editing an existing recipe
  const isEditMode = Boolean(id) && !window.location.pathname.includes('/fork/')
  // Determine if we are creating a new version based on an existing recipe
  const isForkMode = Boolean(id) && window.location.pathname.includes('/fork/')
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditMode || isForkMode)
  const [ingredientsList, setIngredientsList] = useState([])
  // Store a snapshot of the initial forked data to verify if changes were made
  const [originalDataStr, setOriginalDataStr] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prepTime: "",
    cookTime: "",
    servings: "",
    difficulty: "Medium",
    source: "Original",
    public: true,
    image: "",
    tags: "",
  })

  const [recipeIngredients, setRecipeIngredients] = useState([
    { item: "", quantity: "", unit: "g" },
  ])
  const [instructions, setInstructions] = useState([""])
  const [imageFile, setImageFile] = useState(null) // Added for photo upload

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ingredientsData = await get_all_ingredients()
        setIngredientsList(ingredientsData)

        if (isEditMode || isForkMode) {
          const recipe = await get_recipe_by_id(id)
          
          const newFormData = {
            title: recipe.title || "",
            description: recipe.description || "",
            prepTime: recipe.prepTime || "",
            cookTime: recipe.cookTime || "",
            servings: recipe.servings || "",
            difficulty: recipe.difficulty || "Medium",
            // If forking, label the source as "Forked", otherwise keep original
            source: isForkMode ? "Forked" : (recipe.source || "Original"),
            public: recipe.public !== undefined ? recipe.public : true,
            image: recipe.image || "",
            tags: recipe.tags ? recipe.tags.join(", ") : "",
          }
          
          // If forking, track the lineage (original recipe and author) so the backend can link them
          if (isForkMode) {
            newFormData.original_recipe = recipe.original_recipe || recipe._id
            newFormData.original_author = recipe.original_author?._id || recipe.original_author || recipe.author?._id || recipe.author
          }
          
          setFormData(newFormData)

          let initialIngredients = [{ item: "", quantity: "", unit: "g" }]
          if (recipe.ingredients && recipe.ingredients.length > 0) {
            initialIngredients = recipe.ingredients.map(ing => ({
              item: ing.item?._id || ing.item,
              quantity: ing.quantity,
              unit: ing.unit
            }))
            setRecipeIngredients(initialIngredients)
          }

          let initialInstructions = [""]
          if (recipe.instructions && recipe.instructions.length > 0) {
            initialInstructions = recipe.instructions
            setInstructions(initialInstructions)
          }

          if (isForkMode) {
            setOriginalDataStr(JSON.stringify({
              formData: newFormData,
              ingredients: initialIngredients,
              instructions: initialInstructions
            }))
          }
        }
      } catch {
        toast.error(isEditMode || isForkMode ? "Failed to load recipe" : "Failed to load ingredients")
        if (isEditMode || isForkMode) navigate("/profile")
      } finally {
        setFetching(false)
      }
    }
    fetchData()
  }, [id, isEditMode, isForkMode, navigate])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // Ingredients Handlers
  const addIngredient = () => {
    setRecipeIngredients([
      ...recipeIngredients,
      { item: "", quantity: "", unit: "g" },
    ])
  }

  const removeIngredient = (index) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index))
  }

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...recipeIngredients]
    newIngredients[index][field] = value
    setRecipeIngredients(newIngredients)
  }

  // Instructions Handlers
  const addInstruction = () => {
    setInstructions([...instructions, ""])
  }

  const removeInstruction = (index) => {
    setInstructions(instructions.filter((_, i) => i !== index))
  }

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...instructions]
    newInstructions[index] = value
    setInstructions(newInstructions)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate ingredients
      if (
        recipeIngredients.some((ing) => !ing.item || !ing.quantity || !ing.unit)
      ) {
        throw new Error("Please fill in all ingredient details")
      }

      // Validate instructions
      if (instructions.some((inst) => !inst.trim())) {
        throw new Error("Please fill in all instruction steps")
      }

      // If in fork mode, ensure the user has actually modified the recipe
      if (isForkMode) {
        const currentDataStr = JSON.stringify({
          formData,
          ingredients: recipeIngredients,
          instructions
        })
        if (currentDataStr === originalDataStr) {
          throw new Error("You must make changes to the recipe before publishing your own version.")
        }
      }

      const formDataToSend = new FormData()
      
      // Append basic fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          formDataToSend.append(key, formData[key])
        }
      })

      // Handle the image file separately
      if (imageFile) {
        formDataToSend.append("image", imageFile)
      }

      // Append complex fields as JSON strings
      formDataToSend.set("ingredients", JSON.stringify(recipeIngredients.map((ing) => ({
        ...ing,
        quantity: Number(ing.quantity),
      }))))
      
      formDataToSend.set("instructions", JSON.stringify(instructions.filter((i) => i.trim() !== "")))
      
      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== "")
      formDataToSend.set("tags", JSON.stringify(tagsArray))

      // Ensure numbers are numbers
      formDataToSend.set("prepTime", Number(formData.prepTime))
      formDataToSend.set("cookTime", Number(formData.cookTime))
      formDataToSend.set("servings", Number(formData.servings))

      if (isEditMode) {
        await update_recipe(id, formDataToSend)
        toast.success("Recipe updated successfully!")
      } else {
        await create_recipe(formDataToSend)
        toast.success("Recipe created successfully!")
      }
      
      navigate(isEditMode ? `/recipe/${id}` : "/recipes")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="p-12 text-center text-cb-text-soft">Loading recipe data...</div>

  return (
    <div className="bg-[#10141e]/95 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] mx-auto mt-8 max-w-2xl rounded-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cb-text">{isEditMode ? "Edit Recipe" : "New Recipe"}</h1>
        <Link
          to={isEditMode ? `/recipe/${id}` : "/recipes"}
          className="text-sm font-medium text-cb-primary hover:underline"
        >
          &larr; Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-cb-text-soft">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="rounded-2xl border border-white/15 bg-white/10 text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all mt-1 w-full p-2.5"
              placeholder="e.g., Pizza Margharita"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-cb-text-soft">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="2"
              className="rounded-2xl border border-white/15 bg-white/10 text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all mt-1 w-full p-2.5"
              placeholder="Short summary..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-cb-text-soft">
                Prep (min)
              </label>
              <input
                min={1}
                type="number"
                name="prepTime"
                value={formData.prepTime}
                onChange={handleInputChange}
                className="rounded-2xl border border-white/15 bg-white/10 text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all mt-1 w-full p-2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-cb-text-soft">
                Cook (min)
              </label>
              <input
                min={1}
                type="number"
                name="cookTime"
                value={formData.cookTime}
                onChange={handleInputChange}
                className="rounded-2xl border border-white/15 bg-white/10 text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all mt-1 w-full p-2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-cb-text-soft">
                Servings
              </label>
              <input
                min={1}
                type="number"
                name="servings"
                value={formData.servings}
                onChange={handleInputChange}
                className="rounded-2xl border border-white/15 bg-white/10 text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all mt-1 w-full p-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-cb-text-soft">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="rounded-2xl border border-white/15 bg-white/10 text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all mt-1 w-full p-2 text-sm"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex h-full items-center pt-6">
              <label className="flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  name="public"
                  checked={formData.public}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-cb-border text-cb-primary focus:ring-cb-primary"
                />
                <span className="ml-2 text-sm font-semibold text-cb-text-soft">
                  Public Recipe
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Recipe Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
            {(imageFile || formData.image) && (
              <div className="mt-2">
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : formData.image}
                  alt="Preview"
                  className="h-32 w-full rounded object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="rounded-2xl border border-white/15 bg-white/10 text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all mt-1 w-full p-2.5"
              placeholder="e.g., Italian, Dinner, Quick"
            />
          </div>
        </div>

        {/* Ingredients */}
        <div className="border-t border-cb-border pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-cb-text">Ingredients</h2>
            <button
              type="button"
              onClick={addIngredient}
              className="rounded bg-amber-100 px-2 py-1 text-xs font-bold text-cb-primary hover:bg-amber-200"
            >
              + ADD
            </button>
          </div>

          <div className="space-y-3">
            {recipeIngredients.map((ing, index) => (
              <div key={index} className="flex gap-2">
                <select
                  value={ing.item}
                  onChange={(e) =>
                    handleIngredientChange(index, "item", e.target.value)
                  }
                  className="rounded-2xl border border-white/15 bg-white/10 text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all flex-1 p-2 text-sm"
                  required
                >
                  <option value="">Ingredient</option>
                  {ingredientsList.map((i) => (
                    <option key={i._id} value={i._id}>
                      {i.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={ing.quantity}
                  onChange={(e) =>
                    handleIngredientChange(index, "quantity", e.target.value)
                  }
                  placeholder="Qty"
                  className="rounded-2xl border border-white/15 bg-white/10 text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all w-16 p-2 text-sm"
                  required
                />
                <select
                  value={ing.unit}
                  onChange={(e) =>
                    handleIngredientChange(index, "unit", e.target.value)
                  }
                  className="rounded-2xl border border-white/15 bg-white/10 text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all w-20 p-2 text-sm"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="px-1 font-bold text-red-500"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="border-t border-cb-border pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-cb-text">Steps</h2>
            <button
              type="button"
              onClick={addInstruction}
              className="rounded bg-amber-100 px-2 py-1 text-xs font-bold text-cb-primary hover:bg-amber-200"
            >
              + ADD
            </button>
          </div>

          <div className="space-y-3">
            {instructions.map((inst, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="mt-2 text-sm font-bold text-cb-text-soft/75">
                  {index + 1}.
                </span>
                <textarea
                  value={inst}
                  onChange={(e) =>
                    handleInstructionChange(index, e.target.value)
                  }
                  rows="1"
                  placeholder="Instructions..."
                  className="rounded-2xl border border-white/15 bg-white/10 text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all flex-1 p-2 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="mt-1 px-1 font-bold text-red-500"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl font-bold text-white bg-gradient-to-br from-[#b45309] to-[#d88b1c] shadow-[0_12px_30px_rgba(216,139,28,0.26)] hover:brightness-105 active:scale-95 transition-all w-full py-3 disabled:bg-amber-200"
        >
          {loading ? "Saving..." : isEditMode ? "Update Recipe" : isForkMode ? "Publish Your Version" : "Create Recipe"}
        </button>
      </form>
    </div>
  )
}

export default CreateRecipePage
