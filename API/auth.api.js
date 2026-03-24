import api from "./api.api"
import { LOGIN_URL, REGISTER_URL } from "../constant/endpoints"

export const register = async (userData) => {
  const result = await api.post(REGISTER_URL, userData)
  // Register currently doesn't return a token, so just set user_data
  localStorage.setItem("user_data", JSON.stringify(result))
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
