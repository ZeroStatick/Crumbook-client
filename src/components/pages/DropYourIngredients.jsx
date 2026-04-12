import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { get_all_ingredients } from "../../../API/ingredient.api"
import { RECIPE_URL } from "../../../constant/endpoints"
import api from "../../../API/api.api"
import toast from "react-hot-toast"

const DropYourIngredients = () => {
  const [ingredients, setIngredients] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [matchingRecipes, setMatchingRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const data = await get_all_ingredients()
        setIngredients(data)
      } catch (error) {
        toast.error("Failed to load ingredients")
      } finally {
        setLoading(false)
      }
    }
    fetchIngredients()
  }, [])

  const toggleIngredient = (id) => {
    setSelectedIngredients(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const findRecipes = async () => {
    if (selectedIngredients.length < 2) {
      toast.error("Please select at least 2 ingredients")
      return
    }

    setSearching(true)
    try {
      // We use the query parameter format expected by getRecipeByIngredients: ?ingredients=id1,id2
      const ingredientIds = selectedIngredients.join(",")
      const response = await api.get(`${RECIPE_URL}/ingredients?ingredients=${ingredientIds}`)
      setMatchingRecipes(response)
      
      if (response.length === 0) {
        toast.error("No recipes found with these exact ingredients.")
      }
    } catch (error) {
      toast.error("Error searching for recipes")
    } finally {
      setSearching(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading ingredients...</div>

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Drop Your Ingredients</h1>
        <p className="text-gray-600">Select the ingredients you have in your fridge, and we'll find recipes for you!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Ingredient Selection Panel */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex justify-between items-center">
            Your Selection
            <span className="bg-blue-100 text-blue-600 text-xs py-1 px-2 rounded-full">
              {selectedIngredients.length}
            </span>
          </h2>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedIngredients.map(id => {
              const ing = ingredients.find(i => i._id === id)
              return (
                <span key={id} className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                  {ing?.name}
                  <button onClick={() => toggleIngredient(id)} className="hover:text-red-500">&times;</button>
                </span>
              )
            })}
          </div>

          <button
            onClick={findRecipes}
            disabled={selectedIngredients.length < 2 || searching}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
              selectedIngredients.length < 2 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
            }`}
          >
            {searching ? "Searching..." : "Find Recipes"}
          </button>
          <p className="text-[10px] text-gray-400 mt-2 text-center">Select at least 2 ingredients to search</p>
        </div>

        {/* Ingredients Grid */}
        <div className="lg:col-span-3">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search ingredients..."
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-12">
            {ingredients
              .filter((ing) =>
                ing.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((ing) => (
                <button
                  key={ing._id}
                  onClick={() => toggleIngredient(ing._id)}
                  className={`group p-4 text-center transition-all rounded-xl border-2 ${
                    selectedIngredients.includes(ing._id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-100 bg-white hover:border-blue-200"
                  }`}
                >
                  <div className="text-sm font-bold capitalize text-gray-800">
                    {ing.name}
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-tighter text-gray-400">
                    {ing.category}
                  </div>
                </button>
              ))}
          </div>

          {/* Results Section */}
          {matchingRecipes.length > 0 && (
            <div className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Suggested Recipes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matchingRecipes.map(recipe => (
                  <Link 
                    to={`/recipes/${recipe._id}`} 
                    key={recipe._id}
                    className="flex bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    {recipe.image && (
                      <div className="w-24 sm:w-32 h-full overflow-hidden">
                        <img 
                          src={recipe.image} 
                          alt={recipe.title} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-4 flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 line-clamp-1">{recipe.title}</h3>
                        {recipe.isExternal && (
                          <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">
                            External
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{recipe.description}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex gap-3 text-[10px] font-bold text-gray-400">
                          {recipe.prepTime + recipe.cookTime > 0 && (
                            <span>{recipe.prepTime + recipe.cookTime} MINS</span>
                          )}
                          <span className="uppercase">{recipe.difficulty}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">Source: <span className="text-blue-500">{recipe.source}</span></span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DropYourIngredients
