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
          ? "bg-green-100 text-green-700 border border-green-200" 
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      } ${className}`}
    >
      <span>{isCopied ? "✓" : "🔗"}</span>
      <span className="hidden sm:inline">{isCopied ? "Copied!" : "Share Link"}</span>
    </button>
  );
};

export default ShareButton;
