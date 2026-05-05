import api from "./api.api"
import { LOGIN_URL, REGISTER_URL } from "../constant/endpoints"

export const register = async (userData) => {
  const result = await api.post(REGISTER_URL, userData)
  // result = { user, token }
  const { user, token } = result

  if (token) {
    localStorage.setItem("token", token)
    localStorage.setItem("user_data", JSON.stringify(user))
  }

  return result
}

export const login = async (userData) => {
  const result = await api.post(LOGIN_URL, userData)
  // result = { token, user }
  const { token, user } = result
  
  if (token) {
    localStorage.setItem("token", token)
    localStorage.setItem("user_data", JSON.stringify(user))
  }
  
  return result
}

export const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user_data")
}
