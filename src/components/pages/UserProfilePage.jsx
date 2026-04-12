import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import useUserStore from "../../global/user"
import { get_recipes_by_user_id } from "../../../API/recipe.api"
import toast from "react-hot-toast"

const UserProfilePage = () => {
  const { user } = useUserStore()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserRecipes = async () => {
      if (!user?._id) return

      try {
        const data = await get_recipes_by_user_id(user._id)
        setRecipes(data)
      } catch (error) {
        toast.error("Failed to load your recipes")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRecipes()
  }, [user])

  if (!user) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-gray-800">Please log in</h2>
        <p className="mt-2 text-gray-600">You need to be logged in to view your profile.</p>
        <Link to="/login" className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
          Go to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      {/* User Info Section */}
      <div className="mb-12 overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="px-8 pb-8">
          <div className="relative flex items-end justify-between -mt-12 mb-6">
            <div className="flex items-end gap-6">
              <div className="h-24 w-24 rounded-2xl border-4 border-white bg-gray-200 overflow-hidden shadow-md">
                <img 
                  src={user.profile_picture || "https://ui-avatars.com/api/?name=" + user.name} 
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="pb-2">
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="pb-2">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  {user.role === 3 ? "Owner" : user.role === 2 ? "Moderator" : "Member"}
                </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Recipes Section */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">My Recipes</h2>
          <Link
            to="/recipes/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            + New Recipe
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading your recipes...</div>
        ) : recipes.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 text-center">
            <h3 className="text-lg font-medium text-gray-900">No recipes yet</h3>
            <p className="mt-1 text-gray-500">Start sharing your culinary creations with the world!</p>
            <Link
              to="/recipes/new"
              className="mt-6 inline-flex items-center text-sm font-bold text-blue-600 hover:underline"
            >
              Create your first recipe <span className="ml-1">→</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <div
                key={recipe._id}
                className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg hover:border-blue-200"
              >
                <div className="flex-grow p-6">
                  <div className="mb-3 flex items-center gap-2">
                    {recipe.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {recipe.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-gray-600">
                    {recipe.description || "No description provided."}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
                  <span className="text-xs font-medium text-gray-500">
                    {recipe.prepTime + recipe.cookTime} mins • {recipe.difficulty}
                  </span>
                  <div className="flex gap-3">
                    <Link
                      to={`/recipes/edit/${recipe._id}`}
                      className="text-sm font-bold text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(recipe._id)}
                      className="text-sm font-bold text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                    <Link
                      to={`/recipes/details/${recipe._id}`}
                      className="text-sm font-bold text-gray-600 hover:text-gray-800"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfilePage
