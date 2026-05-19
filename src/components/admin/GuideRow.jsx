import React, { memo } from "react"
import { Link } from "react-router-dom"

const GuideRow = memo(({ g, onDelete, currentUser }) => {
  const isAuthor = (g.authorId?._id || g.authorId) === (currentUser?._id || currentUser?.id)
  const isAdmin = currentUser?.role >= 2
  const canDelete = isAdmin || isAuthor

  return (
    <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
      <td className="px-6 py-4">
        <Link to={`/guide/${g._id || g.id}`} className="font-serif text-sm font-black text-white hover:text-amber-200 transition-colors">{g.title}</Link>
        <div className="text-[10px] font-medium text-white/30">Author: {g.author}</div>
      </td>
      <td className="px-6 py-4">
        <span className="rounded-lg border border-white/5 bg-white/5 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-white/40">
          {new Date(g.createdAt).toLocaleDateString()}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={() => onDelete(g._id || g.id)}
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

export default GuideRow
