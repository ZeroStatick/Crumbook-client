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
      } catch {
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
        <div className="theme-card w-full max-w-md rounded-3xl p-8 shadow-xl">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-cb-text">Please log in</h2>
          <p className="mt-2 text-cb-text-soft">You need to be logged in to view your personal profile and synced favorites.</p>
          <Link to="/login" className="theme-button-primary mt-8 inline-block w-full px-6 py-3 text-center active:scale-95">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8 px-6 lg:px-8 pb-24">
      {/* User Info Section */}
      <div className="theme-card mb-12 overflow-hidden rounded-3xl shadow-sm">
        <div className="h-40 bg-gradient-to-r from-[#9a3d16] via-[#b45309] to-[#d9981d]"></div>
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row items-center md:items-end justify-between -mt-16 mb-6 gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
              <div className="relative h-32 w-32 overflow-hidden rounded-3xl border-4 border-white bg-amber-50 shadow-2xl group">
                <img 
                  src={previewUrl || user.profile_picture || defaultAvatar} 
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="pb-2">
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="theme-card-soft mt-4 flex flex-col gap-3 rounded-2xl p-4 md:mt-0">
                    <input
                      type="text"
                      className="theme-input rounded-xl px-4 py-2 text-sm"
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
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/70 px-4 py-2 text-xs font-bold text-cb-primary transition-colors hover:bg-amber-50"
                      >
                        📷 Upload New Picture
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="theme-button-primary flex-1 px-4 py-2 text-xs"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="theme-button-secondary flex-1 px-4 py-2 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <h1 className="text-4xl font-black tracking-tight text-cb-text">{user.name}</h1>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="rounded-full p-2 text-cb-primary transition-colors hover:bg-amber-50"
                        title="Edit Profile"
                      >
                        ✏️
                      </button>
                    </div>
                    <p className="font-medium text-cb-text-soft">{user.email}</p>
                  </>
                )}
              </div>
            </div>
            <div className="pb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-cb-primary">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cb-primary"></span>
                  {user.role === 3 ? "Owner" : user.role === 2 ? "Moderator" : "Head Chef"}
                </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-10 flex w-fit flex-wrap gap-2 rounded-2xl bg-amber-50/70 p-1">
        <button
          onClick={() => setActiveTab("my-recipes")}
          className={`px-8 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all ${
            activeTab === "my-recipes" 
              ? "bg-white text-cb-primary shadow-sm" 
              : "text-cb-text-soft hover:bg-white/50 hover:text-cb-text"
          }`}
        >
          My Creations
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={`px-8 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all ${
            activeTab === "favorites" 
              ? "bg-white text-red-500 shadow-sm" 
              : "text-cb-text-soft hover:bg-white/50 hover:text-cb-text"
          }`}
        >
          Favorites ❤️
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-8 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all ${
            activeTab === "settings" 
              ? "bg-white text-cb-text shadow-sm" 
              : "text-cb-text-soft hover:bg-white/50 hover:text-cb-text"
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
              <div key={i} className="h-64 animate-pulse rounded-3xl bg-amber-100"></div>
            ))}
          </div>
        ) : (
          <>
            {activeTab === "my-recipes" && (
              myRecipes.length === 0 ? (
                <div className="theme-card rounded-3xl border-2 border-dashed border-cb-border py-20 text-center shadow-sm">
                  <div className="text-5xl mb-4">🍳</div>
                  <h3 className="text-xl font-bold text-cb-text">No recipes yet</h3>
                  <p className="mx-auto mt-2 max-w-sm text-cb-text-soft">Your culinary masterpieces will appear here once you share them!</p>
                  <Link
                    to="/recipes/new"
                    className="theme-button-primary mt-8 inline-flex items-center gap-2 px-6 py-3"
                  >
                    + Create Your First Recipe
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {myRecipes.map((recipe) => (
                    <div key={recipe._id} className="theme-card group flex flex-col overflow-hidden rounded-3xl transition-all hover:-translate-y-1 hover:shadow-2xl">
                      <div className="flex-grow p-8">
                        <div className="mb-4 flex items-center gap-2">
                          {recipe.tags?.slice(0, 2).map(tag => (
                            <span key={tag} className="rounded-lg bg-amber-100/60 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-cb-primary">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="mb-3 text-2xl font-black leading-tight text-cb-text transition-colors group-hover:text-cb-primary">
                          {recipe.title}
                        </h3>
                        <p className="line-clamp-2 text-sm leading-relaxed text-cb-text-soft">
                          {recipe.description || "A delicious recipe shared with the Crumbook community."}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-amber-100/60 bg-amber-50/45 px-8 py-5">
                        <span className="text-xs font-black uppercase tracking-tighter text-cb-text-soft/75">
                          {recipe.difficulty} • {recipe.prepTime + recipe.cookTime} MINS
                        </span>
                        <div className="flex gap-4">
                          <Link to={`/recipes/edit/${recipe._id}`} className="text-sm font-bold text-cb-primary transition-colors hover:text-cb-primary-strong">Edit</Link>
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
                <div className="theme-card rounded-3xl border-2 border-dashed border-cb-border py-20 text-center shadow-sm">
                  <div className="text-5xl mb-4">❤️</div>
                  <h3 className="text-xl font-bold text-cb-text">Your favorites are empty</h3>
                  <p className="mx-auto mt-2 max-w-sm text-cb-text-soft">Explore the world of recipes and save the ones that inspire you!</p>
                  <Link
                    to="/recipes"
                    className="theme-button-primary mt-8 inline-flex items-center gap-2 px-6 py-3"
                  >
                    Browse Global Kitchen <span className="ml-1">→</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {favoriteRecipes.map((recipe) => (
                    <div key={recipe._id} className="theme-card group relative flex flex-col overflow-hidden rounded-3xl transition-all hover:-translate-y-1 hover:shadow-2xl">
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
                        <h3 className="mb-3 text-2xl font-black leading-tight text-cb-text transition-colors group-hover:text-cb-primary">
                          {recipe.title}
                        </h3>
                        <p className="line-clamp-2 text-sm leading-relaxed text-cb-text-soft">
                          {recipe.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-amber-100/60 bg-amber-50/45 px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-amber-200 bg-amber-100 text-[10px] font-bold uppercase text-cb-primary">
                            {recipe.author?.name?.charAt(0) || "C"}
                          </div>
                          <span className="text-xs font-bold text-cb-text-soft/75">
                            {recipe.author?._id ? (
                              <Link to={`/user/${recipe.author._id}`} className="transition-colors hover:text-cb-primary">
                                {recipe.author.name}
                              </Link>
                            ) : (
                              recipe.author?.name || "Chef"
                            )}
                          </span>
                        </div>
                        <Link to={`/recipe/${recipe._id}`} className="text-sm font-black text-cb-primary hover:text-cb-primary-strong">
                          View Recipe →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === "settings" && (
              <div className="theme-card max-w-2xl rounded-3xl p-8 shadow-sm">
                <h2 className="mb-6 text-2xl font-black text-cb-text">Personal Information</h2>
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
                      <label className="ml-1 text-xs font-black uppercase tracking-widest text-cb-text-soft/75">Full Name</label>
                      <input
                        type="text"
                        className="theme-input rounded-2xl px-5 py-4 text-sm"
                        value={settingsData.name}
                        onChange={(e) => setSettingsData({ ...settingsData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="ml-1 text-xs font-black uppercase tracking-widest text-cb-text-soft/75">Email Address</label>
                      <input
                        type="email"
                        className="theme-input rounded-2xl px-5 py-4 text-sm"
                        value={settingsData.email}
                        onChange={(e) => setSettingsData({ ...settingsData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="border-t border-cb-border pt-6">
                    <h3 className="mb-4 text-lg font-black text-cb-text">Change Password</h3>
                    <p className="mb-6 text-sm text-cb-text-soft">Leave these blank if you don't want to change your password.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="ml-1 text-xs font-black uppercase tracking-widest text-cb-text-soft/75">Current Password</label>
                        <input
                          type="password"
                          className="theme-input rounded-2xl px-5 py-4 text-sm"
                          value={settingsData.currentPassword}
                          onChange={(e) => setSettingsData({ ...settingsData, currentPassword: e.target.value })}
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="ml-1 text-xs font-black uppercase tracking-widest text-cb-text-soft/75">New Password</label>
                        <input
                          type="password"
                          className="theme-input rounded-2xl px-5 py-4 text-sm"
                          value={settingsData.password}
                          onChange={(e) => setSettingsData({ ...settingsData, password: e.target.value })}
                          placeholder="Min. 6 characters"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="theme-button-primary w-full px-10 py-4 font-black uppercase tracking-widest md:w-auto active:scale-[0.98]"
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
