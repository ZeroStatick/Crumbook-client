import React from "react"

/**
 * RecipeFilters Component
 *
 * This component handles the UI for searching, sorting, and filtering recipes.
 * It is designed to be stateless regarding URL params, receiving its values and
 * update handlers via props.
 */
const RecipeFilters = ({
  searchInput, // Current text in the search bar
  setSearchInput, // Function to update search bar text
  onlyFavorites, // Boolean: are we only showing favorites?
  updateFilter, // Multi-purpose function to update URL params
  sortBy, // Current sort selection (e.g., "newest")
  difficulty, // Selected difficulty filter
  maxTime, // Selected maximum preparation time
  servings, // Selected servings range
  selectedTag, // Selected tag filter
  allTags, // Array of all available unique tags
  clearFilters, // Function to reset all filters to default
}) => {
  return (
    <div className="mb-8 space-y-4">
      {/* 
        Row 1: Search and Quick Filters 
        Contains the search input, the Favorites toggle, and the Sort dropdown.
      */}
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
        {/* Search Bar */}
        <div className="relative w-full max-w-md grow">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="rounded-2xl border border-white/15 bg-white/10 text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all w-full p-3 shadow-sm"
          />
        </div>

        {/* Quick Actions (Favorites & Sort) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Favorites Toggle Button */}
          <button
            onClick={() =>
              updateFilter("favorites", onlyFavorites ? "" : "true")
            }
            className={`font-serif inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition-all ${
              onlyFavorites
                ? "border-amber-400/30 bg-amber-400/15 text-amber-100 shadow-sm shadow-amber-400/15"
                : "border-white/15 bg-white/10 text-sm hover:bg-white/10"
            }`}
          >
            {onlyFavorites ? "❤️ Favorites" : "🤍 Favorites"}
          </button>

          {/* Sort Selection */}
          <select
            value={sortBy}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="font-serif rounded-2xl border border-white/15 bg-[#0a0f16] text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all p-3 text-sm shadow-sm"
          >
            <option value="newest" className="bg-[#0f141d]">Newest First</option>
            <option value="oldest" className="bg-[#0f141d]">Oldest First</option>
            <option value="title-asc" className="bg-[#0f141d]">A-Z</option>
            <option value="title-desc" className="bg-[#0f141d]">Z-A</option>
          </select>
        </div>
      </div>

      {/* 
        Row 2: Detailed Filters Grid
        Contains dropdowns for Difficulty, Time, Servings, and Tags.
      */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-[18px] grid grid-cols-2 gap-4 rounded-[1.75rem] p-5 md:grid-cols-4">
        {/* Difficulty Filter */}
        <div>
          <label className="font-serif mb-1 ml-1 block text-xs font-semibold tracking-[0.18em] text-white/70 uppercase">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => updateFilter("difficulty", e.target.value)}
            className="rounded-2xl border border-white/15 bg-[#0a0f16] text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all w-full p-3 text-sm"
          >
            <option value="" className="bg-[#0f141d]">All Levels</option>
            <option value="Easy" className="bg-[#0f141d]">Easy</option>
            <option value="Medium" className="bg-[#0f141d]">Medium</option>
            <option value="Hard" className="bg-[#0f141d]">Hard</option>
          </select>
        </div>

        {/* Max Time Filter */}
        <div>
          <label className="font-serif mb-1 ml-1 block text-xs font-semibold tracking-[0.18em] text-white/70 uppercase">
            Max Time
          </label>
          <select
            value={maxTime}
            onChange={(e) => updateFilter("maxTime", e.target.value)}
            className="rounded-2xl border border-white/15 bg-[#0a0f16] text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all w-full p-3 text-sm"
          >
            <option value="" className="bg-[#0f141d]">Any Time</option>
            <option value="15" className="bg-[#0f141d]">Under 15 min</option>
            <option value="30" className="bg-[#0f141d]">Under 30 min</option>
            <option value="60" className="bg-[#0f141d]">Under 1 hour</option>
            <option value="120" className="bg-[#0f141d]">Under 2 hours</option>
          </select>
        </div>

        {/* Servings Filter */}
        <div>
          <label className="font-serif mb-1 ml-1 block text-xs font-semibold tracking-[0.18em] text-white/70 uppercase">
            Servings
          </label>
          <select
            value={servings}
            onChange={(e) => updateFilter("servings", e.target.value)}
            className="rounded-2xl border border-white/15 bg-[#0a0f16] text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all w-full p-3 text-sm"
          >
            <option value="" className="bg-[#0f141d]">Any Size</option>
            <option value="1-2" className="bg-[#0f141d]">1-2 People</option>
            <option value="3-4" className="bg-[#0f141d]">3-4 People</option>
            <option value="5+" className="bg-[#0f141d]">5+ People</option>
          </select>
        </div>

        {/* Tags Filter */}
        <div>
          <label className="font-serif mb-1 ml-1 block text-xs font-semibold tracking-[0.18em] text-white/70 uppercase">
            Tags
          </label>
          <select
            value={selectedTag}
            onChange={(e) => updateFilter("tag", e.target.value)}
            className="rounded-2xl border border-white/15 bg-[#0a0f16] text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all w-full p-3 text-sm"
          >
            <option value="" className="bg-[#0f141d]">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag} className="bg-[#0f141d]">
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 
        Clear Filters Button 
        Only visible if at least one filter is active.
      */}
      {(searchInput ||
        sortBy !== "newest" ||
        onlyFavorites ||
        difficulty ||
        maxTime ||
        servings ||
        selectedTag) && (
        <div className="flex justify-end">
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm font-bold text-amber-200 hover:text-white"
          >
            <span>✕</span> Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default RecipeFilters
