import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { get_all_recipes } from "../../../API/recipe.api"
import toast from "react-hot-toast"

const Home = () => {
  const [latestRecipes, setLatestRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await get_all_recipes()
        if (Array.isArray(data)) {
          // Sort by newest and take top 3
          const sorted = [...data]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3)
          setLatestRecipes(sorted)
        }
      } catch (err) {
        console.error("Failed to fetch latest recipes:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchLatest()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-20 py-10 pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 py-20 px-8 text-white shadow-2xl">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl">
            Cook with What You Have. <br />
            <span className="text-blue-200">Organize Every Bite.</span>
          </h1>
          <p className="mb-10 text-xl text-blue-100 opacity-90 md:text-2xl">
            Crumbook is your ultimate recipe companion. Find meals based on your pantry, 
            save your favorites, and share your culinary creations with the world.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/recipes"
              className="rounded-full bg-white px-8 py-4 font-bold text-blue-700 shadow-lg transition-all hover:bg-blue-50 hover:scale-105 active:scale-95"
            >
              Browse Recipes
            </Link>
            <Link
              to="/drop-ingredients"
              className="rounded-full bg-blue-500/30 px-8 py-4 font-bold text-white backdrop-blur-md border-2 border-white/20 transition-all hover:bg-blue-500/50 hover:scale-105 active:scale-95"
            >
              Drop Ingredients
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl"></div>
      </section>

      {/* Latest Recipes Section */}
      <section>
        <div className="mb-8 flex items-end justify-between px-2">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Latest Discoveries</h2>
            <p className="text-gray-500">Fresh from our community's kitchens.</p>
          </div>
          <Link to="/recipes" className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
            View All <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-100"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {latestRecipes.length > 0 ? (
              latestRecipes.map((recipe) => (
                <Link
                  key={recipe._id}
                  to={`/recipe/${recipe._id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="mb-3 flex gap-2">
                      <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600">
                        {recipe.difficulty || "Easy"}
                      </span>
                      <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                        ⏱️ {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
                      </span>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-blue-600">
                      {recipe.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-gray-500">
                      {recipe.description || "A delicious recipe waiting for you."}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-400">
                        By {recipe.author?.name || "Chef"}
                      </span>
                      <span className="text-blue-600 font-bold text-sm">View →</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                No recipes found yet. Be the first to create one!
              </div>
            )}
          </div>
        )}
      </section>

      {/* Feature Focus: Drop Ingredients */}
      <section className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <div className="inline-block rounded-2xl bg-amber-50 px-4 py-2 text-sm font-black uppercase tracking-widest text-amber-600 mb-4">
            Special Feature
          </div>
          <h2 className="mb-6 text-4xl font-bold text-gray-900">
            Pantry Empty? <br />
            No problem.
          </h2>
          <p className="mb-8 text-lg text-gray-600 leading-relaxed">
            Our <strong>"Drop Your Ingredients"</strong> engine suggests recipes based on what you actually have. 
            Stop wandering the aisles and start cooking with what's already in your cupboard.
          </p>
          <Link
            to="/drop-ingredients"
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-bold text-white transition-all hover:bg-black hover:scale-105"
          >
            Try Ingredient Drop <span>✨</span>
          </Link>
        </div>
        <div className="order-1 md:order-2">
          <div className="aspect-square rounded-3xl bg-amber-100 flex items-center justify-center text-8xl shadow-inner relative overflow-hidden group">
            <span className="group-hover:scale-110 transition-transform duration-500">🥘</span>
            <div className="absolute top-4 right-4 text-4xl opacity-50">🥦</div>
            <div className="absolute bottom-10 left-10 text-4xl opacity-50 rotate-12">🍅</div>
            <div className="absolute top-1/2 left-4 text-4xl opacity-50 -rotate-12">🥚</div>
          </div>
        </div>
      </section>

      {/* Testimonial/Trust Section */}
      <section className="rounded-3xl bg-gray-50 py-16 px-8 text-center border border-gray-100">
        <h2 className="mb-12 text-3xl font-bold text-gray-900">Why Chefs choose Crumbook</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">📱</div>
            <h3 className="text-xl font-bold">Mobile Friendly</h3>
            <p className="text-gray-500">Keep your recipes handy while you're standing at the stove.</p>
          </div>
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl">📂</div>
            <h3 className="text-xl font-bold">Perfectly Organized</h3>
            <p className="text-gray-500">Categorize, tag, and search through your personal cookbook.</p>
          </div>
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl">🤝</div>
            <h3 className="text-xl font-bold">Community Shared</h3>
            <p className="text-gray-500">Discover new ideas from a world of food enthusiasts.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-8 text-center">
        <h2 className="mb-8 text-4xl font-bold text-gray-900">Ready to start your culinary journey?</h2>
        <Link
          to="/register"
          className="inline-block rounded-full bg-blue-600 px-10 py-4 text-xl font-bold text-white shadow-xl transition-all hover:bg-blue-700 hover:scale-105 active:scale-95"
        >
          Join Crumbook Today
        </Link>
      </section>
    </div>
  )
}

export default Home
