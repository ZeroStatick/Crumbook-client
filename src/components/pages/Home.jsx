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
      <section className="relative overflow-hidden rounded-4xl border border-white/10 bg-[#10151f]/95 px-8 py-24 text-white shadow-2xl shadow-black/35 backdrop-blur-xl">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="mb-4 inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs tracking-[0.32em] text-amber-200 uppercase">
            The future of cooking
          </p>
          <h1 className="mb-8 font-serif text-5xl font-black tracking-tight md:text-7xl">
            Cook with What You Have. <br />
            <span className="text-amber-200">Organize Every Bite.</span>
          </h1>
          <p className="mb-12 text-lg leading-relaxed text-amber-100/75 md:text-xl">
            Crumbook is your ultimate recipe companion. Find meals based on your pantry, 
            save your favorites, and share your culinary creations with the world.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/recipes"
              className="rounded-full border border-amber-400/20 bg-amber-400/15 px-10 py-4 text-base font-semibold text-amber-100 shadow-lg shadow-amber-950/15 transition-all hover:bg-amber-400/25 active:scale-95"
            >
              Browse Recipes
            </Link>
            <Link
              to="/drop-ingredients"
              className="rounded-full border border-white/10 bg-white/5 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-black/20 transition-all hover:bg-white/10 active:scale-95"
            >
              Drop Ingredients
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl"></div>
      </section>

      {/* Latest Recipes Section */}
      <section>
        <div className="mb-10 flex items-end justify-between px-2">
          <div>
            <h2 className="font-serif text-4xl font-black tracking-tight text-white">Latest Discoveries</h2>
            <p className="mt-2 text-white/60">Fresh from our community's kitchens.</p>
          </div>
          <Link to="/recipes" className="group flex items-center gap-2 font-bold text-amber-200/80 hover:text-amber-200">
            View All <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#0f141d] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.22)] h-64 animate-pulse rounded-[1.75rem]"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {latestRecipes.length > 0 ? (
              latestRecipes.map((recipe) => (
                <Link
                  key={recipe._id}
                  to={`/recipe/${recipe._id}`}
                  className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0f141d] transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/20 hover:shadow-[0_30px_60px_rgba(0,0,0,0.35)]"
                >
                  <div className="p-6">
                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-white/70 uppercase">
                        {recipe.difficulty || "Easy"}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-white/70 uppercase">
                        ⏱️ {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
                      </span>
                    </div>
                    <h3 className="mb-3 font-serif text-2xl font-black leading-tight text-white transition-colors group-hover:text-amber-200">
                      {recipe.title}
                    </h3>
                    <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-white/65">
                      {recipe.description || "A delicious recipe waiting for you."}
                    </p>
                    <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                      <span className="text-xs font-medium text-white/40">
                        By <span className="text-white/70">{recipe.author?.name || "Chef"}</span>
                      </span>
                      <span className="text-sm font-bold text-amber-200 opacity-0 transition-opacity group-hover:opacity-100">View Recipe →</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border-2 border-dashed border-white/10 bg-[#0f141d] py-12 text-center text-white/40">
                No recipes found yet. Be the first to create one!
              </div>
            )}
          </div>
        )}
      </section>

      {/* Feature Focus: Drop Ingredients */}
      <section className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <div className="mb-4 inline-block rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-amber-200">
            Special Feature
          </div>
          <h2 className="mb-6 font-serif text-5xl font-black tracking-tight text-white">
            Pantry Empty? <br />
            No problem.
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-white/65">
            Our <strong>"Drop Your Ingredients"</strong> engine suggests recipes based on what you actually have. 
            Stop wandering the aisles and start cooking with what's already in your cupboard.
          </p>
          <Link
            to="/drop-ingredients"
            className="rounded-full border border-amber-400/20 bg-amber-400/15 px-8 py-3 text-sm font-semibold text-amber-100 shadow-lg shadow-amber-950/15 transition-all hover:bg-amber-400/25 hover:scale-105"
          >
            Try Ingredient Drop <span className="ml-2">✨</span>
          </Link>
        </div>
        <div className="order-1 md:order-2">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-4xl border border-white/10 bg-[#0f141d] text-8xl shadow-2xl group">
            <span className="relative z-10 group-hover:scale-110 transition-transform duration-500">🥘</span>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10 opacity-50"></div>
            <div className="absolute top-8 right-8 text-5xl opacity-20 blur-[1px]">🥦</div>
            <div className="absolute bottom-12 left-12 text-5xl opacity-20 rotate-12 blur-[1px]">🍅</div>
            <div className="absolute top-1/2 left-8 text-5xl opacity-20 -rotate-12 blur-[1px]">🥚</div>
          </div>
        </div>
      </section>

      {/* Testimonial/Trust Section */}
      <section className="rounded-4xl border border-white/10 bg-[#10151f]/95 px-8 py-20 text-center shadow-2xl shadow-black/35 backdrop-blur-xl">
        <h2 className="mb-16 font-serif text-4xl font-black tracking-tight text-white">Why Chefs choose Crumbook</h2>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-4xl shadow-inner shadow-black/40">📱</div>
            <h3 className="font-serif text-2xl font-black text-white">Mobile Friendly</h3>
            <p className="text-base leading-relaxed text-white/60">Keep your recipes handy while you're standing at the stove.</p>
          </div>
          <div className="space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-4xl shadow-inner shadow-black/40">📂</div>
            <h3 className="font-serif text-2xl font-black text-white">Perfectly Organized</h3>
            <p className="text-base leading-relaxed text-white/60">Categorize, tag, and search through your personal cookbook.</p>
          </div>
          <div className="space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-4xl shadow-inner shadow-black/40">🤝</div>
            <h3 className="font-serif text-2xl font-black text-white">Community Shared</h3>
            <p className="text-base leading-relaxed text-white/60">Discover new ideas from a world of food enthusiasts.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 text-center">
        <h2 className="mb-10 font-serif text-5xl font-black tracking-tight text-white">Ready to start your culinary journey?</h2>
        <Link
          to="/register"
          className="rounded-full border border-amber-400/20 bg-amber-400/15 px-12 py-5 text-xl font-bold text-amber-100 shadow-2xl shadow-amber-950/20 transition-all hover:bg-amber-400/25 hover:scale-105 active:scale-95"
        >
          Join Crumbook Today
        </Link>
      </section>
    </div>
  )
}

export default Home
