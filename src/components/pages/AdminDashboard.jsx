import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  useTransition,
} from "react"
import {
  get_all_users,
  delete_user,
  edit_user,
} from "../../../API/api.api"
import { get_all_recipes } from "../../../API/recipe.api"
import {
  get_all_ingredients,
  add_ingredient,
} from "../../../API/ingredient.api"
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
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
        🔍
      </span>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-200 p-2 pl-10 transition-shadow outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
})

const StatsSection = memo(({ stats }) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
    {[
      {
        label: "Total Users",
        val: stats.totalUsers,
        color: "text-blue-600",
        em: "👥",
      },
      {
        label: "Total Recipes",
        val: stats.totalRecipes,
        color: "text-green-600",
        em: "🍳",
      },
      {
        label: "Admins",
        val: stats.adminsCount,
        color: "text-purple-600",
        em: "🛡️",
      },
      {
        label: "Avg Recipes/User",
        val: stats.averageRecipesPerUser,
        color: "text-orange-600",
        em: "📊",
      },
    ].map((s, i) => (
      <div
        key={i}
        className="flex flex-col items-center rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <span className="mb-2 text-4xl">{s.em}</span>
        <span className="text-sm font-medium tracking-wider text-gray-500 uppercase">
          {s.label}
        </span>
        <span className={`text-3xl font-bold ${s.color}`}>{s.val}</span>
      </div>
    ))}
  </div>
))

const IngredientRow = memo(({ ing }) => (
  <tr className="transition-colors hover:bg-gray-50">
    <td className="px-6 py-3 font-medium text-gray-800">{ing.name}</td>
    <td className="px-6 py-3">
      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
        {ing.category}
      </span>
    </td>
    <td className="px-6 py-3 text-sm text-gray-500">{ing.unit || "-"}</td>
  </tr>
))

const UserRow = memo(({ u, onDelete, onRoleChange, currentUser }) => {
  const isOwner = currentUser?.role === 3
  const isAdmin = currentUser?.role === 2
  const targetIsOwner = u.role === 3
  const targetIsAdmin = u.role === 2
  const isSelf = currentUser?._id === u._id || currentUser?.id === u._id

  // Logic for who can edit whom
  const canEditRole = !isSelf && isOwner
  const canDelete =
    !isSelf && (isOwner || (isAdmin && !targetIsAdmin && !targetIsOwner))

  return (
    <tr className="transition-colors hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-800">{u.name}</div>
        <div className="max-w-[150px] truncate text-[10px] text-gray-500">
          {u.email}
        </div>
      </td>
      <td className="px-6 py-4">
        {canEditRole ? (
          <select
            value={u.role}
            onChange={(e) =>
              onRoleChange(u._id || u.id, parseInt(e.target.value))
            }
            className="rounded border bg-white p-1 text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={1}>USER</option>
            <option value={2}>ADMIN</option>
            {isOwner && <option value={3}>OWNER</option>}
          </select>
        ) : (
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
              u.role >= 2
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
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

const AdminDashboard = () => {
  const { user: currentUser } = useUserStore()
  const [data, setData] = useState({
    users: [],
    ingredients: [],
    recipes: [],
    loading: true,
  })
  const [newIng, setNewIng] = useState({ name: "", category: "", unit: "" })
  const [isAdding, setIsAdding] = useState(false)

  const [isPending, startTransition] = useTransition()
  const [ingSearch, setIngSearch] = useState("")
  const [userSearch, setUserSearch] = useState("")

  const stats = useMemo(() => {
    const admins = data.users.filter((u) => u.role >= 2).length
    const avg =
      data.users.length > 0
        ? (data.recipes.length / data.users.length).toFixed(1)
        : 0
    return {
      totalUsers: data.users.length,
      totalRecipes: data.recipes.length,
      adminsCount: admins,
      averageRecipesPerUser: avg,
    }
  }, [data.users, data.recipes])

  useEffect(() => {
    const load = async () => {
      try {
        const [u, r, i] = await Promise.all([
          get_all_users(),
          get_all_recipes(),
          get_all_ingredients(),
        ])
        setData({
          users: u || [],
          recipes: r || [],
          ingredients: i || [],
          loading: false,
        })
      } catch (err) {
        toast.error("Failed to load dashboard data")
        setData((prev) => ({ ...prev, loading: false }))
      }
    }
    load()
  }, [])

  const handleDeleteUser = useCallback(async (id) => {
    if (!window.confirm("Delete user?")) return
    try {
      await delete_user(id)
      setData((prev) => ({
        ...prev,
        users: prev.users.filter((u) => (u._id || u.id) !== id),
      }))
      toast.success("User deleted")
    } catch (err) {
      toast.error("Delete failed")
    }
  }, [])

  const handleRoleChange = useCallback(async (id, newRole) => {
    try {
      await edit_user(id, { role: newRole })
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          (u._id || u.id) === id ? { ...u, role: newRole } : u,
        ),
      }))
      toast.success("Role updated successfully")
    } catch (err) {
      toast.error(err.message || "Failed to update role")
    }
  }, [])

  const handleAddIng = useCallback(
    async (e) => {
      e.preventDefault()
      if (!newIng.name || !newIng.category)
        return toast.error("Fill required fields")
      setIsAdding(true)
      try {
        const res = await add_ingredient(newIng)
        setData((prev) => ({
          ...prev,
          ingredients: [...prev.ingredients, res],
        }))
        setNewIng({ name: "", category: "", unit: "" })
        toast.success("Ingredient added")
      } catch (err) {
        toast.error("Add failed")
      } finally {
        setIsAdding(false)
      }
    },
    [newIng],
  )

  // Wrap search updates in transitions for high responsiveness
  const onIngSearch = useCallback(
    (val) => startTransition(() => setIngSearch(val)),
    [],
  )
  const onUserSearch = useCallback(
    (val) => startTransition(() => setUserSearch(val)),
    [],
  )

  // Limit rendering to first 40 items to prevent DOM bloat, search will find the rest
  const filteredIngs = useMemo(
    () =>
      data.ingredients
        .filter((i) => i.name.toLowerCase().includes(ingSearch.toLowerCase()))
        .slice(0, 40),
    [data.ingredients, ingSearch],
  )

  const filteredUsers = useMemo(
    () =>
      data.users
        .filter(
          (u) =>
            u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email?.toLowerCase().includes(userSearch.toLowerCase()),
        )
        .slice(0, 40),
    [data.users, userSearch],
  )

  const isAdmin = currentUser && (currentUser.role >= 2 || currentUser.isAdmin)

  if (data.loading)
    return (
      <div className="flex min-h-screen animate-pulse items-center justify-center font-semibold text-gray-600">
        Loading...
      </div>
    )
  if (!isAdmin && !localStorage.getItem("token"))
    return (
      <div className="p-10 text-center font-bold text-red-600">
        Access Denied
      </div>
    )

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

      <StatsSection stats={stats} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Ingredients */}
        <div className="flex h-[600px] flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="space-y-4 border-b border-gray-100 p-5">
            <h2 className="flex items-center justify-between font-bold text-gray-800">
              Ingredients
              <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                Total: {data.ingredients.length}
              </span>
            </h2>
            <form
              onSubmit={handleAddIng}
              className="grid grid-cols-5 gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3"
            >
              <input
                type="text"
                value={newIng.name}
                onChange={(e) =>
                  setNewIng((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Name"
                className="col-span-2 rounded border border-gray-200 p-1.5 text-xs outline-none"
                required
              />
              <select
                value={newIng.category}
                onChange={(e) =>
                  setNewIng((p) => ({ ...p, category: e.target.value }))
                }
                className="col-span-2 rounded border border-gray-200 bg-white p-1.5 text-xs outline-none"
                required
              >
                <option value="">Category</option>
                {[
                  "Vegetables",
                  "Fruits",
                  "Meat",
                  "Dairy",
                  "Spices",
                  "Grains",
                  "Other",
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                disabled={isAdding}
                className="rounded bg-blue-600 text-[10px] font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isAdding ? "..." : "Add"}
              </button>
            </form>
            <SearchBar
              placeholder="Filter list..."
              onSearchChange={onIngSearch}
            />
          </div>
          <div
            className={`flex-1 overflow-y-auto transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
          >
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white text-[10px] font-bold text-gray-400 uppercase shadow-sm">
                <tr>
                  <th className="px-6 py-2">Name</th>
                  <th className="px-6 py-2">Category</th>
                  <th className="px-6 py-2 text-right">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredIngs.map((i) => (
                  <IngredientRow key={i._id || i.id} ing={i} />
                ))}
              </tbody>
            </table>
            {filteredIngs.length === 0 && (
              <div className="p-10 text-center text-xs text-gray-400 italic">
                No matches found
              </div>
            )}
          </div>
        </div>

        {/* Users */}
        <div className="flex h-[600px] flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="space-y-4 border-b border-gray-100 p-5">
            <h2 className="flex items-center justify-between font-bold text-gray-800">
              Users
              <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                Active: {data.users.length}
              </span>
            </h2>
            <div className="h-[46px]" />{" "}
            {/* Spacer to match ingredient column height */}
            <SearchBar
              placeholder="Search by name or email..."
              onSearchChange={onUserSearch}
            />
          </div>
          <div
            className={`flex-1 overflow-y-auto transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
          >
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white text-[10px] font-bold text-gray-400 uppercase shadow-sm">
                <tr>
                  <th className="px-6 py-2">Details</th>
                  <th className="px-6 py-2">Role</th>
                  <th className="px-6 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((u) => (
                  <UserRow
                    key={u._id || u.id}
                    u={u}
                    onDelete={handleDeleteUser}
                    onRoleChange={handleRoleChange}
                    currentUser={currentUser}
                  />
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="p-10 text-center text-xs text-gray-400 italic">
                No matches found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
