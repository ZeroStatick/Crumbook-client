import React, { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { get_user_by_id } from "../../../API/api.api"
import { get_recipes_by_user_id } from "../../../API/recipe.api"
import toast from "react-hot-toast"
import Avatar from "../Avatar"

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
        <div className="mb-12 h-48 animate-pulse rounded-4xl border border-white/10 bg-[#0f141d]"></div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-[1.75rem] border border-white/10 bg-[#0f141d]"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <div className="w-full max-w-md rounded-4xl border border-white/10 bg-[#0f141d] p-10 shadow-2xl">
          <div className="text-6xl mb-6 opacity-50">🔍</div>
          <h2 className="font-serif text-3xl font-black text-white">Chef not found</h2>
          <p className="mt-4 text-white/60">The user profile you are looking for does not exist.</p>
          <Link to="/recipes" className="mt-8 block w-full rounded-full border border-amber-400/20 bg-amber-400/15 py-4 text-sm font-bold text-amber-100 hover:bg-amber-400/25 transition-all">
            Browse All Recipes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8 px-6 lg:px-8 pb-24">
      {/* User Info Section */}
      <div className="mb-12 overflow-hidden rounded-4xl border border-white/10 bg-[#0f141d] shadow-2xl">
        <div className="h-48 bg-[#0a0f16] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/10" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>
        <div className="px-10 pb-10">
          <div className="relative flex flex-col items-center -mt-20 gap-6">
            <Avatar 
              src={profileUser.profile_picture} 
              name={profileUser.name} 
              size="h-40 w-40" 
              fontSize="text-6xl"
              className="rounded-[2.5rem] border-4 border-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.15)] transition-transform hover:scale-105"
            />
            <div className="text-center">
              <p className="mb-2 inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-1 text-[10px] font-black tracking-[0.3em] text-amber-200 uppercase">
                Guest Kitchen
              </p>
              <h1 className="font-serif text-5xl font-black tracking-tight text-white">{profileUser.name}</h1>
              <p className="mt-2 text-sm font-black tracking-widest text-white/30 uppercase">Joined {new Date(profileUser.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Divider Title */}
      <div className="mb-10 flex items-center gap-6">
        <h2 className="whitespace-nowrap font-serif text-3xl font-black text-white">{profileUser.name}'s Collection</h2>
        <div className="h-px grow bg-white/10"></div>
      </div>

      {/* Recipes Grid */}
      <div className="min-h-[400px]">
        {userRecipes.length === 0 ? (
          <div className="rounded-4xl border-2 border-dashed border-white/5 bg-[#0f141d] py-24 text-center">
            <div className="text-6xl mb-6 opacity-30">🍳</div>
            <h3 className="font-serif text-2xl font-black text-white">The kitchen is quiet</h3>
            <p className="mx-auto mt-2 max-w-sm text-white/40">{profileUser.name} hasn't shared any culinary masterpieces yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {userRecipes.map((recipe) => (
              <div key={recipe._id} className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0f141d] transition-all hover:-translate-y-1 hover:border-amber-400/20 hover:shadow-2xl">
                <div className="grow p-8">
                  <div className="mb-6 flex flex-wrap gap-2">
                    {recipe.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold text-white/40 uppercase">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="mb-3 font-serif text-2xl font-black leading-tight text-white transition-colors group-hover:text-amber-200 line-clamp-2">
                    {recipe.title}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-white/60">
                    {recipe.description || "A delicious creation shared with the community."}
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-white/5 bg-[#0d1219] px-8 py-5">
                  <span className="text-[10px] font-black tracking-widest text-white/20 uppercase">
                    {recipe.difficulty} • {recipe.prepTime + recipe.cookTime} MINS
                  </span>
                  <Link to={`/recipe/${recipe._id}`} className="text-xs font-bold text-amber-200 hover:text-white transition-colors">
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
