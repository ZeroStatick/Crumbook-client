import React from "react"

/**
 * Reusable Avatar component that displays the user's profile picture 
 * or their initials if no picture is available.
 * 
 * @param {string} src - The URL of the profile picture
 * @param {string} name - The user's name to derive initials from
 * @param {string} size - CSS class for size (e.g., "h-10 w-10")
 * @param {string} fontSize - CSS class for font size of initials (e.g., "text-xl")
 * @param {string} className - Additional CSS classes
 */
const Avatar = ({ src, name, size = "h-10 w-10", fontSize = "text-xl", className = "" }) => {
  const getInitials = (userName) => {
    if (!userName) return "C"
    const parts = userName.trim().split(/\s+/)
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }

  const initials = getInitials(name)

  if (src) {
    return (
      <div className={`${size} overflow-hidden rounded-full border border-white/10 bg-[#111821] ${className}`}>
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className={`${size} flex items-center justify-center rounded-full border border-white/10 bg-[#0a0f16] font-serif font-black text-amber-200 ${fontSize} ${className}`}>
      {initials}
    </div>
  )
}

export default Avatar
