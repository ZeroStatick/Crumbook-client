import axios from "axios"
import { REGISTER_URL, LOGIN_URL } from "../constant/endpoints"

export const register = async (userData) => {
  const { data } = await axios.post(REGISTER_URL, userData)
  // Assuming the backend returns { user, token } or similar
  if (data.token) {
    localStorage.setItem("token", data.token)
  }
  return data
}

export const login = async (userData) => {
  const { data } = await axios.post(LOGIN_URL, userData)
  if (data.token) {
    localStorage.setItem("token", data.token)
  }
  return data
}

export const logout = () => {
  localStorage.removeItem("token")
}
