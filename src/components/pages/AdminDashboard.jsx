import React, { useState, useEffect, useMemo, useCallback, memo, useTransition } from "react"
import { get_all_users, delete_user } from "../../../API/api.api"
import { get_all_recipes } from "../../../API/recipe.api"
import { get_all_ingredients, add_ingredient } from "../../../API/ingredient.api"
import toast from "react-hot-toast"
import useUserStore from "../../global/user"

// --- Isolated Search Input Component ---
const SearchBar = memo(({ placeholder, onSearchChange }) => {
  const [localValue, setLocalValue] = useState("")

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localValue)
    }, 250) // Faster debounce for better feel
    return () => clearTimeout(handler)
  }, [localValue, onSearchChange])

  return (
    <div className="relative">
      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">🔍</span>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
      />
    </div>
  )
})

const StatsSection = memo(({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {[
      { label: "Total Users", val: stats.totalUsers, color: "text-blue-600", em: "👥" },
      { label: "Total Recipes", val: stats.totalRecipes, color: "text-green-600", em: "🍳" },
      { label: "Admins", val: stats.adminsCount, color: "text-purple-600", em: "🛡️" },
      { label: "Avg Recipes/User", val: stats.averageRecipesPerUser, color: "text-orange-600", em: "📊" }
    ].map((s, i) => (
      <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
        <span className="text-4xl mb-2">{s.em}</span>
        <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">{s.label}</span>
        <span className={`text-3xl font-bold ${s.color}`}>{s.val}</span>
      </div>
    ))}
  </div>
))

const IngredientRow = memo(({ ing }) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="px-6 py-3 font-medium text-gray-800">{ing.name}</td>
    <td className="px-6 py-3">
      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{ing.category}</span>
    </td>
    <td className="px-6 py-3 text-sm text-gray-500">{ing.unit || "-"}</td>
  </tr>
))

const UserRow = memo(({ u, onDelete }) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4">
      <div className="font-medium text-gray-800 text-sm">{u.name}</div>
      <div className="text-[10px] text-gray-500 truncate max-w-[150px]">{u.email}</div>
    </td>
    <td className="px-6 py-4">
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
        (u.role === "admin" || u.isAdmin) ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
      }`}>
        {(u.role === "admin" || u.isAdmin) ? "ADMIN" : "USER"}
      </span>
    </td>
    <td className="px-6 py-4 text-center">
      <button
        onClick={() => onDelete(u._id || u.id)}
        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-30"
        disabled={u.role === "admin" || u.isAdmin}
        title="Delete User"
      >
        🗑️
      </button>
    </td>
  </tr>
))

const AdminDashboard = () => {
  const { user } = useUserStore()
  const [data, setData] = useState({ users: [], ingredients: [], recipes: [], loading: true })
  const [newIng, setNewIng] = useState({ name: "", category: "", unit: "" })
  const [isAdding, setIsAdding] = useState(false)
  
  const [isPending, startTransition] = useTransition()
  const [ingSearch, setIngSearch] = useState("")
  const [userSearch, setUserSearch] = useState("")

  const stats = useMemo(() => {
    const admins = data.users.filter(u => u.role === "admin" || u.isAdmin).length
    const avg = data.users.length > 0 ? (data.recipes.length / data.users.length).toFixed(1) : 0
    return { totalUsers: data.users.length, totalRecipes: data.recipes.length, adminsCount: admins, averageRecipesPerUser: avg }
  }, [data.users, data.recipes])

  useEffect(() => {
    const load = async () => {
      try {
        const [u, r, i] = await Promise.all([get_all_users(), get_all_recipes(), get_all_ingredients()])
        setData({ users: u || [], recipes: r || [], ingredients: i || [], loading: false })
      } catch (err) {
        toast.error("Failed to load dashboard data")
        setData(prev => ({ ...prev, loading: false }))
      }
    }
    load()
  }, [])

  const handleDeleteUser = useCallback(async (id) => {
    if (!window.confirm("Delete user?")) return
    try {
      await delete_user(id)
      setData(prev => ({ ...prev, users: prev.users.filter(u => (u._id || u.id) !== id) }))
      toast.success("User deleted")
    } catch (err) {
      toast.error("Delete failed")
    }
  }, [])

  const handleAddIng = useCallback(async (e) => {
    e.preventDefault()
    if (!newIng.name || !newIng.category) return toast.error("Fill required fields")
    setIsAdding(true)
    try {
      const res = await add_ingredient(newIng)
      setData(prev => ({ ...prev, ingredients: [...prev.ingredients, res] }))
      setNewIng({ name: "", category: "", unit: "" })
      toast.success("Ingredient added")
    } catch (err) {
      toast.error("Add failed")
    } finally {
      setIsAdding(false)
    }
  }, [newIng])

  // Wrap search updates in transitions for high responsiveness
  const onIngSearch = useCallback((val) => startTransition(() => setIngSearch(val)), [])
  const onUserSearch = useCallback((val) => startTransition(() => setUserSearch(val)), [])

  // Limit rendering to first 40 items to prevent DOM bloat, search will find the rest
  const filteredIngs = useMemo(() => 
    data.ingredients
      .filter(i => i.name.toLowerCase().includes(ingSearch.toLowerCase()))
      .slice(0, 40),
    [data.ingredients, ingSearch]
  )

  const filteredUsers = useMemo(() => 
    data.users
      .filter(u => u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()))
      .slice(0, 40),
    [data.users, userSearch]
  )

  const isAdmin = user && (user.role === "admin" || user.isAdmin)

  if (data.loading) return <div className="flex min-h-screen items-center justify-center font-semibold text-gray-600 animate-pulse">Loading...</div>
  if (!isAdmin && !localStorage.getItem("token")) return <div className="p-10 text-center text-red-600 font-bold">Access Denied</div>

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

      <StatsSection stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ingredients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px] overflow-hidden">
          <div className="p-5 border-b border-gray-100 space-y-4">
            <h2 className="font-bold text-gray-800 flex justify-between items-center">
              Ingredients
              <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">Total: {data.ingredients.length}</span>
            </h2>
            <form onSubmit={handleAddIng} className="grid grid-cols-5 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <input type="text" value={newIng.name} onChange={e => setNewIng(p => ({...p, name: e.target.value}))} placeholder="Name" className="col-span-2 p-1.5 text-xs border border-gray-200 rounded outline-none" required />
              <select value={newIng.category} onChange={e => setNewIng(p => ({...p, category: e.target.value}))} className="col-span-2 p-1.5 text-xs border border-gray-200 rounded outline-none bg-white" required>
                <option value="">Category</option>
                {["Vegetables", "Fruits", "Meat", "Dairy", "Spices", "Grains", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button disabled={isAdding} className="bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-[10px] font-bold">
                {isAdding ? "..." : "Add"}
              </button>
            </form>
            <SearchBar placeholder="Filter list..." onSearchChange={onIngSearch} />
          </div>
          <div className={`flex-1 overflow-y-auto transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white shadow-sm text-[10px] uppercase text-gray-400 font-bold">
                <tr><th className="px-6 py-2">Name</th><th className="px-6 py-2">Category</th><th className="px-6 py-2 text-right">Unit</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredIngs.map(i => <IngredientRow key={i._id || i.id} ing={i} />)}
              </tbody>
            </table>
            {filteredIngs.length === 0 && <div className="p-10 text-center text-xs text-gray-400 italic">No matches found</div>}
          </div>
        </div>

        {/* Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px] overflow-hidden">
          <div className="p-5 border-b border-gray-100 space-y-4">
            <h2 className="font-bold text-gray-800 flex justify-between items-center">
              Users
              <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">Active: {data.users.length}</span>
            </h2>
            <div className="h-[46px]" /> {/* Spacer to match ingredient column height */}
            <SearchBar placeholder="Search by name or email..." onSearchChange={onUserSearch} />
          </div>
          <div className={`flex-1 overflow-y-auto transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white shadow-sm text-[10px] uppercase text-gray-400 font-bold">
                <tr><th className="px-6 py-2">Details</th><th className="px-6 py-2">Role</th><th className="px-6 py-2 text-center">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map(u => <UserRow key={u._id || u.id} u={u} onDelete={handleDeleteUser} />)}
              </tbody>
            </table>
            {filteredUsers.length === 0 && <div className="p-10 text-center text-xs text-gray-400 italic">No matches found</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
