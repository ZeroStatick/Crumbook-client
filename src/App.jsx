import { useEffect, useState } from "react"
import useUserStore from "./global/user"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { get_me } from "../API/api.api"

// Components
import Navbar from "./components/Navbar.jsx"
import Footer from "./components/Footer.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import AdminRoute from "./components/AdminRoute.jsx"
import GuestRoute from "./components/GuestRoute.jsx"

// Pages
import Home from "./components/pages/Home.jsx"
import Register from "./components/Register.jsx"
import Login from "./components/Login.jsx"
import RecipePage from "./components/pages/RecipePage.jsx"
import CreateRecipePage from "./components/pages/CreateRecipePage.jsx"
import RecipeDetailPage from "./components/pages/RecipeDetailPage.jsx"
import DropYourIngredients from "./components/pages/DropYourIngredients.jsx"
import UserProfilePage from "./components/pages/UserProfilePage.jsx"
import VisitProfilePage from "./components/pages/VisitProfilePage.jsx"
import AIChefPage from "./components/pages/AIChefPage.jsx"
import AdminDashboard from "./components/pages/AdminDashboard.jsx"

import { Toaster } from "react-hot-toast"

function App() {
  const { setUser } = useUserStore()
  const [isInitializing, setIsInitializing] = useState(true)

  const checkUser = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setIsInitializing(false)
      return
    }

    try {
      const user = await get_me()
      setUser(user)
    } catch (error) {
      console.error("Failed to fetch user data:", error.message)
      // Clear storage if the token is invalid
      localStorage.removeItem("token")
      localStorage.removeItem("user_data")
      setUser(null)
    } finally {
      setIsInitializing(false)
    }
  }

  useEffect(() => {
    checkUser()
  }, [])

  if (isInitializing) {
    return (
      <div className="theme-page flex h-screen w-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cb-border border-t-cb-primary"></div>
      </div>
    )
  }

  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Navbar />
        <main className="theme-page min-h-screen">
          <Routes>
            {/* Main Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/recipes" element={<RecipePage />} />
            <Route path="/drop-ingredients" element={<DropYourIngredients />} />
            <Route
              path="/ai-chef"
              element={
                <ProtectedRoute>
                  <AIChefPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Catch "new" specifically first */}
            <Route
              path="/recipes/new"
              element={
                <ProtectedRoute>
                  <CreateRecipePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recipes/edit/:id"
              element={
                <ProtectedRoute>
                  <CreateRecipePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recipes/fork/:id"
              element={
                <ProtectedRoute>
                  <CreateRecipePage />
                </ProtectedRoute>
              }
            />

            <Route path="/recipe/:id" element={<RecipeDetailPage />} />
            <Route path="/user/:id" element={<VisitProfilePage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />

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
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />

            {/* Catch-all 404 */}
            <Route
              path="*"
              element={
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <h1 className="text-4xl font-bold text-cb-text">404</h1>
                  <p className="mt-2 text-cb-text-soft">Page not found</p>
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
