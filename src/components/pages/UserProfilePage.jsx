import React, { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import useUserStore from "../../global/user"
import { get_recipes_by_user_id, delete_recipe, get_all_recipes } from "../../../API/recipe.api"
import { edit_user, toggle_favorite } from "../../../API/api.api"
import toast from "react-hot-toast"
import defaultAvatar from "../../assets/bread.jfif"

const UserProfilePage = () => {
  const { user, setUser } = useUserStore()
  const [activeTab, setActiveTab] = useState("my-recipes") // "my-recipes", "favorites", or "settings"
  const [myRecipes, setMyRecipes] = useState([])
  const [favoriteRecipes, setFavoriteRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ name: "", profile_picture: "" })
  const [settingsData, setSettingsData] = useState({ 
    name: "", 
    email: "", 
    currentPassword: "", 
    password: "" 
  })
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

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
      setSettingsData({
        name: user.name || "",
        email: user.email || "",
        currentPassword: "",
        password: ""
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

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({
      name: user.name || "",
      profile_picture: user.profile_picture || "",
    })
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      const updatedUser = await edit_user(user._id, editData)
      setUser(updatedUser)
      setIsEditing(false)
      setPreviewUrl(null)
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error(error.message || "Failed to update profile")
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEditData({ ...editData, profile_picture: file })
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current.click()
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
                  src={previewUrl || user.profile_picture || defaultAvatar} 
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
                    <div className="flex flex-col gap-2">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <button 
                        type="button" 
                        onClick={handleUploadClick}
                        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                        onMouseDown={(e) => e.preventDefault()}
                        className="w-full rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                      >
                        📷 Upload New Picture
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
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
      <div className="mb-10 flex flex-wrap gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
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
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-8 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all ${
            activeTab === "settings" 
              ? "bg-white text-gray-800 shadow-sm" 
              : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
          }`}
        >
          Account Settings ⚙️
        </button>
      </div>

      {/* Content Section */}
      <div className="min-h-[400px]">
        {loading && activeTab !== "settings" ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
             {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl bg-gray-100"></div>
            ))}
          </div>
        ) : (
          <>
            {activeTab === "my-recipes" && (
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
            )}

            {activeTab === "favorites" && (
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
                            {recipe.author?._id ? (
                              <Link to={`/user/${recipe.author._id}`} className="hover:text-blue-500 transition-colors">
                                {recipe.author.name}
                              </Link>
                            ) : (
                              recipe.author?.name || "Chef"
                            )}
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

            {activeTab === "settings" && (
              <div className="max-w-2xl bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Personal Information</h2>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      // Filter out empty password fields if not changing password
                      const dataToLink = { ...settingsData };
                      if (!dataToLink.password) {
                        delete dataToLink.password;
                        delete dataToLink.currentPassword;
                      }
                      
                      const updatedUser = await edit_user(user._id, dataToLink);
                      setUser(updatedUser);
                      setSettingsData({
                        ...settingsData,
                        currentPassword: "",
                        password: ""
                      });
                      toast.success("Account information updated!");
                    } catch (error) {
                      toast.error(error.message || "Update failed");
                    }
                  }} 
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                      <input
                        type="text"
                        className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={settingsData.name}
                        onChange={(e) => setSettingsData({ ...settingsData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                      <input
                        type="email"
                        className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={settingsData.email}
                        onChange={(e) => setSettingsData({ ...settingsData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-50">
                    <h3 className="text-lg font-black text-gray-900 mb-4">Change Password</h3>
                    <p className="text-sm text-gray-500 mb-6">Leave these blank if you don't want to change your password.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Current Password</label>
                        <input
                          type="password"
                          className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={settingsData.currentPassword}
                          onChange={(e) => setSettingsData({ ...settingsData, currentPassword: e.target.value })}
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">New Password</label>
                        <input
                          type="password"
                          className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={settingsData.password}
                          onChange={(e) => setSettingsData({ ...settingsData, password: e.target.value })}
                          placeholder="Min. 6 characters"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full md:w-auto rounded-2xl bg-blue-600 px-10 py-4 font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-[0.98]"
                  >
                    Update Account
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default UserProfilePage
