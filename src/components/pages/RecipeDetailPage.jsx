import React, { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { get_recipe_by_id, delete_recipe } from "../../../API/recipe.api"
import { toggle_favorite } from "../../../API/api.api"
import {
  get_comments_by_recipe,
  create_comment,
  delete_comment,
} from "../../../API/comment.api"
import { DEFAULT_RECIPE_IMAGE } from "../../../constant/images.js"
import useUserStore from "../../global/user.js"
import toast from "react-hot-toast"
import ReportModal from "../ReportModal"
import ShareButton from "../ShareButton"

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
      } catch {
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
      } catch {
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
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-amber-400"></div>
      </div>
    )
  if (!recipe)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 text-6xl">🔍</div>
        <h2 className="font-serif text-3xl font-black text-white">Recipe not found</h2>
        <Link to="/recipes" className="mt-6 text-amber-200 hover:text-white underline">Back to collection</Link>
      </div>
    )

  const isAuthor =
    user && (user._id === recipe.author?._id || user._id === recipe.author)

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      {/* Top Navigation & Actions */}
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/recipes"
          className="group flex items-center gap-2 text-sm font-bold tracking-widest text-white/40 uppercase transition-colors hover:text-white"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span> Back to recipes
        </Link>
        <div className="flex flex-wrap gap-3">
          {user && !isAuthor && (
            <button
              onClick={() => setReportTarget({ id, type: "recipe" })}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[10px] font-black tracking-widest text-white/60 uppercase transition-all hover:bg-white/10 hover:text-white"
            >
              Report
            </button>
          )}
          {user && (
            <button
              onClick={() => navigate(`/recipes/fork/${id}`)}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[10px] font-black tracking-widest text-amber-200 uppercase transition-all hover:bg-amber-400/10"
            >
              Fork Recipe
            </button>
          )}
          <ShareButton recipeId={id} className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[10px] font-black tracking-widest text-white/60 uppercase hover:bg-white/10" />
          <button
            onClick={toggleFavoriteHandler}
            className={`flex items-center gap-2 rounded-full border px-5 py-2 text-[10px] font-black tracking-widest uppercase transition-all ${
              isFav
                ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                : "border-white/10 bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            {isFav ? "❤️ Saved" : "🤍 Save"}
          </button>

          {isAuthor && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/recipes/edit/${id}`)}
                className="rounded-full border border-amber-400/20 bg-amber-400/15 px-5 py-2 text-[10px] font-black tracking-widest text-amber-100 uppercase hover:bg-amber-400/25"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="rounded-full border border-rose-500/20 bg-rose-500/10 px-5 py-2 text-[10px] font-black tracking-widest text-rose-400 uppercase hover:bg-rose-500/20"
              >
                Delete
              </button>
            </div>
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

      {/* Hero Section */}
      <section className="mb-12 overflow-hidden rounded-4xl border border-white/10 bg-[#0f141d] shadow-2xl">
        <div className="relative h-[30rem] w-full overflow-hidden">
          <img
            src={recipe.image || DEFAULT_RECIPE_IMAGE}
            alt={recipe.title}
            className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f141d] via-transparent to-transparent opacity-80" />
          {recipe.imageSource === "ai" && (
            <span className="absolute bottom-6 left-6 rounded-full border border-purple-400/30 bg-black/60 px-4 py-2 text-[10px] font-black tracking-widest text-purple-200 uppercase backdrop-blur-md">
              ✨ AI Generated
            </span>
          )}
        </div>
        
        <div className="px-8 pb-12 pt-8 text-center md:px-16">
          <h1 className="font-serif text-5xl font-black tracking-tight text-white sm:text-6xl">
            {recipe.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-amber-100/60 italic">
            "{recipe.description}"
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-10">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase">Prep Time</span>
              <span className="font-serif text-xl font-black text-white">{recipe.prepTime || 0}m</span>
            </div>
            <div className="h-10 w-px bg-white/5" />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase">Cook Time</span>
              <span className="font-serif text-xl font-black text-white">{recipe.cookTime || 0}m</span>
            </div>
            <div className="h-10 w-px bg-white/5" />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase">Servings</span>
              <span className="font-serif text-xl font-black text-white">{recipe.servings || 1} people</span>
            </div>
            {recipe.difficulty && (
              <>
                <div className="h-10 w-px bg-white/5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase">Level</span>
                  <span className={`inline-flex rounded-full border px-3 py-0.5 text-[10px] font-bold tracking-widest uppercase ${
                    recipe.difficulty === "Easy" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" :
                    recipe.difficulty === "Hard" ? "border-rose-400/20 bg-rose-400/10 text-rose-300" :
                    "border-amber-400/20 bg-amber-400/10 text-amber-300"
                  }`}>
                    {recipe.difficulty}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Ingredients Column */}
        <div className="lg:col-span-1">
          <h2 className="mb-6 font-serif text-3xl font-black tracking-tight text-white flex items-center gap-3">
            Ingredients <span className="h-px grow bg-white/10" />
          </h2>
          <ul className="space-y-4">
            {recipe.ingredients?.map((ing, idx) => (
              <li
                key={idx}
                className="flex items-start justify-between border-b border-white/5 pb-3 transition-colors hover:border-white/10"
              >
                <span className="font-medium text-white/80 capitalize">
                  {ing.item?.name || ing.item || "Unknown"}
                </span>
                <span className="text-xs font-black tracking-widest text-amber-200/40 uppercase">
                  {ing.quantity} {ing.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions Column */}
        <div className="lg:col-span-2">
          <h2 className="mb-6 font-serif text-3xl font-black tracking-tight text-white flex items-center gap-3">
            Instructions <span className="h-px grow bg-white/10" />
          </h2>
          <div className="space-y-10">
            {recipe.instructions?.map((step, idx) => (
              <div key={idx} className="group flex gap-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 font-serif text-lg font-black text-amber-200 shadow-lg shadow-amber-950/20 transition-all group-hover:bg-amber-400/20 group-hover:text-amber-100">
                  {idx + 1}
                </span>
                <p className="pt-1.5 text-lg leading-relaxed text-white/70">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Author/Source Footer */}
      <div className="mt-16 flex flex-wrap items-center justify-between border-t border-white/5 pt-10 text-xs font-bold tracking-widest uppercase">
        <div className="flex items-center gap-3 text-white/40">
          <span>By</span>
          {recipe.author?._id ? (
            <Link
              to={`/user/${recipe.author._id}`}
              className="text-amber-200 hover:text-white transition-colors"
            >
              {recipe.author.name}
            </Link>
          ) : (
            <span className="text-white/60">{recipe.author?.name || "Anonymous"}</span>
          )}
        </div>
        <div className="text-white/20 italic">
          Source: <span className="text-white/40">{recipe.source || "Original Creation"}</span>
        </div>
      </div>

      {/* Comments Section */}
      <section className="mt-20 border-t border-white/5 pt-16">
        <div className="mb-12 flex items-baseline justify-between">
          <h2 className="font-serif text-4xl font-black tracking-tight text-white">
            Chef Comments
          </h2>
          <span className="text-xs font-black tracking-[0.3em] text-amber-200/40 uppercase">
            {comments.length} Discussion{comments.length !== 1 ? 's' : ''}
          </span>
        </div>

        {user && !isAuthor ? (
          <div className="mb-16 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f141d] p-10 shadow-2xl">
            <h3 className="mb-8 font-serif text-2xl font-black text-white">Leave a critique</h3>
            <form onSubmit={handleCommentSubmit} className="space-y-8">
              <div className="space-y-4">
                <label className="ml-1 text-[10px] font-black tracking-widest text-white/30 uppercase">Rating</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNewComment({ ...newComment, rating: num })}
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl transition-all ${
                        newComment.rating >= num
                          ? "bg-amber-400/20 text-amber-300 shadow-inner"
                          : "border border-white/5 bg-white/5 text-white/20 hover:bg-white/10"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="ml-1 text-[10px] font-black tracking-widest text-white/30 uppercase">Your thoughts</label>
                <textarea
                  value={newComment.text}
                  onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                  placeholder="What makes this dish unique?"
                  className="h-32 w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-white outline-none transition-all placeholder:text-white/20 focus:border-amber-400/30 focus:bg-white/10"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingComment}
                className="rounded-full border border-amber-400/20 bg-amber-400/15 px-10 py-4 text-sm font-bold text-amber-100 hover:bg-amber-400/25 transition-all disabled:opacity-50"
              >
                {isSubmittingComment ? "Submitting..." : "Post Critique"}
              </button>
            </form>
          </div>
        ) : !user ? (
          <div className="mb-16 rounded-3xl border border-white/5 bg-white/5 p-10 text-center">
            <p className="text-white/40">Please <Link to="/login" className="font-bold text-amber-200 hover:underline">login</Link> to join the discussion.</p>
          </div>
        ) : isAuthor ? (
          <div className="mb-16 rounded-3xl border border-white/5 bg-white/5 p-10 text-center">
            <p className="text-white/30 italic">You are the author of this recipe.</p>
          </div>
        ) : null}

        <div className="space-y-12">
          {comments.map((comment) => {
            const isCommentAuthor = user && (user._id === comment.comment_author?._id || user._id === comment.comment_author)
            const isAdmin = user && user.role > 1

            return (
              <div key={comment._id} className="group relative border-b border-white/5 pb-10 last:border-0">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] border border-white/10 bg-[#0a0f16] font-serif text-xl font-black text-amber-200">
                      {comment.comment_author?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-black text-white">
                        {comment.comment_author?.name || "Anonymous Chef"}
                      </h4>
                      <div className="flex text-xs tracking-tighter text-amber-400">
                        {"★".repeat(comment.rating)}{"☆".repeat(5 - comment.rating)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 opacity-0 transition-opacity group-hover:opacity-100">
                    {user && !isCommentAuthor && (
                      <button
                        onClick={() => setReportTarget({ id: comment._id, type: "comment" })}
                        className="text-[10px] font-black tracking-widest text-white/20 uppercase hover:text-white"
                      >
                        Report
                      </button>
                    )}
                    {(isCommentAuthor || isAdmin) && (
                      <button
                        onClick={() => handleCommentDelete(comment._id)}
                        className="text-[10px] font-black tracking-widest text-rose-400/60 uppercase hover:text-rose-400"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-lg leading-relaxed text-white/60">
                  {comment.text}
                </p>
                <span className="mt-4 block text-[10px] font-black tracking-widest text-white/20 uppercase">
                  {new Date(comment.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )
          })}
          {comments.length === 0 && (
            <p className="text-center text-sm italic text-white/20">
              Silence in the kitchen. Be the first to speak.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

export default RecipeDetailPage
