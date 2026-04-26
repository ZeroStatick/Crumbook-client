import React from "react"

/**
 * RecipeFilters Component
 * 
 * This component handles the UI for searching, sorting, and filtering recipes.
 * It is designed to be stateless regarding URL params, receiving its values and 
 * update handlers via props.
 */
const RecipeFilters = ({
  searchInput,      // Current text in the search bar
  setSearchInput,   // Function to update search bar text
  onlyFavorites,    // Boolean: are we only showing favorites?
  updateFilter,     // Multi-purpose function to update URL params
  sortBy,           // Current sort selection (e.g., "newest")
  difficulty,       // Selected difficulty filter
  maxTime,          // Selected maximum preparation time
  servings,         // Selected servings range
  selectedTag,      // Selected tag filter
  allTags,          // Array of all available unique tags
  clearFilters      // Function to reset all filters to default
}) => {
  return (
    <div className="mb-8 space-y-4">
      {/* 
        Row 1: Search and Quick Filters 
        Contains the search input, the Favorites toggle, and the Sort dropdown.
      */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Search Bar */}
        <div className="relative flex-grow max-w-md w-full">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          />
        </div>

        {/* Quick Actions (Favorites & Sort) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Favorites Toggle Button */}
          <button
            onClick={() => updateFilter("favorites", onlyFavorites ? "" : "true")}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${
              onlyFavorites 
                ? "bg-red-50 border-red-200 text-red-600 shadow-sm" 
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {onlyFavorites ? "❤️ Favorites" : "🤍 Favorites"}
          </button>

          {/* Sort Selection */}
          <select
            value={sortBy}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm shadow-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title-asc">A-Z</option>
            <option value="title-desc">Z-A</option>
          </select>
        </div>
      </div>

      {/* 
        Row 2: Detailed Filters Grid
        Contains dropdowns for Difficulty, Time, Servings, and Tags.
      */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
        {/* Difficulty Filter */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => updateFilter("difficulty", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Max Time Filter */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Max Time</label>
          <select
            value={maxTime}
            onChange={(e) => updateFilter("maxTime", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="">Any Time</option>
            <option value="15">Under 15 min</option>
            <option value="30">Under 30 min</option>
            <option value="60">Under 1 hour</option>
            <option value="120">Under 2 hours</option>
          </select>
        </div>

        {/* Servings Filter */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Servings</label>
          <select
            value={servings}
            onChange={(e) => updateFilter("servings", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="">Any Size</option>
            <option value="1-2">1-2 People</option>
            <option value="3-4">3-4 People</option>
            <option value="5+">5+ People</option>
          </select>
        </div>

        {/* Tags Filter */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Tags</label>
          <select
            value={selectedTag}
            onChange={(e) => updateFilter("tag", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 
        Clear Filters Button 
        Only visible if at least one filter is active.
      */}
      {(searchInput || sortBy !== "newest" || onlyFavorites || difficulty || maxTime || servings || selectedTag) && (
        <div className="flex justify-end">
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1"
          >
            <span>✕</span> Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default RecipeFilters
