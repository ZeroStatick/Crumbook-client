import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import axios from "axios"
import { BASE_URL } from "../constant/endpoints.js"
// כל הבקשות שיצאו דרך אקסיוס ישתמשו בבייס יו אר אל הנל
axios.defaults.baseURL = BASE_URL

// בכל בקשה לצרף את הטוקן
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

createRoot(document.getElementById("root")).render(<App />)
