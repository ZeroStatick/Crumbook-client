import { useEffect } from "react"
import { GET_ME_URL } from "../constant/endpoints"
import useUserStore from "./global/user"
import api from "../API/api.api"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./components/Home.jsx"
import Register from "./components/Register.jsx"
import Login from "./components/Login.jsx"
import RecipePage from "./components/pages/RecipePage.jsx"
import CreateRecipePage from "./components/pages/CreateRecipePage.jsx"
import EditRecipePage from "./components/pages/EditRecipePage.jsx"
import RecipeDetailPage from "./components/pages/RecipeDetailPage.jsx"
import ProfilePage from "./components/pages/profilePage.jsx"
import Navbar from "./components/Navbar.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"

import { Toaster } from "react-hot-toast"

function App() {
  console.log("React Router sees this path:", window.location.pathname)

  const { setUser, user } = useUserStore()
  const checkUser = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    try {
      const { data } = await api.get(GET_ME_URL)
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
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recipes" element={<RecipePage />} />

          {/* Protected Route for profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Protected Route for creating recipes */}
          <Route
            path="/recipes/new"
            element={
              <ProtectedRoute>
                <CreateRecipePage />
              </ProtectedRoute>
            }
          />

          {/* Protected Route for editing recipes */}
          <Route
            path="/recipes/edit/:id"
            element={
              <ProtectedRoute>
                <EditRecipePage />
              </ProtectedRoute>
            }
          />

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
