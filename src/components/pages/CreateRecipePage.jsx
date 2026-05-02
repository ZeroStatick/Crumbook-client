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

  if (fetching) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-amber-400"></div>
    </div>
  )

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8 lg:px-8 pb-24">
      <div className="mb-10 overflow-hidden rounded-4xl border border-white/10 bg-[#0f141d] p-10 shadow-2xl">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="font-serif text-4xl font-black tracking-tight text-white">
            {isEditMode ? "Edit Masterpiece" : isForkMode ? "Remix Recipe" : "Create New Dish"}
          </h1>
          <Link
            to={isEditMode ? `/recipe/${id}` : "/recipes"}
            className="flex items-center gap-2 text-xs font-black tracking-widest text-white/40 uppercase transition-colors hover:text-white"
          >
            ✕ Cancel
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Section: Basic Identity */}
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="ml-1 text-xs font-black tracking-widest text-white/50 uppercase">
                Recipe Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white outline-none transition-all placeholder:text-white/20 focus:border-amber-400/30"
                placeholder="e.g., Rustic Truffle Pasta"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="ml-1 text-xs font-black tracking-widest text-white/50 uppercase">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white outline-none transition-all placeholder:text-white/20 focus:border-amber-400/30"
                placeholder="Share the story or flavor profile behind this dish..."
              />
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="space-y-3">
                <label className="ml-1 text-[10px] font-black tracking-widest text-white/40 uppercase">
                  Prep Time (min)
                </label>
                <input
                  min={1}
                  type="number"
                  name="prepTime"
                  value={formData.prepTime}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition-all focus:border-amber-400/30"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="ml-1 text-[10px] font-black tracking-widest text-white/40 uppercase">
                  Cook Time (min)
                </label>
                <input
                  min={1}
                  type="number"
                  name="cookTime"
                  value={formData.cookTime}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition-all focus:border-amber-400/30"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="ml-1 text-[10px] font-black tracking-widest text-white/40 uppercase">
                  Servings
                </label>
                <input
                  min={1}
                  type="number"
                  name="servings"
                  value={formData.servings}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition-all focus:border-amber-400/30"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <label className="ml-1 text-xs font-black tracking-widest text-white/50 uppercase">
                  Difficulty Level
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-white/10 bg-[#0a0f16] px-5 py-4 text-white outline-none transition-all focus:border-amber-400/30"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center pt-8">
                <label className="group flex cursor-pointer items-center gap-3">
                  <div className="relative flex h-6 w-6 items-center justify-center rounded-lg border-2 border-white/10 bg-white/5 transition-all group-hover:border-amber-400/30">
                    <input
                      type="checkbox"
                      name="public"
                      checked={formData.public}
                      onChange={handleInputChange}
                      className="peer absolute opacity-0"
                    />
                    <div className="h-3 w-3 scale-0 rounded-sm bg-amber-400 transition-transform peer-checked:scale-100" />
                  </div>
                  <span className="text-sm font-bold tracking-wide text-white/60 transition-colors group-hover:text-white">
                    Make this recipe public
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <label className="ml-1 text-xs font-black tracking-widest text-white/50 uppercase">
                Recipe Image
              </label>
              <div className="group relative flex min-h-[200px] flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-white/10 bg-white/5 p-6 transition-all hover:border-amber-400/20 hover:bg-white/10">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                {!imageFile && !formData.image ? (
                  <div className="text-center">
                    <div className="mb-3 text-4xl opacity-20">🖼️</div>
                    <p className="text-sm font-bold text-white/40">Drop an image here or click to upload</p>
                  </div>
                ) : (
                  <div className="w-full">
                    <img
                      src={imageFile ? URL.createObjectURL(imageFile) : formData.image}
                      alt="Preview"
                      className="mx-auto h-48 w-full rounded-2xl object-cover shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                    <p className="mt-4 text-center text-[10px] font-black tracking-widest text-amber-200 uppercase">Change Photo</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="ml-1 text-xs font-black tracking-widest text-white/50 uppercase">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white outline-none transition-all placeholder:text-white/20 focus:border-amber-400/30"
                placeholder="Italian, Dinner, Quick (comma separated)"
              />
            </div>
          </div>

          {/* Section: Ingredients */}
          <div className="border-t border-white/5 pt-12">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-serif text-3xl font-black text-white">Ingredients</h2>
              <button
                type="button"
                onClick={addIngredient}
                className="rounded-full border border-amber-400/20 bg-amber-400/10 px-6 py-2 text-[10px] font-black tracking-widest text-amber-200 uppercase transition-all hover:bg-amber-400/20"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-4">
              {recipeIngredients.map((ing, index) => (
                <div key={index} className="flex flex-col gap-3 rounded-[1.25rem] border border-white/5 bg-[#0a0f16] p-4 animate-in fade-in slide-in-from-left-2 md:flex-row md:items-center">
                  <select
                    value={ing.item}
                    onChange={(e) =>
                      handleIngredientChange(index, "item", e.target.value)
                    }
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/30"
                    required
                  >
                    <option value="" className="bg-[#0f141d]">Select Ingredient</option>
                    {ingredientsList.map((i) => (
                      <option key={i._id} value={i._id} className="bg-[#0f141d]">
                        {i.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={ing.quantity}
                      onChange={(e) =>
                        handleIngredientChange(index, "quantity", e.target.value)
                      }
                      placeholder="Qty"
                      className="w-24 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/30"
                      required
                    />
                    <select
                      value={ing.unit}
                      onChange={(e) =>
                        handleIngredientChange(index, "unit", e.target.value)
                      }
                      className="w-28 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/30"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u} className="bg-[#0f141d]">
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  {recipeIngredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 transition-all hover:bg-rose-500/10"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section: Instructions */}
          <div className="border-t border-white/5 pt-12">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-serif text-3xl font-black text-white">Instructions</h2>
              <button
                type="button"
                onClick={addInstruction}
                className="rounded-full border border-amber-400/20 bg-amber-400/10 px-6 py-2 text-[10px] font-black tracking-widest text-amber-200 uppercase transition-all hover:bg-amber-400/20"
              >
                + Add Step
              </button>
            </div>

            <div className="space-y-6">
              {instructions.map((inst, index) => (
                <div key={index} className="flex gap-4 group animate-in fade-in slide-in-from-left-2 items-start">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 font-serif text-lg font-black text-white/40 transition-all group-focus-within:border-amber-400/30 group-focus-within:bg-amber-400/10 group-focus-within:text-amber-200">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={inst}
                      onChange={(e) =>
                        handleInstructionChange(index, e.target.value)
                      }
                      rows="2"
                      placeholder={`Step ${index + 1} instructions...`}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white outline-none transition-all placeholder:text-white/20 focus:border-amber-400/30"
                      required
                    />
                  </div>
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="mt-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/20 transition-all hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center overflow-hidden rounded-full border border-amber-400/20 bg-amber-400/15 py-5 text-lg font-black tracking-[0.2em] text-amber-100 uppercase shadow-2xl transition-all hover:bg-amber-400/25 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-100/30 border-t-amber-100" />
                  <span>Preserving...</span>
                </div>
              ) : (
                <span>{isEditMode ? "Update Masterpiece" : isForkMode ? "Publish Remix" : "Create Masterpiece"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateRecipePage
