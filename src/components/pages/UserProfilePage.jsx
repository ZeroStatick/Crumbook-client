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

  // Local guest favorites as fallback if user favorites are not yet available or for guests
  const [guestFavorites, setGuestFavorites] = useState(() => {
    const saved = localStorage.getItem("recipe_favorites")
    return saved ? JSON.parse(saved) : []
  })

  // The actual favorite IDs to use
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
        // Fetch My Recipes
        const myData = await get_recipes_by_user_id(user._id)
        setMyRecipes(Array.isArray(myData) ? myData : [])

        // Fetch All Recipes to filter Favorites
        const allRecipes = await get_all_recipes()
        if (Array.isArray(allRecipes)) {
          const filteredFavs = allRecipes.filter((r) =>
            favoriteIds.includes(r._id || r.id),
          )
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
    if (
      !window.confirm(
        "Are you sure you want to delete this recipe? This action cannot be undone.",
      )
    ) {
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
        toast.success(
          isNowFav ? "Added to favorites" : "Removed from favorites",
        )
      } catch {
        toast.error("Failed to update favorites")
      }
    } else {
      const newFavs = guestFavorites.includes(id)
        ? guestFavorites.filter((favId) => favId !== id)
        : [...guestFavorites, id]

      setGuestFavorites(newFavs)
      localStorage.setItem("recipe_favorites", JSON.stringify(newFavs))
      toast.success(
        guestFavorites.includes(id)
          ? "Removed from favorites"
          : "Added to favorites (Guest)",
      )
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

  const filteredMyRecipes = myRecipes.filter((r) =>
    (r.title || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredFavoriteRecipes = favoriteRecipes.filter((r) =>
    (r.title || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="theme-card w-full max-w-md rounded-3xl p-8 shadow-xl">
          <div className="mb-4 text-6xl">🔒</div>
          <h2 className="text-cb-text text-2xl font-bold">Please log in</h2>
          <p className="text-cb-text-soft mt-2">
            You need to be logged in to view your personal profile and synced
            favorites.
          </p>
          <Link
            to="/login"
            className="theme-button-primary mt-8 inline-block w-full px-6 py-3 text-center active:scale-95"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-4 px-6 pb-24 md:p-8 lg:px-8">
      {/* User Info Section */}
      <div className="theme-card mb-12 overflow-hidden rounded-3xl shadow-sm">
        <div className="h-40 bg-gradient-to-r from-[#9a3d16] via-[#b45309] to-[#d9981d]"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-end md:text-left">
              <div className="group relative h-32 w-32 overflow-hidden rounded-3xl border-4 border-white bg-amber-50 shadow-2xl">
                <img
                  src={previewUrl || user.profile_picture || DEFAULT_AVATAR}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="pb-2">
                {isEditing ? (
                  <form
                    onSubmit={handleUpdateProfile}
                    className="theme-card-soft mt-4 flex flex-col gap-3 rounded-2xl p-4 md:mt-0"
                  >
                    <input
                      type="text"
                      className="theme-input rounded-xl px-4 py-2 text-sm"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
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
                        onKeyDown={(e) =>
                          e.key === "Enter" && e.preventDefault()
                        }
                        onMouseDown={(e) => e.preventDefault()}
                        className="text-cb-primary flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/70 px-4 py-2 text-xs font-bold transition-colors hover:bg-amber-50"
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
                    <div className="flex items-center justify-center gap-3 md:justify-start">
                      <h1 className="text-cb-text text-4xl font-black tracking-tight">
                        {user.name}
                      </h1>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-cb-primary rounded-full p-2 transition-colors hover:bg-amber-50"
                        title="Edit Profile"
                      >
                        ✏️
                      </button>
                    </div>
                    <p className="text-cb-text-soft font-medium">
                      {user.email}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="pb-4">
              <span className="text-cb-primary inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-black tracking-widest uppercase">
                <span className="bg-cb-primary h-1.5 w-1.5 animate-pulse rounded-full"></span>
                {user.role === 3
                  ? "Owner"
                  : user.role === 2
                    ? "Moderator"
                    : "Head Chef"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-10 flex w-fit flex-wrap gap-2 rounded-2xl bg-amber-50/70 p-1">
        <button
          onClick={() => {
            setActiveTab("my-recipes")
            setSearchTerm("")
          }}
          className={`rounded-xl px-8 py-3 text-sm font-black tracking-widest uppercase transition-all ${
            activeTab === "my-recipes"
              ? "text-cb-primary bg-white shadow-sm"
              : "text-cb-text-soft hover:text-cb-text hover:bg-white/50"
          }`}
        >
          My Creations
        </button>
        <button
          onClick={() => {
            setActiveTab("favorites")
            setSearchTerm("")
          }}
          className={`rounded-xl px-8 py-3 text-sm font-black tracking-widest uppercase transition-all ${
            activeTab === "favorites"
              ? "bg-white text-red-500 shadow-sm"
              : "text-cb-text-soft hover:text-cb-text hover:bg-white/50"
          }`}
        >
          Favorites ❤️
        </button>
        <button
          onClick={() => {
            setActiveTab("settings")
            setSearchTerm("")
          }}
          className={`rounded-xl px-8 py-3 text-sm font-black tracking-widest uppercase transition-all ${
            activeTab === "settings"
              ? "text-cb-text bg-white shadow-sm"
              : "text-cb-text-soft hover:text-cb-text hover:bg-white/50"
          }`}
        >
          Account Settings ⚙️
        </button>
      </div>

      {/* Search Bar - Only for My Recipes and Favorites */}
      {(activeTab === "my-recipes" || activeTab === "favorites") &&
        (myRecipes.length > 0 || favoriteRecipes.length > 0) && (
          <div className="mb-8 max-w-md">
            <div className="group relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-xl">
                🔍
              </span>
              <input
                type="text"
                placeholder={`Search in ${activeTab === "my-recipes" ? "your creations" : "favorites"}...`}
                className="theme-input w-full rounded-2xl py-4 pr-4 pl-12 transition-all focus:ring-2 focus:ring-amber-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-cb-text-soft hover:text-cb-text absolute inset-y-0 right-0 flex items-center pr-4"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

      {/* Content Section */}
      <div className="min-h-[400px]">
        {loading && activeTab !== "settings" ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-3xl bg-amber-100"
              ></div>
            ))}
          </div>
        ) : (
          <>
            {activeTab === "my-recipes" &&
              (myRecipes.length === 0 ? (
                <div className="theme-card border-cb-border rounded-3xl border-2 border-dashed py-20 text-center shadow-sm">
                  <div className="mb-4 text-5xl">🍳</div>
                  <h3 className="text-cb-text text-xl font-bold">
                    No recipes yet
                  </h3>
                  <p className="text-cb-text-soft mx-auto mt-2 max-w-sm">
                    Your culinary masterpieces will appear here once you share
                    them!
                  </p>
                  <Link
                    to="/recipes/new"
                    className="theme-button-primary mt-8 inline-flex items-center gap-2 px-6 py-3"
                  >
                    + Create Your First Recipe
                  </Link>
                </div>
              ) : filteredMyRecipes.length === 0 ? (
                <div className="theme-card border-cb-border rounded-3xl border-2 border-dashed py-20 text-center shadow-sm">
                  <div className="mb-4 text-5xl">🔍</div>
                  <h3 className="text-cb-text text-xl font-bold">
                    No matches found
                  </h3>
                  <p className="text-cb-text-soft mx-auto mt-2 max-w-sm">
                    We couldn't find any recipes matching "{searchTerm}" in your
                    creations.
                  </p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="theme-button-secondary mt-8 px-6 py-3"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredMyRecipes.map((recipe) => (
                    <div
                      key={recipe._id}
                      className="theme-card group flex flex-col overflow-hidden rounded-3xl transition-all hover:-translate-y-1 hover:shadow-2xl"
                    >
                      <div className="flex-grow p-8">
                        <div className="mb-4 flex items-center gap-2">
                          {recipe.tags?.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-cb-primary rounded-lg bg-amber-100/60 px-2.5 py-1 text-[10px] font-black tracking-widest uppercase"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-cb-text group-hover:text-cb-primary mb-3 text-2xl leading-tight font-black transition-colors">
                          {recipe.title}
                        </h3>
                        <p className="text-cb-text-soft line-clamp-2 text-sm leading-relaxed">
                          {recipe.description ||
                            "A delicious recipe shared with the Crumbook community."}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-amber-100/60 bg-amber-50/45 px-8 py-5">
                        <span className="text-cb-text-soft/75 text-xs font-black tracking-tighter uppercase">
                          {recipe.difficulty} •{" "}
                          {recipe.prepTime + recipe.cookTime} MINS
                        </span>
                        <div className="flex gap-4">
                          <Link
                            to={`/recipes/edit/${recipe._id}`}
                            className="text-cb-primary hover:text-cb-primary-strong text-sm font-bold transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(recipe._id)}
                            className="text-sm font-bold text-red-500 transition-colors hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

            {activeTab === "favorites" &&
              (favoriteRecipes.length === 0 ? (
                <div className="theme-card border-cb-border rounded-3xl border-2 border-dashed py-20 text-center shadow-sm">
                  <div className="mb-4 text-5xl">❤️</div>
                  <h3 className="text-cb-text text-xl font-bold">
                    Your favorites are empty
                  </h3>
                  <p className="text-cb-text-soft mx-auto mt-2 max-w-sm">
                    Explore the world of recipes and save the ones that inspire
                    you!
                  </p>
                  <Link
                    to="/recipes"
                    className="theme-button-primary mt-8 inline-flex items-center gap-2 px-6 py-3"
                  >
                    Browse Global Kitchen <span className="ml-1">→</span>
                  </Link>
                </div>
              ) : filteredFavoriteRecipes.length === 0 ? (
                <div className="theme-card border-cb-border rounded-3xl border-2 border-dashed py-20 text-center shadow-sm">
                  <div className="mb-4 text-5xl">🔍</div>
                  <h3 className="text-cb-text text-xl font-bold">
                    No matches found
                  </h3>
                  <p className="text-cb-text-soft mx-auto mt-2 max-w-sm">
                    We couldn't find any recipes matching "{searchTerm}" in your
                    favorites.
                  </p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="theme-button-secondary mt-8 px-6 py-3"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredFavoriteRecipes.map((recipe) => (
                    <div
                      key={recipe._id}
                      className="theme-card group relative flex flex-col overflow-hidden rounded-3xl transition-all hover:-translate-y-1 hover:shadow-2xl"
                    >
                      <button
                        onClick={(e) => toggleFavoriteHandler(recipe._id, e)}
                        className="absolute top-6 right-6 z-10 rounded-2xl bg-white p-3 text-red-500 shadow-xl transition-transform hover:scale-110"
                      >
                        ❤️
                      </button>
                      <div className="flex-grow p-8">
                        <div className="mb-4">
                          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-black tracking-widest text-emerald-600 uppercase">
                            {recipe.difficulty}
                          </span>
                        </div>
                        <h3 className="text-cb-text group-hover:text-cb-primary mb-3 text-2xl leading-tight font-black transition-colors">
                          {recipe.title}
                        </h3>
                        <p className="text-cb-text-soft line-clamp-2 text-sm leading-relaxed">
                          {recipe.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-amber-100/60 bg-amber-50/45 px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className="text-cb-primary flex h-6 w-6 items-center justify-center rounded-full border border-amber-200 bg-amber-100 text-[10px] font-bold uppercase">
                            {recipe.author?.name?.charAt(0) || "C"}
                          </div>
                          <span className="text-cb-text-soft/75 text-xs font-bold">
                            {recipe.author?._id ? (
                              <Link
                                to={`/user/${recipe.author._id}`}
                                className="hover:text-cb-primary transition-colors"
                              >
                                {recipe.author.name}
                              </Link>
                            ) : (
                              recipe.author?.name || "Chef"
                            )}
                          </span>
                        </div>
                        <Link
                          to={`/recipe/${recipe._id}`}
                          className="text-cb-primary hover:text-cb-primary-strong text-sm font-black"
                        >
                          View Recipe →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

            {activeTab === "settings" && (
              <div className="theme-card max-w-2xl rounded-3xl p-8 shadow-sm">
                <h2 className="text-cb-text mb-6 text-2xl font-black">
                  Personal Information
                </h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    try {
                      // Filter out empty password fields if not changing password
                      const dataToLink = { ...settingsData }
                      if (!dataToLink.password) {
                        delete dataToLink.password
                        delete dataToLink.currentPassword
                      }

                      const updatedUser = await edit_user(user._id, dataToLink)
                      setUser(updatedUser)
                      setSettingsData({
                        ...settingsData,
                        currentPassword: "",
                        password: "",
                      })
                      toast.success("Account information updated!")
                    } catch (error) {
                      toast.error(error.message || "Update failed")
                    }
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-cb-text-soft/75 ml-1 text-xs font-black tracking-widest uppercase">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="theme-input rounded-2xl px-5 py-4 text-sm"
                        value={settingsData.name}
                        onChange={(e) =>
                          setSettingsData({
                            ...settingsData,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-cb-text-soft/75 ml-1 text-xs font-black tracking-widest uppercase">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="theme-input rounded-2xl px-5 py-4 text-sm"
                        value={settingsData.email}
                        onChange={(e) =>
                          setSettingsData({
                            ...settingsData,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="border-cb-border border-t pt-6">
                    <h3 className="text-cb-text mb-4 text-lg font-black">
                      Change Password
                    </h3>
                    <p className="text-cb-text-soft mb-6 text-sm">
                      Leave these blank if you don't want to change your
                      password.
                    </p>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-cb-text-soft/75 ml-1 text-xs font-black tracking-widest uppercase">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="theme-input rounded-2xl px-5 py-4 text-sm"
                          value={settingsData.currentPassword}
                          onChange={(e) =>
                            setSettingsData({
                              ...settingsData,
                              currentPassword: e.target.value,
                            })
                          }
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-cb-text-soft/75 ml-1 text-xs font-black tracking-widest uppercase">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="theme-input rounded-2xl px-5 py-4 text-sm"
                          value={settingsData.password}
                          onChange={(e) =>
                            setSettingsData({
                              ...settingsData,
                              password: e.target.value,
                            })
                          }
                          placeholder="Min. 6 characters"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="theme-button-primary w-full px-10 py-4 font-black tracking-widest uppercase active:scale-[0.98] md:w-auto"
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
