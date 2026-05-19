import React, { memo } from "react"

const StatsSection = memo(({ stats }) => (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
    {[
      { label: "Total Users", val: stats.totalUsers, accent: "border-blue-500/30" },
      { label: "Shared Recipes", val: stats.totalRecipes, accent: "border-amber-500/30" },
      { label: "Official Guides", val: stats.guidesCount, accent: "border-emerald-500/30" },
      { label: "Admins", val: stats.adminsCount, accent: "border-purple-500/30" },
      { label: "Recipes Per User", val: `${stats.averageRecipesPerUser} r/u`, accent: "border-indigo-500/30" },
      { label: "Reports", val: `${stats.reportsCount}`, accent: `border-amber-500/30 ${stats.reportsCount > 0 ? "animate-pulse" : ""}` },
    ].map((s, i) => (
      <div key={i} className={`flex flex-col rounded-2xl border-l-4 bg-[#0f141d] p-5 shadow-xl ${s.accent}`}>
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">{s.label}</span>
        <span className="mt-1 font-serif text-3xl font-black text-white">{s.val}</span>
      </div>
    ))}
  </div>
))

export default StatsSection
