import axios from "axios"
import { BASE_URL } from "../constant/endpoints"

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
      // We don't have access to the Zustand store here directly easily,
      // but clearing storage will make the next app-wide check fail.
    }
    // Standardize error handling
    const message = error.response?.data?.message || "An unexpected error occurred"
    return Promise.reject(new Error(message))
  }
)

export default api

// User API helpers
export const get_all_users = () => api.get("/api/users")

export const edit_user = (user_id, new_user_data) =>
  api.put(`/api/users/${user_id}`, new_user_data)

export const delete_user = (user_id) => api.delete(`/api/users/${user_id}`)

export const get_me = () => api.get("/api/users/me")
