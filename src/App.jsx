import { useEffect } from "react"
import useUserStore from "./global/user"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { get_me } from "../API/api.api"
import { logout } from "../API/auth.api"

// Components
import Navbar from "./components/Navbar.jsx"
import Footer from "./components/Footer.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import AdminRoute from "./components/AdminRoute.jsx"

// Pages
import Home from "./components/pages/Home.jsx"
import Register from "./components/Register.jsx"
import Login from "./components/Login.jsx"
import RecipePage from "./components/pages/RecipePage.jsx"
import CreateRecipePage from "./components/pages/CreateRecipePage.jsx"
import RecipeDetailPage from "./components/pages/RecipeDetailPage.jsx"
import AdminDashboard from "./components/pages/AdminDashboard.jsx"

import { Toaster } from "react-hot-toast"

function App() {
  const { setUser } = useUserStore()

  const checkUser = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const user = await get_me()
      setUser(user)
    } catch (error) {
      console.error("Failed to fetch user data:", error.message)
      // Clear storage if the token is invalid
      localStorage.removeItem("token")
      localStorage.removeItem("user_data")
      setUser(null)
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
        <main className="container mx-auto px-4">
          <Routes>
            {/* Main Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/recipes" element={<RecipePage />} />
            
            {/* Protected Routes - Catch "new" specifically first */}
            <Route
              path="/recipes/new"
              element={
                <ProtectedRoute>
                  <CreateRecipePage />
                </ProtectedRoute>
              }
            />

            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Auth Routes */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Catch-all 404 */}
            <Route
              path="*"
              element={
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <h1 className="text-4xl font-bold text-gray-800">404</h1>
                  <p className="mt-2 text-gray-600">Page not found</p>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </>
  )
}

export default App
