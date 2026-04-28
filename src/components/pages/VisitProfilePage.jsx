import React, { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { get_user_by_id } from "../../../API/api.api"
import { get_recipes_by_user_id } from "../../../API/recipe.api"
import toast from "react-hot-toast"

const VisitProfilePage = () => {
  const { id } = useParams()
  const [profileUser, setProfileUser] = useState(null)
  const [userRecipes, setUserRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true)
      try {
        const [userData, recipesData] = await Promise.all([
          get_user_by_id(id),
          get_recipes_by_user_id(id)
        ])
        
        setProfileUser(userData)
        setUserRecipes(Array.isArray(recipesData) ? recipesData : [])
      } catch (error) {
        toast.error("Failed to load profile data")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProfileData()
    }
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-4 md:p-8 px-6 lg:px-8 pb-24 min-h-[60vh]">
        <div className="mb-12 h-40 animate-pulse rounded-3xl bg-amber-100"></div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl bg-amber-100"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <div className="theme-card w-full max-w-md rounded-3xl p-8 shadow-xl">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-cb-text">Chef not found</h2>
          <p className="mt-2 text-cb-text-soft">The user profile you are looking for does not exist.</p>
          <Link to="/recipes" className="theme-button-primary mt-8 inline-block w-full px-6 py-3 text-center active:scale-95">
            Browse All Recipes
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
          <div className="relative flex flex-col items-center -mt-16 mb-6 gap-4">
            <div className="h-32 w-32 overflow-hidden rounded-3xl border-4 border-white bg-amber-50 shadow-2xl">
              <img 
                src={profileUser.profile_picture || `https://ui-avatars.com/api/?name=${profileUser.name}&background=F97316&color=fff`} 
                alt={profileUser.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-black tracking-tight text-cb-text">{profileUser.name}</h1>
              <p className="mt-1 font-medium text-cb-text-soft">Joined {new Date(profileUser.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="mb-10">
        <h2 className="text-2xl font-black uppercase tracking-widest text-cb-text">{profileUser.name}'s Kitchen</h2>
        <div className="mt-2 h-1 w-20 rounded-full bg-cb-primary"></div>
      </div>

      {/* Recipes Grid */}
      <div className="min-h-[400px]">
        {userRecipes.length === 0 ? (
          <div className="theme-card rounded-3xl border-2 border-dashed border-cb-border py-20 text-center shadow-sm">
            <div className="text-5xl mb-4">🍳</div>
            <h3 className="text-xl font-bold text-cb-text">No recipes yet</h3>
            <p className="mx-auto mt-2 max-w-sm text-cb-text-soft">{profileUser.name} hasn't shared any recipes yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {userRecipes.map((recipe) => (
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
                  <Link to={`/recipe/${recipe._id}`} className="text-sm font-black text-cb-primary transition-colors hover:text-cb-primary-strong">
                    View Recipe →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VisitProfilePage
