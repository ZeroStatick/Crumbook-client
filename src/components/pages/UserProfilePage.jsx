import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import useUserStore from "../../global/user"
import { get_recipes_by_user_id, delete_recipe, get_all_recipes } from "../../../API/recipe.api"
import { edit_user, toggle_favorite } from "../../../API/api.api"
import toast from "react-hot-toast"

const UserProfilePage = () => {
  const { user, setUser } = useUserStore()
  const [activeTab, setActiveTab] = useState("my-recipes") // "my-recipes" or "favorites"
  const [myRecipes, setMyRecipes] = useState([])
  const [favoriteRecipes, setFavoriteRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ name: "", profile_picture: "" })
  
  // Local guest favorites as fallback if user favorites are not yet available or for guests
  const [guestFavorites, setGuestFavorites] = useState(() => {
    const saved = localStorage.getItem("recipe_favorites")
    return saved ? JSON.parse(saved) : []
  })

  // The actual favorite IDs to use
  const favoriteIds = user ? (user.favorites || []) : guestFavorites

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || "",
        profile_picture: user.profile_picture || "",
      })
    }
  }, [user])

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return

      setLoading(true)
      try {
        // Fetch My Recipes
        const myData = await get_recipes_by_user_id(user._id)
        setMyRecipes(Array.isArray(myData) ? myData : [])

        // Fetch All Recipes to filter Favorites
        const allRecipes = await get_all_recipes()
        if (Array.isArray(allRecipes)) {
          const filteredFavs = allRecipes.filter(r => favoriteIds.includes(r._id || r.id))
          setFavoriteRecipes(filteredFavs)
        }
      } catch (error) {
        toast.error("Failed to load profile data")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?._id, favoriteIds.length]) // Trigger refetch when user changes or favorites count changes

  const handleDelete = async (recipeId) => {
    if (!window.confirm("Are you sure you want to delete this recipe? This action cannot be undone.")) {
      return
    }

    try {
      await delete_recipe(recipeId)
      toast.success("Recipe deleted successfully")
      setMyRecipes((prev) => prev.filter((r) => r._id !== recipeId))
    } catch (error) {
      toast.error(error.message || "Failed to delete recipe")
    }
  }

  const toggleFavoriteHandler = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (user) {
      try {
        const updatedUser = await toggle_favorite(id)
        setUser(updatedUser)
        const isNowFav = updatedUser.favorites.includes(id)
        toast.success(isNowFav ? "Added to favorites" : "Removed from favorites")
      } catch (err) {
        toast.error("Failed to update favorites")
      }
    } else {
      const newFavs = guestFavorites.includes(id) 
        ? guestFavorites.filter(favId => favId !== id) 
        : [...guestFavorites, id]
      
      setGuestFavorites(newFavs)
      localStorage.setItem("recipe_favorites", JSON.stringify(newFavs))
      toast.success(guestFavorites.includes(id) ? "Removed from favorites" : "Added to favorites (Guest)")
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      const updatedUser = await edit_user(user._id, editData)
      setUser(updatedUser)
      setIsEditing(false)
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error(error.message || "Failed to update profile")
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800">Please log in</h2>
          <p className="mt-2 text-gray-600">You need to be logged in to view your personal profile and synced favorites.</p>
          <Link to="/login" className="mt-8 inline-block w-full rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8 px-6 lg:px-8 pb-24">
      {/* User Info Section */}
      <div className="mb-12 overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100">
        <div className="h-40 bg-gradient-to-r from-slate-800 via-slate-900 to-black"></div>
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row items-center md:items-end justify-between -mt-16 mb-6 gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
              <div className="h-32 w-32 rounded-3xl border-4 border-white bg-gray-200 overflow-hidden shadow-2xl relative group">
                <img 
                  src={user.profile_picture || `https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff`} 
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="pb-2">
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="flex flex-col gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200 mt-4 md:mt-0">
                    <input
                      type="text"
                      className="rounded-xl border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      placeholder="Display Name"
                      required
                    />
                    <input
                      type="text"
                      className="rounded-xl border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={editData.profile_picture}
                      onChange={(e) => setEditData({ ...editData, profile_picture: e.target.value })}
                      placeholder="Profile Picture URL"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 rounded-xl bg-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <h1 className="text-4xl font-black text-gray-900 tracking-tight">{user.name}</h1>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="p-2 rounded-full hover:bg-gray-100 text-blue-600 transition-colors"
                        title="Edit Profile"
                      >
                        ✏️
                      </button>
                    </div>
                    <p className="text-gray-500 font-medium">{user.email}</p>
                  </>
                )}
              </div>
            </div>
            <div className="pb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-blue-700 border border-blue-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                  {user.role === 3 ? "Owner" : user.role === 2 ? "Moderator" : "Head Chef"}
                </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-10 flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("my-recipes")}
          className={`px-8 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all ${
            activeTab === "my-recipes" 
              ? "bg-white text-blue-600 shadow-sm" 
              : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
          }`}
        >
          My Creations
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={`px-8 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all ${
            activeTab === "favorites" 
              ? "bg-white text-red-500 shadow-sm" 
              : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
          }`}
        >
          Favorites ❤️
        </button>
      </div>

      {/* Content Section */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
             {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl bg-gray-100"></div>
            ))}
          </div>
        ) : (
          <>
            {activeTab === "my-recipes" ? (
              myRecipes.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white py-20 text-center shadow-sm">
                  <div className="text-5xl mb-4">🍳</div>
                  <h3 className="text-xl font-bold text-gray-900">No recipes yet</h3>
                  <p className="mt-2 text-gray-500 max-w-sm mx-auto">Your culinary masterpieces will appear here once you share them!</p>
                  <Link
                    to="/recipes/new"
                    className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    + Create Your First Recipe
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {myRecipes.map((recipe) => (
                    <div key={recipe._id} className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all hover:shadow-2xl hover:-translate-y-1">
                      <div className="flex-grow p-8">
                        <div className="mb-4 flex items-center gap-2">
                          {recipe.tags?.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="mb-3 text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                          {recipe.title}
                        </h3>
                        <p className="line-clamp-2 text-sm text-gray-500 leading-relaxed">
                          {recipe.description || "A delicious recipe shared with the Crumbook community."}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-50 bg-gray-50/50 px-8 py-5">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">
                          {recipe.difficulty} • {recipe.prepTime + recipe.cookTime} MINS
                        </span>
                        <div className="flex gap-4">
                          <Link to={`/recipes/edit/${recipe._id}`} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">Edit</Link>
                          <button onClick={() => handleDelete(recipe._id)} className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              favoriteRecipes.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white py-20 text-center shadow-sm">
                  <div className="text-5xl mb-4">❤️</div>
                  <h3 className="text-xl font-bold text-gray-900">Your favorites are empty</h3>
                  <p className="mt-2 text-gray-500 max-w-sm mx-auto">Explore the world of recipes and save the ones that inspire you!</p>
                  <Link
                    to="/recipes"
                    className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-bold text-white hover:bg-black transition-all shadow-lg"
                  >
                    Browse Global Kitchen <span className="ml-1">→</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {favoriteRecipes.map((recipe) => (
                    <div key={recipe._id} className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all hover:shadow-2xl hover:-translate-y-1 relative">
                      <button 
                        onClick={(e) => toggleFavoriteHandler(recipe._id, e)}
                        className="absolute top-6 right-6 text-red-500 bg-white shadow-xl p-3 rounded-2xl hover:scale-110 transition-transform z-10"
                      >
                        ❤️
                      </button>
                      <div className="flex-grow p-8">
                        <div className="mb-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            {recipe.difficulty}
                          </span>
                        </div>
                        <h3 className="mb-3 text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                          {recipe.title}
                        </h3>
                        <p className="line-clamp-2 text-sm text-gray-500 leading-relaxed">
                          {recipe.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-50 bg-gray-50/50 px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-[10px] font-bold text-blue-600 uppercase">
                            {recipe.author?.name?.charAt(0) || "C"}
                          </div>
                          <span className="text-xs font-bold text-gray-400">
                            {recipe.author?.name || "Chef"}
                          </span>
                        </div>
                        <Link to={`/recipe/${recipe._id}`} className="text-sm font-black text-blue-600 hover:text-blue-800">
                          View Recipe →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default UserProfilePage
