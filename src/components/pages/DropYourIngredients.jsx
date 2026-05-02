import React, { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { get_all_ingredients } from "../../../API/ingredient.api"
import { RECIPE_URL } from "../../../constant/endpoints"
import api from "../../../API/api.api"
import toast from "react-hot-toast"

// Asset Imports
import bakeryImg from "../../assets/bakery.jpg"
import dairyImg from "../../assets/dairy.avif"
import fruitImg from "../../assets/fruit.jpg"
import grainImg from "../../assets/grain.jpg"
import herbImg from "../../assets/herb.webp"
import legumeImg from "../../assets/legume.jpg"
import meatImg from "../../assets/meat.webp"
import oilImg from "../../assets/oil.jpg"
import seafoodImg from "../../assets/seafood.jpg"
import spiceImg from "../../assets/spice.webp"
import sweetenerImg from "../../assets/sweetener.jpg"
import vegetableImg from "../../assets/vegetable.jpg"
import otherImg from "../../assets/other.jpg"
import fishImg from "../../assets/fish.jpg"

const CATEGORY_IMAGES = {
  bakery: bakeryImg,
  dairy: dairyImg,
  fruit: fruitImg,
  grain: grainImg,
  herb: herbImg,
  legume: legumeImg,
  meat: meatImg,
  oil: oilImg,
  seafood: seafoodImg,
  fish: fishImg,
  spice: spiceImg,
  sweetener: sweetenerImg,
  vegetable: vegetableImg,
  other: otherImg,
}

const DropYourIngredients = () => {
  const [ingredients, setIngredients] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [matchingRecipes, setMatchingRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  const filteredIngredients = useMemo(() => {
    if (!searchTerm) return ingredients
    const lowerSearch = searchTerm.toLowerCase()
    return ingredients.filter(
      (ing) =>
        ing.name.toLowerCase().includes(lowerSearch) ||
        ing.category.toLowerCase().includes(lowerSearch),
    )
  }, [ingredients, searchTerm])

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const data = await get_all_ingredients()
        setIngredients(data)
      } catch {
        toast.error("Failed to load ingredients")
      } finally {
        setLoading(false)
      }
    }
    fetchIngredients()
  }, [])

  const toggleIngredient = (id) => {
    if (matchingRecipes.length > 0) setMatchingRecipes([])
    setSelectedIngredients((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
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
      const response = await api.get(
        `${RECIPE_URL}/ingredients?ingredients=${ingredientIds}`,
      )
      setMatchingRecipes(response)
      if (response.length === 0) {
        toast.error("No recipes found with these exact ingredients.")
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    } catch {
      toast.error("Error searching for recipes")
    } finally {
      setSearching(false)
    }
  }

  if (loading)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-amber-400"></div>
        <p className="font-serif font-medium text-amber-100/70">
          Loading ingredients...
        </p>
      </div>
    )

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      <div className="mb-12 text-center">
        <p className="mb-3 inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs tracking-[0.32em] text-amber-200 uppercase">
          Pantry Magic
        </p>
        <h1 className="mb-4 font-serif text-5xl font-black tracking-tight text-white">
          Drop Your Ingredients
        </h1>
        <p className="text-lg text-white/60">
          Choose what's in your kitchen, and we'll suggest the best recipes!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
        {/* Selection Sidebar */}
        <div className="h-fit rounded-[1.75rem] border border-white/10 bg-[#0f141d] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.22)] lg:sticky lg:top-4 lg:col-span-1">
          <div className="mb-10 space-y-4">
            <h2 className="flex items-center gap-3 font-serif text-xl font-black text-white">
              Selection
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-xs text-amber-200">
                {selectedIngredients.length}
              </span>
            </h2>
            {selectedIngredients.length > 0 && (
              <button 
                onClick={clearSelection} 
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-black tracking-widest text-white/40 uppercase transition-all hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-400 active:scale-95"
              >
                <span className="text-xs">✕</span> Clear Selection
              </button>
            )}
          </div>

          <div className="custom-scrollbar mb-8 flex max-h-[300px] flex-wrap gap-2 overflow-y-auto pr-2">
            {selectedIngredients.length > 0 ? (
              selectedIngredients.map((id) => {
                const ing = ingredients.find((i) => i._id === id)
                return (
                  <span
                    key={id}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/70"
                  >
                    {ing?.name}
                    <button
                      onClick={() => toggleIngredient(id)}
                      className="text-white/30 hover:text-rose-400"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                )
              })
            ) : (
              <p className="py-4 text-xs text-white/30 italic">No selection.</p>
            )}
          </div>

          <button
            onClick={findRecipes}
            disabled={selectedIngredients.length < 2 || searching}
            className={`flex w-full items-center justify-center gap-2 rounded-full py-4 font-bold transition-all ${
              selectedIngredients.length < 2
                ? "cursor-not-allowed bg-white/5 text-white/20"
                : "border border-amber-400/20 bg-amber-400/15 text-amber-100 hover:bg-amber-400/25"
            }`}
          >
            {searching ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              "Find Recipes"
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {searching ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-full bg-[#0f141d]"
                />
              ))}
            </div>
          ) : matchingRecipes.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {matchingRecipes.map((recipe) => (
                <Link
                  to={`/recipe/${recipe._id}`}
                  key={recipe._id}
                  className="group relative flex overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0f141d] transition-all hover:-translate-y-1 hover:border-amber-400/20"
                >
                  {recipe.image && (
                    <div className="relative h-full w-28 shrink-0 overflow-hidden bg-[#0a0f16] sm:w-40">
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="line-clamp-1 font-serif text-xl font-black text-white group-hover:text-amber-200">
                      {recipe.title}
                    </h3>
                    <p className="line-clamp-2 text-xs text-white/60">
                      {recipe.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4 text-[10px] font-semibold text-white/40 uppercase">
                      <span>{recipe.difficulty}</span>
                      <span className="italic">via {recipe.source}</span>
                    </div>
                  </div>
                </Link>
              ))}
              <button
                onClick={() => setMatchingRecipes([])}
                className="col-span-full mt-4 text-center text-sm font-bold text-amber-200 transition-colors hover:text-white"
              >
                ← Back to selection
              </button>
            </div>
          ) : (
            <>
              <div className="group relative mb-12">
                <input
                  type="text"
                  placeholder="Filter ingredients..."
                  className="w-full rounded-full border border-white/10 bg-white/5 py-4 pr-6 pl-12 text-white transition-all outline-none focus:border-amber-400/30"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-white/20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4">
                {filteredIngredients.map((ing) => {
                  const isSelected = selectedIngredients.includes(ing._id)
                  return (
                    <button
                      key={ing._id}
                      onClick={() => toggleIngredient(ing._id)}
                      className="group flex flex-col items-center transition-all"
                    >
                      <div
                        className={`relative aspect-square w-full overflow-hidden rounded-full border-2 transition-all duration-500 ${
                          isSelected
                            ? "scale-105 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.3)]"
                            : "border-white/10 group-hover:border-white/30"
                        }`}
                      >
                        <img
                          src={CATEGORY_IMAGES[ing.category] || otherImg}
                          alt={ing.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        {/* Darker, high-contrast overlay */}
                        <div
                          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 group-hover:bg-black/70 ${isSelected ? "bg-black/40" : ""}`}
                        />

                        {/* Centered Typography Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                          {isSelected && (
                            <div className="animate-in zoom-in-50 mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-black shadow-lg duration-300">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}

                          <span
                            className={`font-serif text-lg leading-tight font-black tracking-tight text-white transition-all duration-300 ${isSelected ? "text-amber-200" : "group-hover:scale-105"}`}
                          >
                            {ing.name}
                          </span>

                          <span className="mt-1 text-[9px] font-black tracking-[0.25em] text-white/60 uppercase">
                            {ing.category}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DropYourIngredients
