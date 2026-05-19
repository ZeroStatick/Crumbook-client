import React, { useState, useEffect, memo } from "react"

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

export default SearchBar
