import React, { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { get_recipe_by_id, delete_recipe } from "../../../API/recipe.api"
import { get_ingredient_by_id } from "../../../API/ingredient.api"
import { toggle_favorite } from "../../../API/api.api"
import {
  get_comments_by_recipe,
  create_comment,
  delete_comment,
} from "../../../API/comment.api"
import useUserStore from "../../global/user.js"
import toast from "react-hot-toast"
import ReportModal from "../ReportModal"

const RecipeDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, setUser } = useUserStore()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState({ text: "", rating: 5 })
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [reportTarget, setReportTarget] = useState(null) // { id, type }

  // Local guest favorites as fallback
  const [guestFavorites, setGuestFavorites] = useState(() => {
    const saved = localStorage.getItem("recipe_favorites")
    return saved ? JSON.parse(saved) : []
  })

  // Determine if current recipe is favorited
  const favorites = user ? user.favorites || [] : guestFavorites
  const isFav = favorites.includes(id)

  const toggleFavoriteHandler = async () => {
    if (user) {
      try {
        const updatedUser = await toggle_favorite(id)
        setUser(updatedUser)
        const isNowFav = updatedUser.favorites.includes(id)
        toast.success(
          isNowFav ? "Added to favorites" : "Removed from favorites",
        )
      } catch (err) {
        toast.error("Failed to update favorites")
      }
    } else {
      // Guest mode logic
      const newFavs = guestFavorites.includes(id)
        ? guestFavorites.filter((favId) => favId !== id)
        : [...guestFavorites, id]

      setGuestFavorites(newFavs)
      localStorage.setItem("recipe_favorites", JSON.stringify(newFavs))
      toast.success(
        newFavs.includes(id)
          ? "Added to favorites (Guest)"
          : "Removed from favorites (Guest)",
      )
    }
  }

  const fetchComments = async () => {
    try {
      const data = await get_comments_by_recipe(id)
      setComments(data)
    } catch (error) {
      console.error("Failed to load comments", error)
    }
  }

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await get_recipe_by_id(id)
        setRecipe(data)
        await fetchComments()
      } catch (error) {
        toast.error("Failed to load recipe details")
        navigate("/recipes")
      } finally {
        setLoading(false)
      }
    }
    fetchRecipe()
  }, [id, navigate])

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return

    try {
      await delete_recipe(id)
      toast.success("Recipe deleted successfully")
      navigate("/recipes")
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error("You must be logged in to comment")
      return
    }
    setIsSubmittingComment(true)
    try {
      await create_comment({
        ...newComment,
        commented_recipe: id,
      })
      toast.success("Comment added!")
      setNewComment({ text: "", rating: 5 })
      fetchComments()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return
    try {
      await delete_comment(commentId)
      toast.success("Comment deleted")
      fetchComments()
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading recipe...</div>
    )
  if (!recipe)
    return <div className="p-8 text-center text-red-500">Recipe not found.</div>

  const isAuthor =
    user && (user._id === recipe.author?._id || user._id === recipe.author)

  const isUserGenerated = recipe.source === "Original" || !recipe.source

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/recipes"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          &larr; Back to all recipes
        </Link>
        <div className="flex gap-3">
          {user && !isAuthor && (
            <button
              onClick={() => setReportTarget({ id, type: "recipe" })}
              className="rounded-xl bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700 hover:bg-orange-200"
            >
              Report Recipe
            </button>
          )}
          {user && (
            <button
              onClick={() => navigate(`/recipes/fork/${id}`)}
              className="rounded-xl bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-200"
            >
              Make Your Own Version
            </button>
          )}
          <button
            onClick={toggleFavoriteHandler}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              isFav
                ? "border border-red-100 bg-red-50 text-red-600"
                : "border border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isFav ? "❤️ Favorited" : "🤍 Add to Favorites"}
          </button>

          {isAuthor && (
            <>
              <button
                onClick={() => navigate(`/recipes/edit/${id}`)}
                className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {reportTarget && (
        <ReportModal
          targetId={reportTarget.id}
          targetType={reportTarget.type}
          onClose={() => setReportTarget(null)}
        />
      )}

      <header className="mb-8 border-b pb-8">
        <h1 className="mb-4 text-4xl font-extrabold text-gray-900">
          {recipe.title}
        </h1>
        <p className="mb-6 text-lg text-gray-600 italic">
          "{recipe.description}"
        </p>

        <div className="flex flex-wrap gap-6 text-sm font-semibold text-gray-500">
          <div className="flex flex-col">
            <span className="text-xs tracking-wider text-gray-400 uppercase">
              Prep Time
            </span>
            <span className="text-gray-800">{recipe.prepTime || 0} mins</span>
          </div>
          <div className="flex flex-col border-l pl-6">
            <span className="text-xs tracking-wider text-gray-400 uppercase">
              Cook Time
            </span>
            <span className="text-gray-800">{recipe.cookTime || 0} mins</span>
          </div>
          <div className="flex flex-col border-l pl-6">
            <span className="text-xs tracking-wider text-gray-400 uppercase">
              Servings
            </span>
            <span className="text-gray-800">{recipe.servings || 1} people</span>
          </div>
          {recipe.difficulty && (
            <div className="flex flex-col border-l pl-6">
              <span className="text-xs tracking-wider text-gray-400 uppercase">
                Difficulty
              </span>
              <span
                className={`mt-1 w-fit rounded px-2 py-0.5 text-xs text-white ${
                  recipe.difficulty === "Easy"
                    ? "bg-green-500"
                    : recipe.difficulty === "Hard"
                      ? "bg-red-500"
                      : "bg-orange-500"
                }`}
              >
                {recipe.difficulty}
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
        {/* Ingredients Column */}
        <div className="md:col-span-1">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Ingredients</h2>
          <ul className="space-y-3">
            {recipe.ingredients?.map((ing, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between border-b border-gray-50 pb-2"
              >
                <span className="font-medium text-gray-800 capitalize">
                  {ing.item?.name || ing.item || "Unknown Ingredient"}
                </span>
                <span className="text-sm text-gray-500">
                  {ing.quantity} {ing.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions Column */}
        <div className="md:col-span-2">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            Instructions
          </h2>
          <div className="space-y-6">
            {recipe.instructions?.map((step, idx) => (
              <div key={idx} className="flex gap-4">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {idx + 1}
                </span>
                <p className="pt-1 leading-relaxed text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-12 flex items-center justify-between border-t pt-8 text-sm text-gray-400">
        <span>
          Published by{" "}
          {recipe.author?._id ? (
            <Link
              to={`/user/${recipe.author._id}`}
              className="font-bold text-gray-600 hover:text-blue-600 hover:underline transition-colors"
            >
              {recipe.author.name}
            </Link>
          ) : (
            recipe.author?.name || "Anonymous"
          )}
        </span>
        <span>Source: {recipe.source || "Original"}</span>
      </footer>

      {/* Comments Section */}
      <section className="mt-16 border-t pt-12">
        <h2 className="mb-8 text-3xl font-extrabold text-gray-900">
          Comments ({comments.length})
        </h2>

        {user && !isAuthor ? (
          <form
            onSubmit={handleCommentSubmit}
            className="mb-12 rounded-2xl bg-gray-50 p-6 shadow-sm"
          >
            <h3 className="mb-4 text-lg font-bold text-gray-800">
              Leave a comment
            </h3>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNewComment({ ...newComment, rating: num })}
                    className={`h-10 w-10 rounded-full text-lg transition-all ${
                      newComment.rating >= num
                        ? "bg-orange-500 text-white shadow-md"
                        : "bg-white text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={newComment.text}
              onChange={(e) =>
                setNewComment({ ...newComment, text: e.target.value })
              }
              placeholder="What do you think of this recipe?"
              className="mb-4 h-32 w-full rounded-xl border border-gray-200 p-4 outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <button
              type="submit"
              disabled={isSubmittingComment}
              className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmittingComment ? "Posting..." : "Post Comment"}
            </button>
          </form>
        ) : !user ? (
          <div className="mb-12 rounded-2xl bg-blue-50 p-6 text-center">
            <p className="text-blue-800">
              Please{" "}
              <Link to="/login" className="font-bold underline">
                login
              </Link>{" "}
              to leave a comment.
            </p>
          </div>
        ) : isAuthor ? (
          <div className="mb-12 rounded-2xl bg-gray-100 p-6 text-center">
            <p className="text-gray-600 italic">
              You cannot comment on your own recipe.
            </p>
          </div>
        ) : null}

        <div className="space-y-8">
          {comments.map((comment) => {
            const isCommentAuthor =
              user && (user._id === comment.comment_author?._id || user._id === comment.comment_author)
            const isAdmin = user && user.role > 1

            return (
              <div
                key={comment._id}
                className="group relative border-b border-gray-100 pb-8 last:border-0"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                      {comment.comment_author?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">
                        {comment.comment_author?.name || "Anonymous"}
                      </h4>
                      <div className="flex text-xs text-orange-400">
                        {"★".repeat(comment.rating)}
                        {"☆".repeat(5 - comment.rating)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    {user && !isCommentAuthor && (
                      <button
                        onClick={() =>
                          setReportTarget({ id: comment._id, type: "comment" })
                        }
                        className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500 hover:bg-orange-100 hover:text-orange-600"
                      >
                        Report
                      </button>
                    )}
                    {(isCommentAuthor || isAdmin) && (
                      <button
                        onClick={() => handleCommentDelete(comment._id)}
                        className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500 hover:bg-red-100 hover:text-red-600"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                <p className="leading-relaxed text-gray-700">{comment.text}</p>
                <span className="mt-2 block text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
            )
          })}
          {comments.length === 0 && (
            <p className="text-center text-gray-400 italic">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

export default RecipeDetailPage
