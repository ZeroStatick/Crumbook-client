import React, { memo } from "react"
import { Link } from "react-router-dom"

const ReportRow = memo(({ r, onDeleteRecipe, onDeleteComment, onDeleteGuide, onDeleteGuideComment, onDismissReport }) => {
  const isRecipe = r.target_type === "recipe"
  const isComment = r.target_type === "comment"
  const isGuide = r.target_type === "guide"
  const isGuideComment = r.target_type === "guide_comment"

  let title = "Unknown Content"
  let link = "#"

  if (isRecipe && r.recipe_id) {
    title = r.recipe_id.title
    link = `/recipe/${r.recipe_id._id || r.recipe_id.id}`
  } else if (isGuide && r.guide_id) {
    title = r.guide_id.title
    link = `/guide/${r.guide_id._id || r.guide_id.id}`
  } else if (isGuideComment && r.guide_comment_id?.guideId) {
    title = r.guide_comment_id.guideId.title
    link = `/guide/${r.guide_comment_id.guideId._id || r.guide_comment_id.guideId.id}`
  } else if (isComment && r.comment_id?.commented_recipe) {
    title = r.comment_id.commented_recipe.title
    link = `/recipe/${r.comment_id.commented_recipe._id || r.comment_id.commented_recipe.id}`
  }
  
  return (
    <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${isRecipe ? 'text-amber-200' : (isGuide || isGuideComment) ? 'text-emerald-400' : 'text-blue-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 01-2 2zm9-13.5V9" />
            </svg>
            <Link to={link} className="font-serif text-sm font-black text-amber-200 hover:text-white transition-colors">
              {title}
            </Link>
          </div>
          {(isComment && r.comment_id) && (
            <div className="rounded-xl border border-white/5 bg-white/5 p-3 text-[11px] italic leading-relaxed text-white/50">
              "{r.comment_id.text || "Comment trace lost"}"
              <div className="mt-1 text-[9px] font-bold not-italic tracking-wider text-white/20">— {r.comment_id.comment_author?.name || "User"}</div>
            </div>
          )}
          {(isGuideComment && r.guide_comment_id) && (
            <div className="rounded-xl border border-white/5 bg-white/5 p-3 text-[11px] italic leading-relaxed text-white/50">
              "{r.guide_comment_id.text || "Comment trace lost"}"
              <div className="mt-1 text-[9px] font-bold not-italic tracking-wider text-white/20">— {r.guide_comment_id.comment_author?.name || "User"}</div>
            </div>
          )}
          <div className="text-[9px] font-black uppercase tracking-widest text-white/20">Reporter: {r.user_id?.name || "Anonymous"}</div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1.5">
          <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[9px] font-black tracking-widest text-amber-400 uppercase">
            {r.sort?.replace("_", " ") || "REPORT"}
          </span>
          <div className="max-w-[180px] truncate text-[10px] italic text-white/40" title={r.reason}>
            "{r.reason || "No reason provided"}"
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end gap-2">
          {isRecipe && r.recipe_id && (
            <button onClick={() => onDeleteRecipe(r.recipe_id._id || r.recipe_id.id, r._id)} className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[9px] font-black text-amber-400 hover:bg-amber-500/20">DELETE</button>
          )}
          {isComment && r.comment_id && (
            <button onClick={() => onDeleteComment(r.comment_id._id || r.comment_id.id, r._id)} className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[9px] font-black text-amber-400 hover:bg-amber-500/20">DELETE</button>
          )}
          {isGuideComment && r.guide_comment_id && (
            <button onClick={() => onDeleteGuideComment(r.guide_comment_id.guideId?._id || r.guide_comment_id.guideId, r.guide_comment_id._id || r.guide_comment_id.id, r._id)} className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[9px] font-black text-amber-400 hover:bg-amber-500/20">DELETE</button>
          )}
          {isGuide && r.guide_id && (
            <button onClick={() => onDeleteGuide(r.guide_id._id || r.guide_id.id, r._id)} className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[9px] font-black text-amber-400 hover:bg-amber-500/20">DELETE</button>
          )}
          <button onClick={() => onDismissReport(r._id)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-black text-white/40 hover:text-white transition-all">DISMISS</button>
        </div>
      </td>
    </tr>
  )
})

export default ReportRow
