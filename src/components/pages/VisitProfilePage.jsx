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
        <div className="h-40 animate-pulse rounded-3xl bg-gray-200 mb-12"></div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl bg-gray-100"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800">Chef not found</h2>
          <p className="mt-2 text-gray-600">The user profile you are looking for does not exist.</p>
          <Link to="/recipes" className="mt-8 inline-block w-full rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200">
            Browse All Recipes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8 px-6 lg:px-8 pb-24">
      {/* User Info Section */}
      <div className="mb-12 overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100">
        <div className="h-40 bg-gradient-to-r from-orange-400 via-orange-500 to-red-500"></div>
        <div className="px-8 pb-8">
          <div className="relative flex flex-col items-center -mt-16 mb-6 gap-4">
            <div className="h-32 w-32 rounded-3xl border-4 border-white bg-gray-200 overflow-hidden shadow-2xl">
              <img 
                src={profileUser.profile_picture || `https://ui-avatars.com/api/?name=${profileUser.name}&background=F97316&color=fff`} 
                alt={profileUser.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">{profileUser.name}</h1>
              <p className="text-gray-500 font-medium mt-1">Joined {new Date(profileUser.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="mb-10">
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest">{profileUser.name}'s Kitchen</h2>
        <div className="mt-2 h-1 w-20 bg-orange-500 rounded-full"></div>
      </div>

      {/* Recipes Grid */}
      <div className="min-h-[400px]">
        {userRecipes.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white py-20 text-center shadow-sm">
            <div className="text-5xl mb-4">🍳</div>
            <h3 className="text-xl font-bold text-gray-900">No recipes yet</h3>
            <p className="mt-2 text-gray-500 max-w-sm mx-auto">{profileUser.name} hasn't shared any recipes yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {userRecipes.map((recipe) => (
              <div key={recipe._id} className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all hover:shadow-2xl hover:-translate-y-1">
                <div className="flex-grow p-8">
                  <div className="mb-4 flex items-center gap-2">
                    {recipe.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="mb-3 text-2xl font-black text-gray-900 group-hover:text-orange-500 transition-colors leading-tight">
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
                  <Link to={`/recipe/${recipe._id}`} className="text-sm font-black text-orange-500 hover:text-orange-700 transition-colors">
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
