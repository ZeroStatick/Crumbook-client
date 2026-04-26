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
      } catch (error) {
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

      const submissionData = {
        ...formData,
        ingredients: recipeIngredients.map((ing) => ({
          ...ing,
          quantity: Number(ing.quantity),
        })),
        instructions: instructions.filter((i) => i.trim() !== ""),
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t !== ""),
        prepTime: Number(formData.prepTime),
        cookTime: Number(formData.cookTime),
        servings: Number(formData.servings),
      }

      if (isEditMode) {
        await update_recipe(id, submissionData)
        toast.success("Recipe updated successfully!")
      } else {
        await create_recipe(submissionData)
        toast.success("Recipe created successfully!")
      }
      
      navigate(isEditMode ? `/recipe/${id}` : "/recipes")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="p-12 text-center text-gray-500">Loading recipe data...</div>

  return (
    <div className="mx-auto mt-8 max-w-2xl rounded-lg border border-gray-100 bg-white p-6 shadow">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? "Edit Recipe" : "New Recipe"}</h1>
        <Link
          to={isEditMode ? `/recipe/${id}` : "/recipes"}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          &larr; Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 w-full rounded border border-gray-300 p-2 outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Pizza Margharita"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="2"
              className="mt-1 w-full rounded border border-gray-300 p-2 outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Short summary..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700">
                Prep (min)
              </label>
              <input
                min={1}
                type="number"
                name="prepTime"
                value={formData.prepTime}
                onChange={handleInputChange}
                className="mt-1 w-full rounded border border-gray-300 p-2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">
                Cook (min)
              </label>
              <input
                min={1}
                type="number"
                name="cookTime"
                value={formData.cookTime}
                onChange={handleInputChange}
                className="mt-1 w-full rounded border border-gray-300 p-2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">
                Servings
              </label>
              <input
                min={1}
                type="number"
                name="servings"
                value={formData.servings}
                onChange={handleInputChange}
                className="mt-1 w-full rounded border border-gray-300 p-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="mt-1 w-full rounded border border-gray-300 p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
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
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-semibold text-gray-700">
                  Public Recipe
                </span>
              </label>
            </div>
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
              className="mt-1 w-full rounded border border-gray-300 p-2 outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Italian, Dinner, Quick"
            />
          </div>
        </div>

        {/* Ingredients */}
        <div className="border-t pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-700">Ingredients</h2>
            <button
              type="button"
              onClick={addIngredient}
              className="rounded bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100"
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
                  className="flex-1 rounded border border-gray-300 p-2 text-sm"
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
                  className="w-16 rounded border border-gray-300 p-2 text-sm"
                  required
                />
                <select
                  value={ing.unit}
                  onChange={(e) =>
                    handleIngredientChange(index, "unit", e.target.value)
                  }
                  className="w-20 rounded border border-gray-300 p-2 text-sm"
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
        <div className="border-t pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-700">Steps</h2>
            <button
              type="button"
              onClick={addInstruction}
              className="rounded bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100"
            >
              + ADD
            </button>
          </div>

          <div className="space-y-3">
            {instructions.map((inst, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="mt-2 text-sm font-bold text-gray-400">
                  {index + 1}.
                </span>
                <textarea
                  value={inst}
                  onChange={(e) =>
                    handleInstructionChange(index, e.target.value)
                  }
                  rows="1"
                  placeholder="Instructions..."
                  className="flex-1 rounded border border-gray-300 p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
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
          className="w-full rounded bg-blue-600 py-3 font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Saving..." : isEditMode ? "Update Recipe" : isForkMode ? "Publish Your Version" : "Create Recipe"}
        </button>
      </form>
    </div>
  )
}

export default CreateRecipePage
