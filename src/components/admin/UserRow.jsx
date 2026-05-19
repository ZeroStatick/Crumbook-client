import React, { memo } from "react"

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

export default UserRow
