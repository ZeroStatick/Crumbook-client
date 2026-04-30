import React, { useState } from "react"
import toast from "react-hot-toast"

const ShareButton = ({ recipeId, className = "" }) => {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyLink = async (e) => {
    // Prevent navigation if the button is inside a Link or has other click handlers
    e.preventDefault()
    e.stopPropagation()

    const recipeUrl = `${window.location.origin}/recipe/${recipeId}`

    try {
      await navigator.clipboard.writeText(recipeUrl)

      setIsCopied(true)
      toast.success("Link copied to clipboard! 📋")

      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (err) {
      console.error("Failed to copy link: ", err)
      toast.error("Failed to copy link. Please try manually.")
    }
  }

  return (
    <button
      onClick={handleCopyLink}
      title="Copy recipe link"
      className={`premium-serif flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 font-semibold tracking-[0.02em] transition-all ${isCopied ? "text-emerald-300" : "text-amber-100/80 hover:border-white/20 hover:text-white"} ${className}`}
    >
      <span>{isCopied ? "✓" : "🔗"}</span>
      <span className="hidden sm:inline">{isCopied ? "Copied!" : "Share"}</span>
    </button>
  )
}

export default ShareButton
