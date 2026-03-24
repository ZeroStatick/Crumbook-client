import api from "./api.api"
import { REGISTER_URL, LOGIN_URL } from "../constant/endpoints"

export const register = async (userData) => {
  const { data } = await api.post(REGISTER_URL, userData)
  if (data.token) {
    localStorage.setItem("token", data.token)
  }
  return data
}

export const login = async (userData) => {
  const { data } = await api.post(LOGIN_URL, userData)
  if (data.token) {
    localStorage.setItem("token", data.token)
  }
  return data
}

export const logout = () => {
  localStorage.removeItem("token")
}
