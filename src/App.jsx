import { useEffect } from "react"
import { GET_ME_URL } from "../constant/endpoints"
import { useUserStore } from "./global/user"
import axios from "axios"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./components/Home.jsx"
import Register from "./components/Register.jsx"
import Login from "./components/Login.jsx"
import RecipePage from "./components/pages/RecipePage.jsx"
import CreateRecipePage from "./components/pages/CreateRecipePage.jsx"
import RecipeDetailPage from "./components/pages/RecipeDetailPage.jsx"

import { Toaster } from "react-hot-toast"

function App() {
  const { setUser, user } = useUserStore()
  const checkUser = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    try {
      const { data } = await axios.get(GET_ME_URL)
      setUser(data.user)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    checkUser()
  }, [])

  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/me" element={<Login />} />
          <Route path="/recipes" element={<RecipePage />} />
          <Route path="/recipes/new" element={<CreateRecipePage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route
            path="*"
            element={
              <h1 className="text-3xl font-bold underline">404 not found</h1>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
