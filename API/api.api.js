import axios from "axios"
import { GET_ME_URL } from "../constant/endpoints"

// Create an axios instance
const api = axios.create({
  baseURL: "", // Leave empty because we are using Vite proxy for /api
})

// Add a request interceptor to include the token in headers
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

export async function API_call(path, method = "GET", body = null) {
  try {
    const response = await api({
      method,
      url: path,
      data: body,
    })
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message
    throw new Error(errorMessage)
  }
}

export const get_all_users = () => api.get(GET_ME_URL).then((res) => res.data)

export const edit_user = (user_id, new_user_data) =>
  api.put(`${GET_ME_URL}/${user_id}`, new_user_data).then((res) => res.data)

export const delete_user = (user_id) =>
  api.delete(`${GET_ME_URL}/${user_id}`).then((res) => res.data)

export default api
