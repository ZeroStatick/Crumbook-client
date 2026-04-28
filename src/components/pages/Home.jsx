import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { get_all_recipes } from "../../../API/recipe.api"

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
    <div className="mx-auto flex max-w-7xl flex-col gap-20 px-4 py-10 pb-24 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2rem] border border-amber-200/70 bg-gradient-to-r from-[#b44a17] via-[#cf7a17] to-[#d9981d] px-8 py-20 text-white shadow-2xl shadow-amber-950/15">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl">
            Cook with What You Have. <br />
            <span className="text-amber-100">Organize Every Bite.</span>
          </h1>
          <p className="mb-10 text-xl text-amber-50/90 md:text-2xl">
            Crumbook is your ultimate recipe companion. Find meals based on your pantry, 
            save your favorites, and share your culinary creations with the world.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/recipes"
              className="rounded-full border border-amber-200 bg-amber-50 px-8 py-4 font-bold text-[#8d3500] shadow-lg transition-all hover:scale-105 hover:bg-white active:scale-95"
            >
              Browse Recipes
            </Link>
            <Link
              to="/drop-ingredients"
              className="rounded-full border-2 border-amber-50/30 bg-[#9a3d16]/40 px-8 py-4 font-bold text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-[#8d3500]/45 active:scale-95"
            >
              Drop Ingredients
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/14 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-amber-100/20 blur-3xl"></div>
      </section>

      {/* Latest Recipes Section */}
      <section>
        <div className="mb-8 flex items-end justify-between px-2">
          <div>
            <h2 className="text-3xl font-bold text-cb-text">Latest Discoveries</h2>
            <p className="text-cb-text-soft">Fresh from our community's kitchens.</p>
          </div>
          <Link to="/recipes" className="group flex items-center gap-1 font-bold text-cb-primary hover:text-cb-primary-strong">
            View All <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="theme-card h-64 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {latestRecipes.length > 0 ? (
              latestRecipes.map((recipe) => (
                <Link
                  key={recipe._id}
                  to={`/recipe/${recipe._id}`}
                  className="theme-card group flex flex-col overflow-hidden rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="p-6">
                    <div className="mb-3 flex gap-2">
                      <span className="rounded-lg bg-amber-100/60 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-cb-primary">
                        {recipe.difficulty || "Easy"}
                      </span>
                      <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-cb-text-soft">
                        ⏱️ {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
                      </span>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-cb-text group-hover:text-cb-primary">
                      {recipe.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-cb-text-soft">
                      {recipe.description || "A delicious recipe waiting for you."}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-xs font-bold text-cb-text-soft/80">
                        By {recipe.author?.name || "Chef"}
                      </span>
                      <span className="text-sm font-bold text-cb-primary">View →</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border-2 border-dashed border-cb-border bg-cb-surface py-12 text-center text-cb-text-soft">
                No recipes found yet. Be the first to create one!
              </div>
            )}
          </div>
        )}
      </section>

      {/* Feature Focus: Drop Ingredients */}
      <section className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <div className="mb-4 inline-block rounded-2xl bg-amber-100/60 px-4 py-2 text-sm font-black uppercase tracking-widest text-cb-primary">
            Special Feature
          </div>
          <h2 className="mb-6 text-4xl font-bold text-cb-text">
            Pantry Empty? <br />
            No problem.
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-cb-text-soft">
            Our <strong>"Drop Your Ingredients"</strong> engine suggests recipes based on what you actually have. 
            Stop wandering the aisles and start cooking with what's already in your cupboard.
          </p>
          <Link
            to="/drop-ingredients"
            className="theme-button-primary inline-flex items-center gap-2 px-6 py-3 hover:scale-105"
          >
            Try Ingredient Drop <span>✨</span>
          </Link>
        </div>
        <div className="order-1 md:order-2">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 text-8xl shadow-inner group">
            <span className="group-hover:scale-110 transition-transform duration-500">🥘</span>
            <div className="absolute top-4 right-4 text-4xl opacity-50">🥦</div>
            <div className="absolute bottom-10 left-10 text-4xl opacity-50 rotate-12">🍅</div>
            <div className="absolute top-1/2 left-4 text-4xl opacity-50 -rotate-12">🥚</div>
          </div>
        </div>
      </section>

      {/* Testimonial/Trust Section */}
      <section className="theme-card rounded-3xl px-8 py-16 text-center">
        <h2 className="mb-12 text-3xl font-bold text-cb-text">Why Chefs choose Crumbook</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-3xl">📱</div>
            <h3 className="text-xl font-bold">Mobile Friendly</h3>
            <p className="text-cb-text-soft">Keep your recipes handy while you're standing at the stove.</p>
          </div>
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-3xl">📂</div>
            <h3 className="text-xl font-bold">Perfectly Organized</h3>
            <p className="text-cb-text-soft">Categorize, tag, and search through your personal cookbook.</p>
          </div>
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl">🤝</div>
            <h3 className="text-xl font-bold">Community Shared</h3>
            <p className="text-cb-text-soft">Discover new ideas from a world of food enthusiasts.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-8 text-center">
        <h2 className="mb-8 text-4xl font-bold text-cb-text">Ready to start your culinary journey?</h2>
        <Link
          to="/register"
          className="theme-button-primary inline-block rounded-full px-10 py-4 text-xl shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          Join Crumbook Today
        </Link>
      </section>
    </div>
  )
}

export default Home
