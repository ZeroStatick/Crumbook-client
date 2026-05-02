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

// --- Professional Dashboard Components ---

const SearchBar = memo(({ placeholder, onSearchChange }) => {
  const [localValue, setLocalValue] = useState("")

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localValue)
    }, 250)
    return () => clearTimeout(handler)
  }, [localValue, onSearchChange])

  return (
    <div className="relative group w-full">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/20 transition-colors group-focus-within:text-amber-200/50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-xs text-white outline-none transition-all placeholder:text-white/20 focus:border-amber-400/30 focus:bg-white/10"
      />
    </div>
  )
})

const StatsSection = memo(({ stats }) => (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
    {[
      { label: "Platform Users", val: stats.totalUsers, accent: "border-blue-500/30" },
      { label: "Shared Recipes", val: stats.totalRecipes, accent: "border-amber-500/30" },
      { label: "Security Staff", val: stats.adminsCount, accent: "border-purple-500/30" },
      { label: "Content Density", val: `${stats.averageRecipesPerUser} r/u`, accent: "border-emerald-500/30" },
      { label: "Active Incidents", val: stats.reportsCount, accent: `border-rose-500/30 ${stats.reportsCount > 0 ? "animate-pulse" : ""}` },
    ].map((s, i) => (
      <div key={i} className={`flex flex-col rounded-2xl border-l-4 bg-[#0f141d] p-5 shadow-xl ${s.accent}`}>
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">{s.label}</span>
        <span className="mt-1 font-serif text-3xl font-black text-white">{s.val}</span>
      </div>
    ))}
  </div>
))

const IngredientRow = memo(({ ing }) => (
  <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
    <td className="px-6 py-4 font-serif text-sm font-black text-white">{ing.name}</td>
    <td className="px-6 py-4">
      <span className="rounded-lg border border-white/5 bg-white/5 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-white/40">{ing.category}</span>
    </td>
    <td className="px-6 py-4 text-[10px] font-medium tracking-widest text-amber-200/40 uppercase">{ing.unit || "N/A"}</td>
  </tr>
))

const UserRow = memo(({ u, onDelete, onRoleChange, currentUser }) => {
  const isOwner = currentUser?.role === 3
  const isAdmin = currentUser?.role === 2
  const isSelf = (currentUser?._id || currentUser?.id) === (u._id || u.id)
  const canEditRole = !isSelf && isOwner
  const canDelete = !isSelf && (isOwner || (isAdmin && u.role < 2))

  return (
    <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
      <td className="px-6 py-4">
        <div className="font-serif text-sm font-black text-white">{u.name}</div>
        <div className="text-[10px] font-medium text-white/30">{u.email}</div>
      </td>
      <td className="px-6 py-4">
        {canEditRole ? (
          <select
            value={u.role}
            onChange={(e) => onRoleChange(u._id || u.id, parseInt(e.target.value))}
            className="rounded-lg border border-white/10 bg-[#0a0f16] p-1.5 text-[10px] font-black text-amber-200 outline-none focus:border-amber-400/30"
          >
            <option value={1}>USER</option>
            <option value={2}>ADMIN</option>
            {isOwner && <option value={3}>OWNER</option>}
          </select>
        ) : (
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[9px] font-black tracking-widest uppercase ${
            u.role === 3 ? "border-purple-400/20 bg-purple-400/10 text-purple-300" :
            u.role === 2 ? "border-amber-400/20 bg-amber-400/10 text-amber-300" :
            "border-white/10 bg-white/5 text-white/40"
          }`}>
            <span className={`h-1 w-1 rounded-full ${u.role >= 2 ? "bg-amber-400 animate-pulse" : "bg-white/20"}`} />
            {u.role === 3 ? "OWNER" : u.role === 2 ? "ADMIN" : "USER"}
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={() => onDelete(u._id || u.id)}
          disabled={!canDelete}
          className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-2 text-xs text-rose-500 transition-all hover:bg-rose-500/10 disabled:opacity-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </td>
    </tr>
  )
})

const ReportRow = memo(({ r, onDeleteRecipe, onDeleteComment, onDismissReport }) => {
  const isRecipe = r.target_type === "recipe"
  const recipeId = isRecipe ? r.recipe_id?._id : r.comment_id?.commented_recipe?._id
  const recipeTitle = isRecipe ? (r.recipe_id?.title || "Unknown Content") : (r.comment_id?.commented_recipe?.title || "Parent Recipe")
  
  return (
    <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1.5">
          <Link to={`/recipe/${recipeId}`} className="font-serif text-sm font-black text-amber-200 hover:text-white transition-colors">
            {recipeTitle}
          </Link>
          {!isRecipe && r.comment_id && (
            <div className="rounded-xl border border-white/5 bg-white/5 p-3 text-[11px] italic leading-relaxed text-white/50">
              "{r.comment_id.text || "Comment trace lost"}"
              <div className="mt-1 text-[9px] font-bold not-italic tracking-wider text-white/20">— {r.comment_id.comment_author?.name || "System Trace"}</div>
            </div>
          )}
          <div className="text-[9px] font-black uppercase tracking-widest text-white/20">Reporter: {r.user_id?.name || "Anonymous Trace"}</div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1.5">
          <span className="rounded bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[9px] font-black tracking-widest text-rose-400 uppercase">
            {r.sort?.replace("_", " ") || "INCIDENT"}
          </span>
          <div className="max-w-[180px] truncate text-[10px] italic text-white/40" title={r.reason}>
            "{r.reason || "Context not provided"}"
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end gap-2">
          {isRecipe && r.recipe_id && (
            <button onClick={() => onDeleteRecipe(r.recipe_id._id || r.recipe_id.id, r._id)} className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-[9px] font-black text-rose-400 hover:bg-rose-500/20">PURGE</button>
          )}
          {!isRecipe && r.comment_id && (
            <button onClick={() => onDeleteComment(r.comment_id._id || r.comment_id.id, r._id)} className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-[9px] font-black text-rose-400 hover:bg-rose-500/20">PURGE</button>
          )}
          <button onClick={() => onDismissReport(r._id)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-black text-white/40 hover:text-white transition-all">DISMISS</button>
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

  const recipeReports = useMemo(() => (data.reports || []).filter(r => r.target_type === "recipe"), [data.reports])
  const commentReports = useMemo(() => (data.reports || []).filter(r => r.target_type === "comment"), [data.reports])

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
        const [u, r, i] = await Promise.all([get_all_users(), get_all_recipes(), get_all_ingredients()])
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
      toast.success("Identity purged")
    } catch { toast.error("Delete failed") }
  }, [])

  const handleDeleteUser = useCallback((id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-serif text-sm font-black text-white">Purge user account?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="rounded-lg border border-white/10 px-3 py-1 text-[10px] font-black text-white/40">CANCEL</button>
          <button onClick={() => { toast.dismiss(t.id); executeDeleteUser(id); }} className="rounded-lg bg-rose-600 px-3 py-1 text-[10px] font-black text-white shadow-lg">PURGE</button>
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
      toast.success("Content purged")
    } catch { toast.error("Action failed") }
  }, [])

  const handleDeleteRecipe = useCallback((recipeId, reportId) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-serif text-sm font-black text-white">Purge content and incident trace?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="rounded-lg border border-white/10 px-3 py-1 text-[10px] font-black text-white/40">CANCEL</button>
          <button onClick={() => { toast.dismiss(t.id); executeDeleteRecipe(recipeId, reportId); }} className="rounded-lg bg-rose-600 px-3 py-1 text-[10px] font-black text-white shadow-lg">PURGE</button>
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
      toast.success("Trace purged")
    } catch { toast.error("Action failed") }
  }, [])

  const handleDeleteComment = useCallback((commentId, reportId) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-serif text-sm font-black text-white">Purge comment and reports?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="rounded-lg border border-white/10 px-3 py-1 text-[10px] font-black text-white/40">CANCEL</button>
          <button onClick={() => { toast.dismiss(t.id); executeDeleteComment(commentId, reportId); }} className="rounded-lg bg-rose-600 px-3 py-1 text-[10px] font-black text-white shadow-lg">PURGE</button>
        </div>
      </div>
    ))
  }, [executeDeleteComment])

  const handleDismissReport = useCallback(async (reportId) => {
    try {
      await delete_report(reportId)
      setData((prev) => ({ ...prev, reports: prev.reports.filter((rep) => rep._id !== reportId) }))
      toast.success("Incident resolved")
    } catch { toast.error("Action failed") }
  }, [])

  const handleRoleChange = useCallback(async (id, newRole) => {
    try {
      await edit_user(id, { role: newRole })
      setData((prev) => ({ ...prev, users: prev.users.map((u) => (u._id || u.id) === id ? { ...u, role: newRole } : u) }))
      toast.success("Privileges updated")
    } catch { toast.error("Update failed") }
  }, [])

  const handleAddIng = useCallback(async (e) => {
    e.preventDefault()
    if (!newIng.name || !newIng.category) return toast.error("Incomplete data")
    setIsAdding(true)
    try {
      const res = await add_ingredient(newIng)
      setData((prev) => ({ ...prev, ingredients: [...prev.ingredients, res] }))
      setNewIng({ name: "", category: "", unit: "" })
      toast.success("Inventory updated")
    } catch { toast.error("Add failed") } finally { setIsAdding(false) }
  }, [newIng])

  const onIngSearch = useCallback((val) => startTransition(() => setIngSearch(val)), [])
  const onUserSearch = useCallback((val) => startTransition(() => setUserSearch(val)), [])

  const filteredIngs = useMemo(() => (data.ingredients || []).filter((i) => i.name.toLowerCase().includes(ingSearch.toLowerCase())).slice(0, 40), [data.ingredients, ingSearch])
  const filteredUsers = useMemo(() => (data.users || []).filter((u) => u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())).slice(0, 40), [data.users, userSearch])

  const isAdmin = currentUser && (currentUser.role >= 2 || currentUser.isAdmin)
  if (data.loading) return <div className="flex min-h-screen items-center justify-center font-serif text-lg font-black text-amber-200 animate-pulse">Initializing Command Center...</div>
  if (!isAdmin) return <div className="flex min-h-screen items-center justify-center p-10 font-serif text-3xl font-black text-rose-500 uppercase tracking-tighter">Unauthorized Access</div>

  return (
    <div className="mx-auto max-w-7xl space-y-12 p-6 pb-24 md:p-10">
      <div className="flex items-end justify-between border-b border-white/5 pb-8">
        <div>
          <p className="mb-1 inline-flex rounded border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[8px] font-black tracking-[0.3em] text-amber-200 uppercase">System Root</p>
          <h1 className="font-serif text-5xl font-black tracking-tight text-white">Admin Dashboard</h1>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-black tracking-widest text-white/20 uppercase">Last Sync</p>
          <p className="text-xs font-bold text-white/60">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      <StatsSection stats={stats} />
      
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Incident Management */}
        <div className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0f141d] shadow-2xl">
          <div className="border-b border-rose-500/10 bg-rose-500/[0.03] p-6 flex justify-between items-center">
            <h2 className="font-serif text-xl font-black text-white">Content Reports</h2>
            <span className="rounded-full bg-rose-500/20 px-3 py-1 text-[9px] font-black tracking-widest text-rose-300 uppercase">{recipeReports.length + commentReports.length} ALERTS</span>
          </div>
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-[#0f141d] text-[9px] font-black uppercase tracking-widest text-white/30 border-b border-white/5">
                <tr><th className="px-6 py-4">Target Source</th><th className="px-6 py-4">Incident Logic</th><th className="px-6 py-4 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[...recipeReports, ...commentReports].map((rep) => (
                  <ReportRow 
                    key={rep._id} 
                    r={rep} 
                    onDeleteRecipe={handleDeleteRecipe} 
                    onDeleteComment={handleDeleteComment}
                    onDismissReport={handleDismissReport} 
                  />
                ))}
              </tbody>
            </table>
            {(recipeReports.length + commentReports.length) === 0 && <div className="p-16 text-center text-[10px] font-black tracking-widest text-white/10 uppercase">System Secure. No active reports.</div>}
          </div>
        </div>

        {/* Inventory Control */}
        <div className="flex h-[600px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0f141d] shadow-2xl">
          <div className="space-y-6 border-b border-white/5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-black text-white">Master Inventory</h2>
              <span className="text-[10px] font-black tracking-widest text-white/20 uppercase">{data.ingredients.length} ITEMS</span>
            </div>
            <form onSubmit={handleAddIng} className="grid grid-cols-5 gap-3 rounded-2xl bg-white/[0.03] p-4 border border-white/5">
              <input type="text" value={newIng.name} onChange={(e) => setNewIng({ ...newIng, name: e.target.value })} placeholder="Item Name" className="col-span-2 rounded-xl border border-white/10 bg-black/20 p-2.5 text-[11px] font-medium text-white outline-none focus:border-amber-400/30" required />
              <select value={newIng.category} onChange={(e) => setNewIng({ ...newIng, category: e.target.value })} className="col-span-2 rounded-xl border border-white/10 bg-black/20 p-2.5 text-[11px] font-black text-amber-200 outline-none focus:border-amber-400/30" required>
                <option value="">CATEGORY</option>
                {["Vegetables", "Fruits", "Meat", "Dairy", "Spices", "Grains", "Other"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button disabled={isAdding} className="rounded-xl bg-amber-400/10 text-amber-200 text-[10px] font-black border border-amber-400/20 hover:bg-amber-400/20 active:scale-95 transition-all">{isAdding ? "..." : "PUSH"}</button>
            </form>
            <SearchBar placeholder="Filter Inventory..." onSearchChange={onIngSearch} />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <tbody className="divide-y divide-white/5">
                {filteredIngs.map((i) => <IngredientRow key={i._id} ing={i} />)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Identity Registry */}
        <div className="flex h-[600px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0f141d] shadow-2xl lg:col-span-2">
          <div className="space-y-6 border-b border-white/5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-black text-white">Identity Registry</h2>
              <span className="text-[10px] font-black tracking-widest text-white/20 uppercase">{data.users.length} RECORDS</span>
            </div>
            <div className="max-w-md">
              <SearchBar placeholder="Search Identities..." onSearchChange={onUserSearch} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-[#0f141d] text-[9px] font-black uppercase tracking-widest text-white/30 border-b border-white/5">
                <tr><th className="px-6 py-4">Account Holder</th><th className="px-6 py-4">Access Level</th><th className="px-6 py-4 text-right">Registry Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
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
