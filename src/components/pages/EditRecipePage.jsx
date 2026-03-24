import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
import useUserStore from "../../global/user"
import { RECIPE_URL } from "../../../constant/endpoints"

export default function EditRecipePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const { data } = await axios.get(`${RECIPE_URL}/${id}`)

        // Optional: Ensure the logged-in user is actually the author
        // Depending on your backend, author might be data.author._id or data.user
        if (user && data.author && data.author !== user._id) {
          toast.error("You are not authorized to edit this recipe")
          navigate("/recipes")
          return
        }

        setTitle(data.title)
        setDescription(data.description)
        setIsLoading(false)
      } catch (error) {
        console.error(error)
        toast.error("Failed to load recipe")
        navigate("/recipes")
      }
    }

    if (user) {
      fetchRecipe()
    }
  }, [id, navigate, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`${RECIPE_URL}/${id}`, { title, description })
      toast.success("Recipe updated successfully!")
      navigate(`/recipes/${id}`)
    } catch (error) {
      console.error(error)
      toast.error("Failed to update recipe")
    }
  }

  if (isLoading)
    return <div className="mt-10 text-center">Loading recipe...</div>

  return (
    <div className="mx-auto mt-10 max-w-2xl p-4">
      <h1 className="mb-6 text-3xl font-bold">Edit Recipe</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border p-2"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-32 w-full rounded border p-2"
            required
          />
        </div>
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  )
}
