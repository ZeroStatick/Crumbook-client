import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  useTransition,
} from "react"
import { Link } from "react-router-dom"
import {
  get_all_users,
  delete_user,
  edit_user,
} from "../../../API/api.api"
import { get_all_recipes, delete_recipe } from "../../../API/recipe.api"
import {
  get_all_ingredients,
  add_ingredient,
} from "../../../API/ingredient.api"
import { get_all_reports, delete_report } from "../../../API/report.api"
import { delete_comment } from "../../../API/comment.api"
import toast from "react-hot-toast"
import useUserStore from "../../global/user"

// --- Isolated Search Input Component ---
const SearchBar = memo(({ placeholder, onSearchChange }) => {
  const [localValue, setLocalValue] = useState("")

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localValue)
    }, 250)
    return () => clearTimeout(handler)
  }, [localValue, onSearchChange])

  return (
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cb-text-soft/75">🔍</span>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="theme-input w-full rounded-md p-2 pl-10 transition-shadow"
      />
    </div>
  )
})

const StatsSection = memo(({ stats }) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
    {[
      { label: "Total Users", val: stats.totalUsers, color: "text-cb-primary", em: "👥" },
      { label: "Total Recipes", val: stats.totalRecipes, color: "text-orange-600", em: "🍳" },
      { label: "Admins", val: stats.adminsCount, color: "text-amber-700", em: "🛡️" },
      { label: "Avg Recipes/User", val: stats.averageRecipesPerUser, color: "text-cb-primary-strong", em: "📊" },
      { label: "Pending Reports", val: stats.reportsCount, color: "text-red-600", em: "🚩" },
    ].map((s, i) => (
      <div key={i} className="theme-card flex flex-col items-center rounded-xl p-6 shadow-sm">
        <span className="mb-2 text-4xl">{s.em}</span>
        <span className="text-sm font-medium uppercase tracking-wider text-cb-text-soft">{s.label}</span>
        <span className={`text-3xl font-bold ${s.color}`}>{s.val}</span>
      </div>
    ))}
  </div>
))

const IngredientRow = memo(({ ing }) => (
  <tr className="transition-colors hover:bg-amber-50/40">
    <td className="px-6 py-3 font-medium text-cb-text">{ing.name}</td>
    <td className="px-6 py-3">
      <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-cb-text-soft">{ing.category}</span>
    </td>
    <td className="px-6 py-3 text-sm text-cb-text-soft">{ing.unit || "-"}</td>
  </tr>
))

const UserRow = memo(({ u, onDelete, onRoleChange, currentUser }) => {
  const isOwner = currentUser?.role === 3
  const isAdmin = currentUser?.role === 2
  const targetIsOwner = u.role === 3
  const targetIsAdmin = u.role === 2
  const isSelf = (currentUser?._id || currentUser?.id) === (u._id || u.id)

  const canEditRole = !isSelf && isOwner
  const canDelete = !isSelf && (isOwner || (isAdmin && !targetIsAdmin && !targetIsOwner))

  return (
    <tr className="transition-colors hover:bg-amber-50/40">
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-cb-text">{u.name}</div>
        <div className="max-w-[150px] truncate text-[10px] text-cb-text-soft">{u.email}</div>
      </td>
      <td className="px-6 py-4">
        {canEditRole ? (
          <select
            value={u.role}
            onChange={(e) => onRoleChange(u._id || u.id, parseInt(e.target.value))}
            className="theme-input rounded bg-white p-1 text-[10px] font-bold"
          >
            <option value={1}>USER</option>
            <option value={2}>ADMIN</option>
            {isOwner && <option value={3}>OWNER</option>}
          </select>
        ) : (
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${u.role >= 2 ? "bg-amber-100 text-amber-800" : "bg-orange-50 text-cb-primary"}`}>
            {u.role === 3 ? "OWNER" : u.role === 2 ? "ADMIN" : "USER"}
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-center">
        <button
          onClick={() => onDelete(u._id || u.id)}
          className="rounded p-1 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-30"
          disabled={!canDelete}
          title="Delete User"
        >
          🗑️
        </button>
      </td>
    </tr>
  )
})

const ReportRow = memo(({ r, onDeleteRecipe, onDeleteComment, onDismissReport }) => {
  const isRecipe = r.target_type === "recipe"
  const recipeId = isRecipe ? r.recipe_id?._id : r.comment_id?.commented_recipe?._id
  const recipeTitle = isRecipe 
    ? (r.recipe_id?.title || "Deleted Recipe")
    : (r.comment_id?.commented_recipe?.title || "Recipe")
    
  const commentText = r.comment_id?.text
  const commentAuthor = r.comment_id?.comment_author?.name || "Unknown"
  
  const reporterName = r.user_id?.name || "Unknown User"
  const reportSort = r.sort || "other"
  const reportReason = r.reason || "No reason provided"

  return (
    <tr className="transition-colors hover:bg-amber-50/40">
      <td className="px-6 py-4">
        <div className="text-sm font-bold text-cb-text">
          {isRecipe ? (
            <Link to={`/recipe/${recipeId}`} className="text-cb-primary hover:underline">
              {recipeTitle}
            </Link>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-cb-text-soft">On Recipe: {" "}
                <Link to={`/recipe/${recipeId}`} className="font-medium text-cb-primary hover:underline">
                  {recipeTitle}
                </Link>
              </span>
              <div className="rounded-lg border border-cb-border bg-amber-50/50 p-2 text-[11px] italic text-cb-text-soft">
                "{commentText || "Comment deleted"}"
              </div>
              <span className="text-[10px] font-semibold text-cb-text-soft/75">— {commentAuthor}</span>
            </div>
          )}
        </div>
        <div className="mt-1 text-[10px] text-cb-text-soft">Reported by: {reporterName}</div>
      </td>
      <td className="px-6 py-4">
        <span className="rounded bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700 uppercase">
          {reportSort.replace("_", " ")}
        </span>
        <div className="mt-1 max-w-[200px] truncate text-[10px] italic text-cb-text-soft" title={reportReason}>
          "{reportReason}"
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex justify-center gap-2">
          {isRecipe && r.recipe_id && (
            <button
              onClick={() => onDeleteRecipe(r.recipe_id._id || r.recipe_id.id, r._id)}
              className="rounded p-1 text-red-600 transition-colors hover:bg-red-50"
              title="Delete Recipe"
            >
              🗑️ Recipe
            </button>
          )}
          {!isRecipe && r.comment_id && (
            <button
              onClick={() => onDeleteComment(r.comment_id._id || r.comment_id.id, r._id)}
              className="rounded p-1 text-red-600 transition-colors hover:bg-red-50"
              title="Delete Comment"
            >
              🗑️ Comment
            </button>
          )}
          <button
            onClick={() => onDismissReport(r._id)}
            className="rounded p-1 text-cb-text-soft transition-colors hover:bg-amber-50"
            title="Dismiss Report"
          >
            ✅ Dismiss
          </button>
        </div>
      </td>
    </tr>
  )
})

const AdminDashboard = () => {
  const { user: currentUser } = useUserStore()
  const [data, setData] = useState({
    users: [],
    ingredients: [],
    recipes: [],
    reports: [],
    loading: true,
  })
  const [newIng, setNewIng] = useState({ name: "", category: "", unit: "" })
  const [isAdding, setIsAdding] = useState(false)
  const [, startTransition] = useTransition()
  const [ingSearch, setIngSearch] = useState("")
  const [userSearch, setUserSearch] = useState("")

  const recipeReports = useMemo(() => 
    (data.reports || []).filter(r => r.target_type === "recipe"), 
  [data.reports])
  
  const commentReports = useMemo(() => 
    (data.reports || []).filter(r => r.target_type === "comment"), 
  [data.reports])

  const stats = useMemo(() => {
    const users = data.users || []
    const recipes = data.recipes || []
    const reports = data.reports || []
    const admins = users.filter((u) => u.role >= 2).length
    const avg = users.length > 0 ? (recipes.length / users.length).toFixed(1) : 0
    return {
      totalUsers: users.length,
      totalRecipes: recipes.length,
      adminsCount: admins,
      averageRecipesPerUser: avg,
      reportsCount: reports.length,
    }
  }, [data.users, data.recipes, data.reports])

  useEffect(() => {
    const load = async () => {
      try {
        const [u, r, i] = await Promise.all([
          get_all_users(),
          get_all_recipes(),
          get_all_ingredients(),
        ])
        let rep = []
        try { rep = await get_all_reports() } catch (e) { console.error(e) }
        setData({
          users: Array.isArray(u) ? u : [],
          recipes: Array.isArray(r) ? r : [],
          ingredients: Array.isArray(i) ? i : [],
          reports: Array.isArray(rep) ? rep : [],
          loading: false,
        })
      } catch {
        toast.error("Failed to load dashboard")
        setData((prev) => ({ ...prev, loading: false }))
      }
    }
    load()
  }, [])

  const executeDeleteUser = useCallback(async (id) => {
    try {
      await delete_user(id)
      setData((prev) => ({ ...prev, users: prev.users.filter((u) => (u._id || u.id) !== id) }))
      toast.success("User deleted")
    } catch { toast.error("Delete failed") }
  }, [])

  const handleDeleteUser = useCallback((id) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-cb-text">Delete this user account?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="theme-button-secondary text-[10px] px-2 py-1 rounded">Cancel</button>
          <button onClick={() => { toast.dismiss(t.id); executeDeleteUser(id); }} className="text-[10px] bg-red-600 text-white px-2 py-1 rounded">Delete</button>
        </div>
      </div>
    ))
  }, [executeDeleteUser])

  const executeDeleteRecipe = useCallback(async (recipeId, reportId) => {
    setData((prev) => ({
      ...prev,
      recipes: (prev.recipes || []).filter((r) => (r._id || r.id) !== recipeId),
      reports: (prev.reports || []).filter((rep) => rep._id !== reportId && (rep.recipe_id?._id || rep.recipe_id?.id) !== recipeId),
    }))
    try {
      await Promise.all([delete_recipe(recipeId), delete_report(reportId)])
      toast.success("Recipe deleted")
    } catch { toast.error("Action failed") }
  }, [])

  const handleDeleteRecipe = useCallback((recipeId, reportId) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-cb-text">Delete recipe and all reports?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="theme-button-secondary text-[10px] px-2 py-1 rounded">Cancel</button>
          <button onClick={() => { toast.dismiss(t.id); executeDeleteRecipe(recipeId, reportId); }} className="text-[10px] bg-red-600 text-white px-2 py-1 rounded">Delete</button>
        </div>
      </div>
    ))
  }, [executeDeleteRecipe])

  const executeDeleteComment = useCallback(async (commentId, reportId) => {
    setData((prev) => ({
      ...prev,
      reports: prev.reports.filter((rep) => rep._id !== reportId && (rep.comment_id?._id || rep.comment_id?.id) !== commentId),
    }))
    try {
      await Promise.all([delete_comment(commentId), delete_report(reportId)])
      toast.success("Comment deleted")
    } catch {
      toast.error("Action failed")
    }
  }, [])

  const handleDeleteComment = useCallback((commentId, reportId) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-cb-text">Delete this comment?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="theme-button-secondary text-[10px] px-2 py-1 rounded">Cancel</button>
          <button onClick={() => { toast.dismiss(t.id); executeDeleteComment(commentId, reportId); }} className="text-[10px] bg-red-600 text-white px-2 py-1 rounded">Delete</button>
        </div>
      </div>
    ))
  }, [executeDeleteComment])

  const handleDismissReport = useCallback(async (reportId) => {
    try {
      await delete_report(reportId)
      setData((prev) => ({ ...prev, reports: prev.reports.filter((rep) => rep._id !== reportId) }))
      toast.success("Report dismissed")
    } catch { toast.error("Action failed") }
  }, [])

  const handleRoleChange = useCallback(async (id, newRole) => {
    try {
      await edit_user(id, { role: newRole })
      setData((prev) => ({ ...prev, users: prev.users.map((u) => (u._id || u.id) === id ? { ...u, role: newRole } : u) }))
      toast.success("Role updated")
    } catch { toast.error("Update failed") }
  }, [])

  const handleAddIng = useCallback(async (e) => {
    e.preventDefault()
    if (!newIng.name || !newIng.category) return toast.error("Fill required fields")
    setIsAdding(true)
    try {
      const res = await add_ingredient(newIng)
      setData((prev) => ({ ...prev, ingredients: [...prev.ingredients, res] }))
      setNewIng({ name: "", category: "", unit: "" })
      toast.success("Ingredient added")
    } catch { toast.error("Add failed") } finally { setIsAdding(false) }
  }, [newIng])

  const onIngSearch = useCallback((val) => startTransition(() => setIngSearch(val)), [])
  const onUserSearch = useCallback((val) => startTransition(() => setUserSearch(val)), [])

  const filteredIngs = useMemo(() => (data.ingredients || []).filter((i) => i.name.toLowerCase().includes(ingSearch.toLowerCase())).slice(0, 40), [data.ingredients, ingSearch])
  const filteredUsers = useMemo(() => (data.users || []).filter((u) => u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())).slice(0, 40), [data.users, userSearch])

  const isAdmin = currentUser && (currentUser.role >= 2 || currentUser.isAdmin)
  if (data.loading) return <div className="flex min-h-screen items-center justify-center font-semibold text-cb-text-soft">Loading...</div>
  if (!isAdmin) return <div className="p-10 text-center font-bold text-red-600">Access Denied</div>

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-cb-text">Admin Dashboard</h1>
      <StatsSection stats={stats} />
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recipe Reports Section */}
        <div className="theme-card flex flex-col overflow-hidden rounded-xl shadow-sm">
          <div className="border-b border-orange-50 bg-orange-50/30 p-5">
            <h2 className="flex items-center justify-between font-bold text-orange-800">
              Recipe Reports
              <span className="rounded bg-orange-100 px-2 py-0.5 text-[10px] text-orange-600">Pending: {recipeReports.length}</span>
            </h2>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white text-[10px] font-bold uppercase text-cb-text-soft/75">
                <tr><th className="px-6 py-2">Recipe</th><th className="px-6 py-2">Reason</th><th className="px-6 py-2 text-center">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-amber-100/60">
                {recipeReports.map((rep) => (
                  <ReportRow 
                    key={rep._id} 
                    r={rep} 
                    onDeleteRecipe={handleDeleteRecipe} 
                    onDismissReport={handleDismissReport} 
                  />
                ))}
              </tbody>
            </table>
            {recipeReports.length === 0 && <div className="p-10 text-center text-xs italic text-cb-text-soft/75">No recipe reports</div>}
          </div>
        </div>

        {/* Comment Reports Section */}
        <div className="theme-card flex flex-col overflow-hidden rounded-xl shadow-sm">
          <div className="border-b border-red-50 bg-red-50/30 p-5">
            <h2 className="flex items-center justify-between font-bold text-red-800">
              Comment Reports
              <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] text-red-600">Pending: {commentReports.length}</span>
            </h2>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white text-[10px] font-bold uppercase text-cb-text-soft/75">
                <tr><th className="px-6 py-2">Comment Detail</th><th className="px-6 py-2">Reason</th><th className="px-6 py-2 text-center">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-amber-100/60">
                {commentReports.map((rep) => (
                  <ReportRow 
                    key={rep._id} 
                    r={rep} 
                    onDeleteComment={handleDeleteComment}
                    onDismissReport={handleDismissReport} 
                  />
                ))}
              </tbody>
            </table>
            {commentReports.length === 0 && <div className="p-10 text-center text-xs italic text-cb-text-soft/75">No comment reports</div>}
          </div>
        </div>

        <div className="theme-card flex h-[600px] flex-col overflow-hidden rounded-xl shadow-sm">
          <div className="space-y-4 border-b border-cb-border p-5">
            <h2 className="font-bold text-cb-text">Ingredients ({data.ingredients.length})</h2>
            <form onSubmit={handleAddIng} className="grid grid-cols-5 gap-2 rounded-lg bg-amber-50/50 p-3">
              <input type="text" value={newIng.name} onChange={(e) => setNewIng({ ...newIng, name: e.target.value })} placeholder="Name" className="theme-input col-span-2 p-1.5 text-xs" required />
              <select value={newIng.category} onChange={(e) => setNewIng({ ...newIng, category: e.target.value })} className="theme-input col-span-2 p-1.5 text-xs" required>
                <option value="">Category</option>
                {["Vegetables", "Fruits", "Meat", "Dairy", "Spices", "Grains", "Other"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button disabled={isAdding} className="theme-button-primary rounded text-[10px] text-white">{isAdding ? "..." : "Add"}</button>
            </form>
            <SearchBar placeholder="Filter..." onSearchChange={onIngSearch} />
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left">
              <tbody className="divide-y divide-amber-100/60">
                {filteredIngs.map((i) => <IngredientRow key={i._id} ing={i} />)}
              </tbody>
            </table>
          </div>
        </div>

        <div className="theme-card flex h-[600px] flex-col overflow-hidden rounded-xl shadow-sm">
          <div className="space-y-4 border-b border-cb-border p-5">
            <h2 className="font-bold text-cb-text">Users ({data.users.length})</h2>
            <SearchBar placeholder="Search..." onSearchChange={onUserSearch} />
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left">
              <tbody className="divide-y divide-amber-100/60">
                {filteredUsers.map((u) => <UserRow key={u._id} u={u} onDelete={handleDeleteUser} onRoleChange={handleRoleChange} currentUser={currentUser} />)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
