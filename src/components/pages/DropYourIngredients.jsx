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
    // Clear matching recipes when selection changes to avoid stale results
    if (matchingRecipes.length > 0) setMatchingRecipes([])
    
    setSelectedIngredients(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const clearSelection = () => {
    setSelectedIngredients([])
    setMatchingRecipes([])
  }

  const findRecipes = async () => {
    if (selectedIngredients.length < 2) {
      toast.error("Please select at least 2 ingredients")
      return
    }

    setSearching(true)
    try {
      const ingredientIds = selectedIngredients.join(",")
      const response = await api.get(`${RECIPE_URL}/ingredients?ingredients=${ingredientIds}`)
      setMatchingRecipes(response)
      
      if (response.length === 0) {
        toast.error("No recipes found with these exact ingredients.")
      } else {
        // Scroll to top to show results
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (error) {
      toast.error("Error searching for recipes")
    } finally {
      setSearching(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-medium">Loading ingredients...</p>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Drop Your Ingredients</h1>
        <p className="text-gray-600">Choose what's in your kitchen, and we'll suggest the best recipes!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Ingredient Selection Panel */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit lg:sticky lg:top-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 whitespace-nowrap">
              Your Selection
              <span className="bg-blue-100 text-blue-600 text-xs py-0.5 px-2 rounded-full">
                {selectedIngredients.length}
              </span>
            </h2>
            {selectedIngredients.length > 0 && (
              <button 
                onClick={clearSelection}
                className="text-[9px] font-bold text-red-500 hover:text-red-700 uppercase tracking-tighter shrink-0 leading-[1] text-right ml-2"
              >
                Clear<br/>All
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {selectedIngredients.length > 0 ? (
              selectedIngredients.map(id => {
                const ing = ingredients.find(i => i._id === id)
                return (
                  <span key={id} className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 group border border-blue-100">
                    {ing?.name}
                    <button 
                      onClick={() => toggleIngredient(id)} 
                      className="text-blue-300 hover:text-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                )
              })
            ) : (
              <p className="text-xs text-gray-400 italic py-2">No ingredients selected yet.</p>
            )}
          </div>

          <button
            onClick={findRecipes}
            disabled={selectedIngredients.length < 2 || searching}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
              selectedIngredients.length < 2 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : searching 
                  ? 'bg-blue-400 cursor-wait' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-[0.98]'
            }`}
          >
            {searching ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Searching...
              </>
            ) : (
              "Find Recipes"
            )}
          </button>
          <p className="text-[10px] text-gray-400 mt-3 text-center">
            {selectedIngredients.length < 2 
              ? "Select at least 2 ingredients to search" 
              : "Ready to find matching recipes!"}
          </p>
        </div>

        {/* Ingredients Selection or Results Grid */}
        <div className="lg:col-span-3">
          {searching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              {[1, 2, 4, 5].map(i => (
                <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>
              ))}
            </div>
          ) : matchingRecipes.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  Suggested Recipes
                  <span className="text-sm font-normal text-gray-400">({matchingRecipes.length} found)</span>
                </h2>
                <button 
                  onClick={() => setMatchingRecipes([])}
                  className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-widest flex items-center gap-1 transition-colors group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Edit Selection
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matchingRecipes.map(recipe => (
                  <Link 
                    to={`/recipe/${recipe._id}`} 
                    key={recipe._id}
                    className="flex bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-blue-100 group"
                  >
                    {recipe.image && (
                      <div className="w-24 sm:w-32 h-full overflow-hidden">
                        <img 
                          src={recipe.image} 
                          alt={recipe.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{recipe.title}</h3>
                        {recipe.isExternal && (
                          <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-bold border border-orange-100 shrink-0">
                            EXTERNAL
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{recipe.description}</p>
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                        <div className="flex gap-3 text-[10px] font-bold text-gray-400">
                          {recipe.prepTime + recipe.cookTime > 0 && (
                            <span className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {recipe.prepTime + recipe.cookTime} MIN
                            </span>
                          )}
                          <span className="uppercase tracking-wider">{recipe.difficulty}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 italic">via {recipe.source}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Filter ingredients..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-12">
                {ingredients
                  .filter((ing) =>
                    ing.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((ing) => (
                    <button
                      key={ing._id}
                      onClick={() => toggleIngredient(ing._id)}
                      className={`group p-4 text-center transition-all rounded-xl border-2 flex flex-col items-center justify-center gap-1 ${
                        selectedIngredients.includes(ing._id)
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-gray-50 bg-white hover:border-blue-200 hover:shadow-sm"
                      }`}
                    >
                      <div className={`text-sm font-bold capitalize transition-colors ${
                        selectedIngredients.includes(ing._id) ? "text-blue-700" : "text-gray-700"
                      }`}>
                        {ing.name}
                      </div>
                      <div className="text-[9px] uppercase tracking-tighter text-gray-400 font-medium">
                        {ing.category}
                      </div>
                    </button>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DropYourIngredients
