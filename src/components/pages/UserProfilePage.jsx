import React, { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import useUserStore from "../../global/user"
import {
  get_recipes_by_user_id,
  delete_recipe,
  get_all_recipes,
} from "../../../API/recipe.api"
import { edit_user, toggle_favorite } from "../../../API/api.api"
import toast from "react-hot-toast"
import { DEFAULT_AVATAR } from "../../../constant/images.js"

const UserProfilePage = () => {
  const { user, setUser } = useUserStore()
  const [activeTab, setActiveTab] = useState("my-recipes") // "my-recipes", "favorites", or "settings"
  const [searchTerm, setSearchTerm] = useState("")
  const [myRecipes, setMyRecipes] = useState([])
  const [favoriteRecipes, setFavoriteRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ name: "", profile_picture: "" })
  const [settingsData, setSettingsData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    password: "",
  })
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  // Local guest favorites as fallback
  const [guestFavorites, setGuestFavorites] = useState(() => {
    const saved = localStorage.getItem("recipe_favorites")
    return saved ? JSON.parse(saved) : []
  })

  const favoriteIds = user ? user.favorites || [] : guestFavorites

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
        password: "",
      })
    }
  }, [user])

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return

      setLoading(true)
      try {
        const myData = await get_recipes_by_user_id(user._id)
        setMyRecipes(Array.isArray(myData) ? myData : [])

        const allRecipes = await get_all_recipes()
        if (Array.isArray(allRecipes)) {
          const filteredFavs = allRecipes.filter((r) =>
            favoriteIds.includes(r._id || r.id),
          )
          setFavoriteRecipes(filteredFavs)
        }
      } catch (error) {
        toast.error("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?._id, favoriteIds.length])

  const handleDelete = async (recipeId) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return
    try {
      await delete_recipe(recipeId)
      toast.success("Recipe deleted")
      setMyRecipes((prev) => prev.filter((r) => r._id !== recipeId))
    } catch (error) {
      toast.error("Failed to delete recipe")
    }
  }

  const toggleFavoriteHandler = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()

    if (user) {
      try {
        const updatedUser = await toggle_favorite(id)
        setUser(updatedUser)
        toast.success(updatedUser.favorites.includes(id) ? "Added to favorites" : "Removed from favorites")
      } catch {
        toast.error("Failed to update favorites")
      }
    } else {
      const newFavs = guestFavorites.includes(id)
        ? guestFavorites.filter((favId) => favId !== id)
        : [...guestFavorites, id]
      setGuestFavorites(newFavs)
      localStorage.setItem("recipe_favorites", JSON.stringify(newFavs))
      toast.success(newFavs.includes(id) ? "Added to favorites" : "Removed from favorites")
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      const updatedUser = await edit_user(user._id, editData)
      setUser(updatedUser)
      setIsEditing(false)
      setPreviewUrl(null)
      toast.success("Profile updated")
    } catch (error) {
      toast.error(error.message || "Update failed")
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEditData({ ...editData, profile_picture: file })
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const filteredMyRecipes = myRecipes.filter((r) =>
    (r.title || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredFavoriteRecipes = favoriteRecipes.filter((r) =>
    (r.title || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <div className="w-full max-w-md rounded-4xl border border-white/10 bg-[#0f141d] p-10 text-center shadow-2xl">
          <div className="mb-6 text-6xl opacity-50">🔒</div>
          <h2 className="font-serif text-3xl font-black text-white">Chef Portal Only</h2>
          <p className="mt-4 text-white/60">Please sign in to access your creations and curated collections.</p>
          <Link
            to="/login"
            className="mt-8 block w-full rounded-full border border-amber-400/20 bg-amber-400/15 py-4 text-sm font-bold text-amber-100 hover:bg-amber-400/25 transition-all"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-4 px-6 pb-24 md:p-8 lg:px-8">
      {/* User Header Section */}
      <div className="mb-12 overflow-hidden rounded-4xl border border-white/10 bg-[#0f141d] shadow-2xl">
        <div className="h-48 bg-[#0a0f16] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/10" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>
        <div className="px-10 pb-10">
          <div className="relative -mt-20 flex flex-col items-center justify-between gap-8 md:flex-row md:items-end">
            <div className="flex flex-col items-center gap-8 md:flex-row md:items-end">
              <div className="relative group">
                <div className="h-40 w-40 overflow-hidden rounded-[2.5rem] border-4 border-amber-400/50 bg-[#0a0f16] shadow-[0_0_30px_rgba(251,191,36,0.15)] transition-transform hover:scale-105">
                  <img
                    src={previewUrl || user.profile_picture || DEFAULT_AVATAR}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white shadow-xl backdrop-blur-xl transition-all hover:bg-white/10"
                  >
                    ✏️
                  </button>
                )}
              </div>

              <div className="text-center md:text-left pb-2">
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <input
                      type="text"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-amber-400/30 outline-none"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      required
                    />
                    <div className="flex gap-2">
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                      <button type="button" onClick={() => fileInputRef.current.click()} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10">
                        📷 New Picture
                      </button>
                      <button type="submit" className="rounded-xl bg-amber-400/10 border border-amber-400/20 px-4 py-2 text-xs font-bold text-amber-100 hover:bg-amber-400/20">
                        Save
                      </button>
                      <button type="button" onClick={() => setIsEditing(false)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/40">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h1 className="font-serif text-5xl font-black tracking-tight text-white">{user.name}</h1>
                    <p className="mt-2 text-lg font-medium text-amber-200/60">{user.email}</p>
                  </>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-5 py-2 text-[10px] font-black tracking-[0.2em] text-amber-200 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                {user.role === 3 ? "Owner" : user.role === 2 ? "Moderator" : "Head Chef"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-12 flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar">
        {[
          { id: "my-recipes", label: "My Creations", icon: "🍳" },
          { id: "favorites", label: "Favorites", icon: "❤️" },
          { id: "settings", label: "Account Settings", icon: "⚙️" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchTerm(""); }}
            className={`flex items-center gap-3 whitespace-nowrap rounded-full border px-8 py-4 text-xs font-black tracking-[0.15em] uppercase transition-all ${
              activeTab === tab.id
                ? "border-amber-400/30 bg-amber-400/10 text-amber-200 shadow-lg shadow-amber-950/20"
                : "border-white/5 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="text-base">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {loading && activeTab !== "settings" ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-[1.75rem] border border-white/10 bg-[#0f141d]" />
            ))}
          </div>
        ) : (
          <>
            {activeTab === "my-recipes" && (
              <div className="space-y-10">
                {myRecipes.length > 0 && (
                  <div className="max-w-md">
                    <input
                      type="text"
                      placeholder="Search creations..."
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white outline-none focus:border-amber-400/30 transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                )}
                {filteredMyRecipes.length === 0 ? (
                  <div className="rounded-4xl border-2 border-dashed border-white/5 bg-[#0f141d] py-24 text-center">
                    <div className="mb-6 text-6xl opacity-30">🍳</div>
                    <h3 className="font-serif text-2xl font-black text-white">No recipes found</h3>
                    <p className="mt-2 text-white/40">Ready to share your culinary genius?</p>
                    <Link to="/recipes/new" className="mt-8 inline-flex rounded-full border border-amber-400/20 bg-amber-400/15 px-8 py-3 text-sm font-bold text-amber-100 hover:bg-amber-400/25">
                      + Create Recipe
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredMyRecipes.map((recipe) => (
                      <div key={recipe._id} className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0f141d] transition-all hover:-translate-y-1 hover:border-amber-400/20 hover:shadow-2xl">
                        <div className="p-8">
                          <h3 className="font-serif text-2xl font-black text-white group-hover:text-amber-200 transition-colors line-clamp-1">{recipe.title}</h3>
                          <p className="mt-3 line-clamp-2 text-sm text-white/60">{recipe.description || "Shared with the community."}</p>
                          <div className="mt-6 flex flex-wrap gap-2">
                            {recipe.tags?.slice(0, 2).map(tag => (
                              <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold text-white/40 uppercase">#{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-auto border-t border-white/5 bg-[#0d1219] px-8 py-5 flex items-center justify-between">
                          <span className="text-[10px] font-black tracking-widest text-white/20 uppercase">{recipe.difficulty}</span>
                          <div className="flex gap-6">
                            <Link to={`/recipes/edit/${recipe._id}`} className="text-xs font-bold text-amber-200 hover:text-white transition-colors">Edit</Link>
                            <button onClick={() => handleDelete(recipe._id)} className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors">Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "favorites" && (
              <div className="space-y-10">
                {favoriteRecipes.length > 0 && (
                  <div className="max-w-md">
                    <input
                      type="text"
                      placeholder="Search favorites..."
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white outline-none focus:border-amber-400/30 transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                )}
                {filteredFavoriteRecipes.length === 0 ? (
                  <div className="rounded-4xl border-2 border-dashed border-white/5 bg-[#0f141d] py-24 text-center">
                    <div className="mb-6 text-6xl opacity-30">❤️</div>
                    <h3 className="font-serif text-2xl font-black text-white">Your favorites is empty</h3>
                    <p className="mt-2 text-white/40">Explore the world of recipes and save the ones you love.</p>
                    <Link to="/recipes" className="mt-8 inline-flex rounded-full border border-amber-400/20 bg-amber-400/15 px-8 py-3 text-sm font-bold text-amber-100 hover:bg-amber-400/25">
                      Explore Recipes
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredFavoriteRecipes.map((recipe) => (
                      <div key={recipe._id} className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0f141d] transition-all hover:-translate-y-1 hover:border-amber-400/20">
                        <button onClick={(e) => toggleFavoriteHandler(recipe._id, e)} className="absolute top-6 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-2xl bg-black/40 text-rose-400 shadow-xl backdrop-blur-md transition-transform hover:scale-110">❤️</button>
                        <div className="p-8">
                          <h3 className="font-serif text-2xl font-black text-white group-hover:text-amber-200 transition-colors line-clamp-1">{recipe.title}</h3>
                          <p className="mt-3 line-clamp-2 text-sm text-white/60">{recipe.description}</p>
                        </div>
                        <div className="mt-auto border-t border-white/5 bg-[#0d1219] px-8 py-5 flex items-center justify-between">
                          <span className="text-[10px] font-black tracking-widest text-white/20 uppercase">{recipe.author?.name}</span>
                          <Link to={`/recipe/${recipe._id}`} className="text-xs font-bold text-amber-200 hover:text-white">View Recipe →</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="mx-auto max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="rounded-4xl border border-white/10 bg-[#0f141d] p-10 shadow-2xl text-center">
                  <h2 className="mb-8 font-serif text-3xl font-black text-white">Personal Information</h2>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const data = { ...settingsData };
                      if (!data.password) { delete data.password; delete data.currentPassword; }
                      const updated = await edit_user(user._id, data);
                      setUser(updated);
                      setSettingsData({ ...settingsData, currentPassword: "", password: "" });
                      toast.success("Account updated!");
                    } catch (error) {
                      toast.error("Update failed");
                    }
                  }} className="space-y-12 text-left">
                    <div className="flex flex-col gap-10">
                      <div className="flex flex-col gap-5">
                        <label className="ml-1 text-xs font-black tracking-widest text-white/50 uppercase">Full Name</label>
                        <input type="text" className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none focus:border-amber-400/30 transition-all" value={settingsData.name} onChange={(e) => setSettingsData({ ...settingsData, name: e.target.value })} required />
                      </div>
                      <div className="flex flex-col gap-5">
                        <label className="ml-1 text-xs font-black tracking-widest text-white/50 uppercase">Email Address</label>
                        <input type="email" className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none focus:border-amber-400/30 transition-all" value={settingsData.email} onChange={(e) => setSettingsData({ ...settingsData, email: e.target.value })} required />
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-12 text-left">
                      <h3 className="mb-2 font-serif text-2xl font-black text-white">Security</h3>
                      <p className="mb-10 text-sm text-white/40">Keep these blank to maintain your current password.</p>
                      <div className="flex flex-col gap-10 text-left">
                        <div className="flex flex-col gap-5">
                          <label className="ml-1 text-xs font-black tracking-widest text-white/50 uppercase">Current Password</label>
                          <input type="password" className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none focus:border-amber-400/30 transition-all" value={settingsData.currentPassword} onChange={(e) => setSettingsData({ ...settingsData, currentPassword: e.target.value })} placeholder="••••••••" />
                        </div>
                        <div className="flex flex-col gap-5">
                          <label className="ml-1 text-xs font-black tracking-widest text-white/50 uppercase">New Password</label>
                          <input type="password" className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none focus:border-amber-400/30 transition-all" value={settingsData.password} onChange={(e) => setSettingsData({ ...settingsData, password: e.target.value })} placeholder="Min. 6 characters" />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <button type="submit" className="rounded-full border border-amber-400/20 bg-amber-400/15 px-10 py-4 text-sm font-bold text-amber-100 hover:bg-amber-400/25 transition-all">
                        Update Account
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default UserProfilePage
