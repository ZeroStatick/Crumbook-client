import axios from "axios"
import { BASE_URL } from "../constant/endpoints"
import useUserStore from "../src/global/user"

const api = axios.create({
  baseURL: BASE_URL,
})

// Add a request interceptor to include the token in every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor to handle common error patterns or extract data
api.interceptors.response.use(
  (response) => {
    // The backend follows { success: true, result: ... } pattern
    // HOWEVER, some controllers use 'data' instead of 'result'.
    // Let's be flexible.
    return response.data.result !== undefined ? response.data.result : response.data.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user_data")
      
      // Update the Zustand store to reflect the logout in the UI immediately
      useUserStore.getState().setUser(null)
    }
    // Standardize error handling
    const message = error.response?.data?.message || "An unexpected error occurred"
    return Promise.reject(new Error(message))
  }
)

export default api

// User API helpers
export const get_all_users = () => api.get("/api/users")

export const edit_user = (user_id, new_user_data) => {
  // Check if we need to send multipart/form-data (for file uploads)
  const hasFile = new_user_data.profile_picture instanceof File

  if (hasFile) {
    const formData = new FormData()
    Object.keys(new_user_data).forEach((key) => {
      // If it's the file, append it
      if (key === "profile_picture") {
        if (new_user_data[key] instanceof File) {
          formData.append(key, new_user_data[key])
        }
        // If it's a string URL, we skip it because we are uploading a new file
        return
      }
      
      // For other fields, only append if they have a value
      if (new_user_data[key] !== undefined && new_user_data[key] !== null) {
        formData.append(key, new_user_data[key])
      }
    })
    return api.put(`/api/users/${user_id}`, formData)
  }

  // If no file, send as JSON but remove empty profile_picture to avoid overwriting
  const dataToSend = { ...new_user_data }
  if (!dataToSend.profile_picture) {
    delete dataToSend.profile_picture
  }

  return api.put(`/api/users/${user_id}`, dataToSend)
}

export const delete_user = (user_id) => api.delete(`/api/users/${user_id}`)

export const get_me = () => api.get("/api/users/me")

export const toggle_favorite = (recipeId) => api.post("/api/users/favorites", { recipeId })
