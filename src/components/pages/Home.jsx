import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { get_all_recipes } from "../../../API/recipe.api"
import { get_all_guides } from "../../../API/guide.api"
import { DEFAULT_RECIPE_IMAGE } from "../../../constant/images"

const Home = () => {
  const [data, setData] = useState({
    recipeOfTheMonth: null,
    latestRecipes: [],
    latestGuides: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipes, guides] = await Promise.all([
          get_all_recipes(),
          get_all_guides()
        ])

        let recipeOfTheMonth = null
        let latestRecipes = []
        let latestGuides = []

        if (Array.isArray(recipes)) {
          // Find Recipe of the Month (Highest rated)
          const sortedByRating = [...recipes].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
          recipeOfTheMonth = sortedByRating[0]

          // Find Latest Recipes (Top 4, excluding ROTM)
          const sortedByDate = [...recipes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          if (recipeOfTheMonth) {
            latestRecipes = sortedByDate.filter(r => r._id !== recipeOfTheMonth._id).slice(0, 4)
          } else {
            latestRecipes = sortedByDate.slice(0, 4)
          }
        }

        if (Array.isArray(guides)) {
          latestGuides = [...guides].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3)
        }

        setData({ recipeOfTheMonth, latestRecipes, latestGuides })
      } catch (err) {
        console.error("Failed to fetch homepage data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0c10]">
        <div className="animate-pulse font-serif text-2xl tracking-widest text-white/40 uppercase">Crumbook</div>
      </div>
    )
  }

  const { recipeOfTheMonth, latestRecipes, latestGuides } = data

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white selection:bg-white selection:text-black">
      {/* Featured Recipe - Hero Section */}
      {recipeOfTheMonth && (
        <section className="pt-32 pb-24 px-4 max-w-6xl mx-auto flex flex-col items-center">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/40 mb-6 block">
              Featured Selection
            </span>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-normal tracking-tight text-white mb-8">
              {recipeOfTheMonth.title}
            </h1>
            <div className="w-16 h-px bg-white/20 mx-auto mb-8"></div>
            <p className="max-w-2xl mx-auto text-lg text-white/50 font-light leading-relaxed">
              {recipeOfTheMonth.description || "Experience our most celebrated recipe of the season, a masterclass in balance and technique."}
            </p>
          </div>

          <div className="w-full relative group">
            <div className="aspect-[21/9] w-full overflow-hidden border border-white/10 bg-zinc-900">
              <img
                src={recipeOfTheMonth.image || DEFAULT_RECIPE_IMAGE}
                alt={recipeOfTheMonth.title}
                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
          </div>

          <div className="mt-16">
            <Link
              to={`/recipe/${recipeOfTheMonth._id}`}
              className="px-10 py-4 border border-white/20 hover:border-white hover:bg-white hover:text-black transition-all duration-500 text-[11px] font-bold uppercase tracking-[0.3em]"
            >
              Discover Recipe
            </Link>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Simple Hairline Divider */}
        <div className="w-full h-px bg-white/10"></div>

        {/* Recent Recipes */}
        <section className="py-24">
          <div className="mb-20 flex flex-col items-center md:flex-row md:justify-between md:items-end">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-3 block">Latest Additions</span>
              <h2 className="font-serif text-4xl md:text-5xl font-normal tracking-tight">Recent Recipes</h2>
            </div>
            <Link to="/recipes" className="mt-6 md:mt-0 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors border-b border-transparent hover:border-white/40 pb-1">
              View All Recipes
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {latestRecipes.map((recipe) => (
              <Link 
                key={recipe._id} 
                to={`/recipe/${recipe._id}`} 
                className="group flex flex-col"
              >
                <div className="relative mb-8 overflow-hidden border border-white/5 bg-zinc-900 aspect-square">
                  <img
                    src={recipe.image || DEFAULT_RECIPE_IMAGE}
                    alt={recipe.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="mb-3 font-serif text-2xl font-normal leading-snug group-hover:text-white/70 transition-colors">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center justify-center md:justify-start gap-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
                    <span>{recipe.difficulty || "Moderate"}</span>
                    <span className="w-1 h-px bg-white/20"></span>
                    <span>{(recipe.prepTime || 0) + (recipe.cookTime || 0)} Minutes</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Secondary Hairline Divider */}
        <div className="w-full h-px bg-white/10"></div>

        {/* Cooking Guides */}
        <section className="py-24">
          <div className="mb-20 flex flex-col items-center">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-3 block">The Fundamentals</span>
            <h2 className="font-serif text-4xl md:text-5xl font-normal tracking-tight">Cooking Guides</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {latestGuides.map((guide) => (
              <Link key={guide._id} to={`/guide/${guide._id}`} className="group flex flex-col items-center text-center">
                <div className="w-full relative mb-10 overflow-hidden border border-white/5 aspect-[4/3] bg-zinc-900">
                  <img
                    src={guide.thumbnailUrl || guide.image || DEFAULT_RECIPE_IMAGE}
                    alt={guide.title}
                    className="h-full w-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="mb-4 font-serif text-3xl font-normal group-hover:text-white/70 transition-colors">
                  {guide.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/40 font-light max-w-xs mb-6">
                  {guide.description || "Foundational culinary knowledge and technical expertise for the refined kitchen."}
                </p>
                <div className="w-8 h-px bg-white/20 group-hover:w-16 transition-all duration-500"></div>
              </Link>
            ))}
          </div>
        </section>

        {/* Find a Meal (Pantry Drop) */}
        <section className="py-24 border-t border-white/10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="aspect-[4/5] bg-zinc-900 overflow-hidden border border-white/5">
                <img 
                  src="https://images.unsplash.com/photo-1505935428862-770b6f24f629?auto=format&fit=crop&q=80&w=2000" 
                  alt="Ingredients" 
                  className="h-full w-full object-cover grayscale opacity-40 hover:grayscale-0 hover:opacity-60 transition-all duration-1000"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-6 block">Culinary Logic</span>
              <h2 className="mb-10 font-serif text-5xl md:text-6xl font-normal leading-tight">
                Pantry <span className="italic font-light opacity-50">&</span> Inventory
              </h2>
              <p className="mb-12 max-w-md mx-auto lg:mx-0 text-lg leading-relaxed text-white/50 font-light">
                Provide your available ingredients, and we will derive the most elegant culinary path forward.
              </p>
              <Link
                to="/drop-ingredients"
                className="inline-block px-12 py-5 border border-white/20 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-500"
              >
                Search Inventory
              </Link>
            </div>
          </div>
        </section>

        {/* Final Brand Section */}
        <section className="py-40 text-center border-t border-white/10">
          <div className="mb-12">
            <h2 className="font-serif text-6xl md:text-8xl font-normal tracking-widest text-white/10 uppercase">
              Crumbook
            </h2>
          </div>
          <p className="max-w-xl mx-auto text-white/40 font-light tracking-widest text-sm mb-16 uppercase">
            A Collective of Culinary Excellence
          </p>
          <Link
            to="/register"
            className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/40 hover:text-white transition-all border-b border-white/10 hover:border-white pb-2"
          >
            Create Your Account
          </Link>
        </section>
      </div>
    </div>
  )
}

export default Home
