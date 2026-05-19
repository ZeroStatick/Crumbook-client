import React, { memo } from "react"

const IngredientRow = memo(({ ing }) => (
  <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
    <td className="px-6 py-4 font-serif text-sm font-black text-white">{ing.name}</td>
    <td className="px-6 py-4">
      <span className="rounded-lg border border-white/5 bg-white/5 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-white/40">{ing.category}</span>
    </td>
    <td className="px-6 py-4 text-[10px] font-medium tracking-widest text-amber-200/40 uppercase">{ing.unit || "N/A"}</td>
  </tr>
))

export default IngredientRow
