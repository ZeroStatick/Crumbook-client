import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useTransition,
} from "react"
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
import { generate_guide, get_all_guides, delete_guide, delete_guide_comment } from "../../../API/guide.api"
import toast from "react-hot-toast"
import useUserStore from "../../global/user"

// Modular Admin Components
import SearchBar from "../admin/SearchBar"
import StatsSection from "../admin/StatsSection"
import IngredientRow from "../admin/IngredientRow"
import GuideRow from "../admin/GuideRow"
import UserRow from "../admin/UserRow"
import ReportRow from "../admin/ReportRow"

const AdminDashboard = () => {
  const { user: currentUser } = useUserStore()
  const [data, setData] = useState({
    users: [],
    ingredients: [],
    recipes: [],
    reports: [],
    guides: [],
    loading: true,
  })
  const [newIng, setNewIng] = useState({ name: "", category: "", unit: "" })
  const [isAdding, setIsAdding] = useState(false)
  const [, startTransition] = useTransition()
  const [ingSearch, setIngSearch] = useState("")
  const [userSearch, setUserSearch] = useState("")
  const [guideSearch, setGuideSearch] = useState("")
  const [generatingGuide, setGeneratingGuide] = useState(false)
  const [customPrompt, setCustomPrompt] = useState("")

  const recipeReports = useMemo(() => (data.reports || []).filter(r => r.target_type === "recipe"), [data.reports])
  const commentReports = useMemo(() => (data.reports || []).filter(r => r.target_type === "comment"), [data.reports])
  const guideReports = useMemo(() => (data.reports || []).filter(r => r.target_type === "guide"), [data.reports])
  const guideCommentReports = useMemo(() => (data.reports || []).filter(r => r.target_type === "guide_comment"), [data.reports])

  const stats = useMemo(() => {
    const users = data.users || []
    const recipes = data.recipes || []
    const reports = data.reports || []
    const guides = data.guides || []
    const admins = users.filter((u) => u.role >= 2).length
    const avg = users.length > 0 ? (recipes.length / users.length).toFixed(1) : 0
    return {
      totalUsers: users.length,
      totalRecipes: recipes.length,
      guidesCount: guides.length,
      adminsCount: admins,
      averageRecipesPerUser: avg,
      reportsCount: reports.length,
    }
  }, [data.users, data.recipes, data.reports, data.guides])

  useEffect(() => {
    const load = async () => {
      try {
        const [u, r, i, g] = await Promise.all([
          get_all_users(),
          get_all_recipes(),
          get_all_ingredients(),
          get_all_guides()
        ])
        let rep = []
        try { rep = await get_all_reports() } catch (e) { console.error(e) }
        setData({
          users: Array.isArray(u) ? u : [],
          recipes: Array.isArray(r) ? r : [],
          ingredients: Array.isArray(i) ? i : [],
          guides: Array.isArray(g) ? g : [],
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
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-in fade-in zoom-in duration-300' : 'animate-out fade-out zoom-out duration-300'} pointer-events-auto flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-white/10 bg-[#0f141d] p-5 shadow-2xl shadow-black`}>
        <p className="font-serif text-sm font-black text-white">Delete user account?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="rounded-lg border border-white/10 px-3 py-1 text-[10px] font-black text-white/40 hover:bg-white/5">CANCEL</button>
          <button onClick={() => { toast.dismiss(t.id); executeDeleteUser(id); }} className="rounded-lg bg-rose-600 px-3 py-1 text-[10px] font-black text-white shadow-lg hover:bg-rose-700">DELETE</button>
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
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-in fade-in zoom-in duration-300' : 'animate-out fade-out zoom-out duration-300'} pointer-events-auto flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-white/10 bg-[#0f141d] p-5 shadow-2xl shadow-black`}>
        <p className="font-serif text-sm font-black text-white">Delete recipe and report?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="rounded-lg border border-white/10 px-3 py-1 text-[10px] font-black text-white/40 hover:bg-white/5">CANCEL</button>
          <button onClick={() => { toast.dismiss(t.id); executeDeleteRecipe(recipeId, reportId); }} className="rounded-lg bg-rose-600 px-3 py-1 text-[10px] font-black text-white shadow-lg hover:bg-rose-700">DELETE</button>
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
      toast.success("Recipe comment deleted")
    } catch { toast.error("Action failed") }
  }, [])

  const handleDeleteComment = useCallback((commentId, reportId) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-in fade-in zoom-in duration-300' : 'animate-out fade-out zoom-out duration-300'} pointer-events-auto flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-white/10 bg-[#0f141d] p-5 shadow-2xl shadow-black`}>
        <p className="font-serif text-sm font-black text-white">Delete recipe comment and report?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="rounded-lg border border-white/10 px-3 py-1 text-[10px] font-black text-white/40 hover:bg-white/5">CANCEL</button>
          <button onClick={() => { toast.dismiss(t.id); executeDeleteComment(commentId, reportId); }} className="rounded-lg bg-rose-600 px-3 py-1 text-[10px] font-black text-white shadow-lg hover:bg-rose-700">DELETE</button>
        </div>
      </div>
    ))
  }, [executeDeleteComment])

  const executeDeleteGuideComment = useCallback(async (guideId, commentId, reportId) => {
    setData((prev) => ({
      ...prev,
      reports: prev.reports.filter((rep) => rep._id !== reportId && (rep.guide_comment_id?._id || rep.guide_comment_id?.id) !== commentId),
    }))
    try {
      await Promise.all([delete_guide_comment(guideId, commentId), delete_report(reportId)])
      toast.success("Guide comment deleted")
    } catch { toast.error("Action failed") }
  }, [])

  const handleDeleteGuideComment = useCallback((guideId, commentId, reportId) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-in fade-in zoom-in duration-300' : 'animate-out fade-out zoom-out duration-300'} pointer-events-auto flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-white/10 bg-[#0f141d] p-5 shadow-2xl shadow-black`}>
        <p className="font-serif text-sm font-black text-white">Delete guide comment and report?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="rounded-lg border border-white/10 px-3 py-1 text-[10px] font-black text-white/40 hover:bg-white/5">CANCEL</button>
          <button onClick={() => { toast.dismiss(t.id); executeDeleteGuideComment(guideId, commentId, reportId); }} className="rounded-lg bg-rose-600 px-3 py-1 text-[10px] font-black text-white shadow-lg hover:bg-rose-700">DELETE</button>
        </div>
      </div>
    ))
  }, [executeDeleteGuideComment])

  const handleDismissReport = useCallback(async (reportId) => {
    if (!reportId) {
      toast.error("Invalid report ID");
      return;
    }
    try {
      await delete_report(reportId)
      setData((prev) => ({ ...prev, reports: prev.reports.filter((rep) => (rep._id || rep.id) !== reportId) }))
      toast.success("Report dismissed")
    } catch (error) {
      console.error("Dismissal failed:", error);
      toast.error(error.message || "Action failed");
    }
  }, [])

  const executeDeleteGuide = useCallback(async (guideId, reportId) => {
    setData((prev) => ({
      ...prev,
      guides: (prev.guides || []).filter((g) => (g._id || g.id) !== guideId),
      reports: (prev.reports || []).filter((rep) => rep._id !== reportId && (rep.guide_id?._id || rep.guide_id?.id) !== guideId),
    }))
    try {
      const tasks = [delete_guide(guideId)];
      if (reportId) tasks.push(delete_report(reportId));
      await Promise.all(tasks);
      toast.success("Guide deleted")
    } catch { toast.error("Delete failed") }
  }, [])

  const handleDeleteGuide = useCallback((guideId, reportId) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-in fade-in zoom-in duration-300' : 'animate-out fade-out zoom-out duration-300'} pointer-events-auto flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-white/10 bg-[#0f141d] p-5 shadow-2xl shadow-black`}>
        <p className="font-serif text-sm font-black text-white">Delete this official guide?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="rounded-lg border border-white/10 px-3 py-1 text-[10px] font-black text-white/40 hover:bg-white/5">CANCEL</button>
          <button onClick={() => { toast.dismiss(t.id); executeDeleteGuide(guideId, reportId); }} className="rounded-lg bg-rose-600 px-3 py-1 text-[10px] font-black text-white shadow-lg hover:bg-rose-700">DELETE</button>
        </div>
      </div>
    ))
  }, [executeDeleteGuide])

  const handleRoleChange = useCallback(async (id, newRole) => {
    try {
      await edit_user(id, { role: newRole })
      setData((prev) => ({ ...prev, users: prev.users.map((u) => (u._id || u.id) === id ? { ...u, role: newRole } : u) }))
      toast.success("Role updated")
    } catch { toast.error("Update failed") }
  }, [])

  const handleGenerateGuide = async (isCustom = false) => {
    if (isCustom && !customPrompt.trim()) return toast.error("Please enter a custom focus")
    
    setGeneratingGuide(true)
    try {
      const result = await generate_guide(isCustom ? customPrompt : "")
      setData(prev => ({ ...prev, guides: [result, ...(prev.guides || [])] }))
      toast.success(isCustom ? "Custom guide generated!" : "Official guide generated!")
      if (isCustom) setCustomPrompt("")
    } catch (error) {
      toast.error(error.message || "Failed to generate guide")
    } finally {
      setGeneratingGuide(false)
    }
  }

  const handleAddIng = useCallback(async (e) => {
    e.preventDefault()
    if (!newIng.name || !newIng.category) return toast.error("Incomplete data")
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
  const onGuideSearch = useCallback((val) => startTransition(() => setGuideSearch(val)), [])

  const filteredIngs = useMemo(() => (data.ingredients || []).filter((i) => i.name.toLowerCase().includes(ingSearch.toLowerCase())).slice(0, 40), [data.ingredients, ingSearch])
  const filteredUsers = useMemo(() => (data.users || []).filter((u) => u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())).slice(0, 40), [data.users, userSearch])
  const filteredGuides = useMemo(() => (data.guides || []).filter((g) => g.title?.toLowerCase().includes(guideSearch.toLowerCase())).slice(0, 40), [data.guides, guideSearch])

  const isAdmin = currentUser && (currentUser.role >= 2 || currentUser.isAdmin)
  if (data.loading) return <div className="flex min-h-screen items-center justify-center font-serif text-lg font-black text-amber-200 animate-pulse">Loading Admin Dashboard...</div>
  if (!isAdmin) return <div className="flex min-h-screen items-center justify-center p-10 font-serif text-3xl font-black text-amber-500 uppercase tracking-tighter">Unauthorized Access</div>

  return (
    <div className="mx-auto max-w-7xl space-y-12 p-6 pb-24 md:p-10">
      <div className="flex items-end justify-between border-b border-white/5 pb-8">
        <div>
          <p className="mb-1 inline-flex rounded border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[8px] font-black tracking-[0.3em] text-amber-200 uppercase">Admin</p>
          <h1 className="font-serif text-5xl font-black tracking-tight text-white">Dashboard</h1>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-black tracking-widest text-white/20 uppercase">Last Sync</p>
          <p className="text-xs font-bold text-white/60">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      <StatsSection stats={stats} />
      
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Guide Management */}
        <div className="flex flex-col rounded-3xl border border-amber-400/20 bg-amber-400/5 p-10 shadow-2xl lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="text-left space-y-4">
              <h2 className="font-serif text-3xl font-black text-white">Auto-Generate</h2>
              <p className="text-amber-100/60 text-sm">Let the AI Chef choose a random high-quality culinary topic to publish.</p>
              <button
                onClick={() => handleGenerateGuide(false)}
                disabled={generatingGuide}
                className="w-full rounded-2xl bg-amber-400 px-8 py-4 text-xs font-black tracking-widest text-black uppercase transition-all hover:bg-amber-300 active:scale-95 disabled:opacity-50"
              >
                {generatingGuide ? "Processing..." : "Quick Generate"}
              </button>
            </div>
            
            <div className="text-left space-y-4 border-l border-white/10 md:pl-10">
              <h2 className="font-serif text-3xl font-black text-white">Custom Focus</h2>
              <p className="text-amber-100/60 text-sm">Direct the AI to write about a specific technique or ingredient.</p>
              <div className="space-y-3">
                <input 
                  type="text" 
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Molecular Gastronomy or Sushi Rolling..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-white outline-none focus:border-amber-400/30 transition-all"
                />
                <button
                  onClick={() => handleGenerateGuide(true)}
                  disabled={generatingGuide || !customPrompt.trim()}
                  className="w-full rounded-2xl border border-amber-400/20 bg-amber-400/10 px-8 py-4 text-xs font-black tracking-widest text-amber-200 uppercase transition-all hover:bg-amber-400/20 active:scale-95 disabled:opacity-20"
                >
                  {generatingGuide ? "Drafting..." : "Generate with focus"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Reports */}
        <div className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0f141d] shadow-2xl">
          <div className="border-b border-amber-500/10 bg-amber-500/[0.03] p-6 flex justify-between items-center">
            <h2 className="font-serif text-xl font-black text-white">User Reports</h2>
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-[9px] font-black tracking-widest text-amber-300 uppercase">{recipeReports.length + commentReports.length + guideReports.length + guideCommentReports.length} ALERTS</span>
            </div>
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#0f141d] text-[9px] font-black uppercase tracking-widest text-white/30 border-b border-white/5">
              <tr><th className="px-6 py-4">Content</th><th className="px-6 py-4">Reason</th><th className="px-6 py-4 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[...recipeReports, ...commentReports, ...guideReports, ...guideCommentReports].map((rep) => (
                <ReportRow 
                  key={rep._id} 
                  r={rep} 
                  onDeleteRecipe={handleDeleteRecipe} 
                  onDeleteComment={handleDeleteComment}
                  onDeleteGuide={handleDeleteGuide}
                  onDeleteGuideComment={handleDeleteGuideComment}
                  onDismissReport={handleDismissReport} 
                />
              ))}
            </tbody>
            </table>
            {(recipeReports.length + commentReports.length + guideReports.length + guideCommentReports.length) === 0 && <div className="p-16 text-center text-[10px] font-black tracking-widest text-white/10 uppercase">No active reports.</div>}
            </div>        </div>

        {/* Ingredient Inventory */}
        <div className="flex h-[500px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0f141d] shadow-2xl">
          <div className="space-y-6 border-b border-white/5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-black text-white">Ingredient Inventory</h2>
              <span className="text-[10px] font-black tracking-widest text-white/20 uppercase">{data.ingredients.length} ITEMS</span>
            </div>
            <form onSubmit={handleAddIng} className="grid grid-cols-5 gap-3 rounded-2xl bg-white/[0.03] p-4 border border-white/5">
              <input type="text" value={newIng.name} onChange={(e) => setNewIng({ ...newIng, name: e.target.value })} placeholder="Item Name" className="col-span-2 rounded-xl border border-white/10 bg-black/20 p-2.5 text-[11px] font-medium text-white outline-none focus:border-amber-400/30" required />
              <select value={newIng.category} onChange={(e) => setNewIng({ ...newIng, category: e.target.value })} className="col-span-2 rounded-xl border border-white/10 bg-black/20 p-2.5 text-[11px] font-black text-amber-200 outline-none focus:border-amber-400/30" required>
                <option value="">CATEGORY</option>
                {["Vegetables", "Fruits", "Meat", "Dairy", "Spices", "Grains", "Other"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button disabled={isAdding} className="rounded-xl bg-amber-400/10 text-amber-200 text-[10px] font-black border border-amber-400/20 hover:bg-amber-400/20 active:scale-95 transition-all">{isAdding ? "..." : "ADD"}</button>
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

        {/* Official Guides */}
        <div className="flex h-[500px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0f141d] shadow-2xl lg:col-span-2">
          <div className="space-y-6 border-b border-white/5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-black text-white">Official Guides</h2>
              <span className="text-[10px] font-black tracking-widest text-white/20 uppercase">{data.guides.length} GUIDES</span>
            </div>
            <div className="max-w-md">
              <SearchBar placeholder="Search Guides..." onSearchChange={onGuideSearch} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-[#0f141d] text-[9px] font-black uppercase tracking-widest text-white/30 border-b border-white/5">
                <tr><th className="px-6 py-4">Title</th><th className="px-6 py-4">Date</th><th className="px-6 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredGuides.map((g) => <GuideRow key={g._id} g={g} onDelete={handleDeleteGuide} currentUser={currentUser} />)}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Registry */}
        <div className="flex h-[600px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0f141d] shadow-2xl lg:col-span-2">
          <div className="space-y-6 border-b border-white/5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-black text-white">User Registry</h2>
              <span className="text-[10px] font-black tracking-widest text-white/20 uppercase">{data.users.length} RECORDS</span>
            </div>
            <div className="max-w-md">
              <SearchBar placeholder="Search Users..." onSearchChange={onUserSearch} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-[#0f141d] text-[9px] font-black uppercase tracking-widest text-white/30 border-b border-white/5">
                <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Role</th><th className="px-6 py-4 text-right">Actions</th></tr>
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
