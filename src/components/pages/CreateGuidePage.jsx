import React, { useState, useEffect, useRef } from "react"
import { useNavigate, Link, useParams } from "react-router-dom"
import { create_guide, get_guide_by_id, update_guide } from "../../../API/guide.api"
import toast from "react-hot-toast"

const CreateGuidePage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef(null)

  const [formData, setFormData] = useState({
    title: "",
    thumbnailUrl: "",
    tags: "",
    instructions: "",
  })

  const [ingredients, setIngredients] = useState([""])
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewMode, setPreviewMode] = useState(false)

  // Manage object URL lifecycle for image preview
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(imageFile)
    setPreviewUrl(objectUrl)

    // Clean up to prevent memory leaks
    return () => URL.revokeObjectURL(objectUrl)
  }, [imageFile])

  const insertTag = (tag) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formData.instructions
    const before = text.substring(0, start)
    const after = text.substring(end, text.length)
    const selection = text.substring(start, end)

    const newText = `${before}<${tag}>${selection}</${tag}>${after}`
    setFormData(prev => ({ ...prev, instructions: newText }))
    
    // Calculate new selection range: 
    // Start after <tag>, end after the selection content
    const openingTagLength = tag.length + 2
    const newStart = start + openingTagLength
    const newEnd = newStart + selection.length

    setTimeout(() => {
      if (textarea) {
        textarea.focus()
        textarea.setSelectionRange(newStart, newEnd)
      }
    }, 50)
  }

  useEffect(() => {
    if (isEditMode) {
      const fetchGuide = async () => {
        try {
          const { guide } = await get_guide_by_id(id)
          setFormData({
            title: guide.title || "",
            thumbnailUrl: guide.thumbnailUrl || "",
            tags: guide.tags?.join(", ") || "",
            instructions: guide.instructions || "",
          })
          setIngredients(guide.ingredients?.length > 0 ? guide.ingredients : [""])
        } catch (err) {
          toast.error("Failed to fetch guide details")
          navigate("/guides")
        }
      }
      fetchGuide()
    }
  }, [id, isEditMode, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const addIngredient = () => {
    setIngredients([...ingredients, ""])
  }

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients]
    newIngredients[index] = value
    setIngredients(newIngredients)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.title || !formData.instructions) {
        throw new Error("Title and instructions are required")
      }

      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== "")

      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("instructions", formData.instructions)
      formDataToSend.append("thumbnailUrl", formData.thumbnailUrl)
      formDataToSend.append("ingredients", JSON.stringify(ingredients.filter((ing) => ing.trim() !== "")))
      formDataToSend.append("tags", JSON.stringify(tagsArray))
      
      if (imageFile) {
        formDataToSend.append("image", imageFile)
      }

      if (isEditMode) {
        await update_guide(id, formDataToSend)
        toast.success("Guide updated successfully!")
      } else {
        await create_guide(formDataToSend)
        toast.success("Guide published successfully!")
      }
      navigate("/guides")
    } catch (err) {
      toast.error(err.message || `Failed to ${isEditMode ? "update" : "publish"} guide`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-4 pb-24 md:p-8 lg:px-8">
      <div className="mb-10 overflow-hidden rounded-4xl border border-white/10 bg-[#0f141d] p-10 shadow-2xl">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="font-serif text-4xl font-black tracking-tight text-white">
            {isEditMode ? "Edit Guide" : "Write a Guide"}
          </h1>
          <Link
            to="/guides"
            className="flex items-center gap-2 text-xs font-black tracking-widest text-white/40 uppercase transition-colors hover:text-white"
          >
            ✕ Cancel
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Section: Basic Identity */}
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="ml-1 text-xs font-black tracking-widest text-white/50 uppercase">
                Guide Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white outline-none transition-all placeholder:text-white/20 focus:border-amber-400/30"
                placeholder="e.g., Mastering the Sourdough Starter"
                required
              />
            </div>

            <div className="space-y-4">
              <label className="ml-1 text-xs font-black tracking-widest text-white/50 uppercase">
                Guide Image
              </label>
              <div className="group relative flex min-h-[200px] flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-white/10 bg-white/5 p-6 transition-all hover:border-amber-400/20 hover:bg-white/10">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                {!imageFile && !formData.thumbnailUrl ? (
                  <div className="text-center">
                    <div className="mb-3 text-4xl opacity-20">🖼️</div>
                    <p className="text-sm font-bold text-white/40">Drop an image here or click to upload</p>
                  </div>
                ) : (
                  <div className="w-full">
                    <img
                      src={previewUrl || formData.thumbnailUrl || null}
                      alt="Preview"
                      className="mx-auto h-48 w-full rounded-2xl object-cover shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                    <p className="mt-4 text-center text-[10px] font-black tracking-widest text-amber-200 uppercase">Change Photo</p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <label className="ml-1 text-[10px] font-black tracking-widest text-white/40 uppercase">
                  Or use a URL
                </label>
                <input
                  type="text"
                  name="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs text-white outline-none transition-all placeholder:text-white/20 focus:border-amber-400/30"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="ml-1 text-xs font-black tracking-widest text-white/50 uppercase">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white outline-none transition-all placeholder:text-white/20 focus:border-amber-400/30"
                placeholder="Baking, Science, Tips (comma separated)"
              />
            </div>
          </div>

          {/* Section: Requirements/Ingredients */}
          <div className="border-t border-white/5 pt-12">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-serif text-3xl font-black text-white">Requirements</h2>
              <button
                type="button"
                onClick={addIngredient}
                className="rounded-full border border-amber-400/20 bg-amber-400/10 px-6 py-2 text-[10px] font-black tracking-widest text-amber-200 uppercase transition-all hover:bg-amber-400/20"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-4">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={ing}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    placeholder="e.g., A clean glass jar"
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm text-white outline-none focus:border-amber-400/30"
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 transition-all hover:bg-rose-500/10"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section: Content */}
          <div className="border-t border-white/5 pt-12">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-serif text-3xl font-black text-white">Guide Content</h2>
              <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setPreviewMode(false)}
                  className={`rounded-full px-4 py-1.5 text-[10px] font-black tracking-widest uppercase transition-all ${
                    !previewMode
                      ? "bg-amber-400/20 text-amber-200"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode(true)}
                  className={`rounded-full px-4 py-1.5 text-[10px] font-black tracking-widest uppercase transition-all ${
                    previewMode
                      ? "bg-amber-400/20 text-amber-200"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {!previewMode && (
                <div className="flex flex-wrap gap-2 rounded-xl border border-white/5 bg-white/2 p-2">
                  {[
                    { label: "H2", tag: "h2" },
                    { label: "H3", tag: "h3" },
                    { label: "P", tag: "p" },
                    { label: "Bold", tag: "strong" },
                    { label: "Italic", tag: "em" },
                    { label: "List Item", tag: "li" },
                  ].map((btn) => (
                    <button
                      key={btn.tag}
                      type="button"
                      onClick={() => insertTag(btn.tag)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-white/60 transition-all hover:border-amber-400/30 hover:bg-white/10 hover:text-white"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="relative min-h-[400px]">
                {!previewMode ? (
                  <textarea
                    name="instructions"
                    id="guide-instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    rows="15"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-mono text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-amber-400/30"
                    placeholder="Write your guide here. Use the helper buttons above or write HTML tags directly."
                    required
                  />
                ) : (
                  <div className="min-h-[400px] w-full rounded-2xl border border-amber-400/20 bg-amber-400/5 px-8 py-8 text-white">
                    {formData.instructions ? (
                      <div 
                        className="prose prose-invert prose-amber max-w-none"
                        dangerouslySetInnerHTML={{ __html: formData.instructions }} 
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/20">
                        Nothing to preview yet...
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="ml-1 text-[10px] font-bold text-white/30 italic">
                {!previewMode 
                  ? "Tip: Use <h2> for headers, <p> for text, <ul>/<li> for lists, and <br/> for line breaks."
                  : "This is exactly how your guide will appear to other users."
                }
              </p>
            </div>
          </div>

          <div className="pt-8">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center overflow-hidden rounded-full border border-amber-400/20 bg-amber-400/15 py-5 text-lg font-black tracking-[0.2em] text-amber-100 uppercase shadow-2xl transition-all hover:bg-amber-400/25 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-100/30 border-t-amber-100" />
                  <span>{isEditMode ? "Updating..." : "Publishing..."}</span>
                </div>
              ) : (
                <span>{isEditMode ? "Update Guide" : "Publish Guide"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateGuidePage
