import React, { useState } from 'react';
import toast from 'react-hot-toast';

const ShareButton = ({ recipeId, className = "" }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = async (e) => {
    // Prevent navigation if the button is inside a Link or has other click handlers
    e.preventDefault();
    e.stopPropagation();

    const recipeUrl = `${window.location.origin}/recipe/${recipeId}`;

    try {
      await navigator.clipboard.writeText(recipeUrl);
      
      setIsCopied(true);
      toast.success("Link copied to clipboard! 📋");

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);

    } catch (err) {
      console.error("Failed to copy link: ", err);
      toast.error("Failed to copy link. Please try manually.");
    }
  };

  return (
    <button
      onClick={handleCopyLink}
      title="Copy recipe link"
      className={`flex items-center gap-2 rounded-xl transition-all ${
        isCopied 
          ? "border border-amber-200 bg-amber-100/70 text-cb-primary" 
          : "border border-cb-border bg-white/80 text-cb-text hover:bg-amber-50"
      } ${className}`}
    >
      <span>{isCopied ? "✓" : "🔗"}</span>
      <span className="hidden sm:inline">{isCopied ? "Copied!" : "Share Link"}</span>
    </button>
  );
};

export default ShareButton;
