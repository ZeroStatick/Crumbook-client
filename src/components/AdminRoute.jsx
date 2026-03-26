import React from "react"
import { Navigate, Outlet } from "react-router-dom"
import useUserStore from "../global/user"

const AdminRoute = ({ children }) => {
  const { user } = useUserStore()
  const token = localStorage.getItem("token")

  // TEMPORARY BYPASS: Allow access to admin pages for development/testing
  return children ? children : <Outlet />

  // If there's no user and no token, redirect to login
  if (!user && !token) {
    return <Navigate to="/login" replace />
  }

  // If there's a token but user data hasn't finished loading yet
  if (!user && token) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Authenticating...</div>
      </div>
    )
  }

  // Check if user is admin. Adjust this condition based on your backend user model
  // Common patterns are user.isAdmin === true or user.role === "admin"
  if (user && user.role !== "admin" && !user.isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-4 text-lg text-gray-700">
          You do not have administrative privileges to access this page.
        </p>
        <Navigate to="/" replace />
      </div>
    )
  }

  return children ? children : <Outlet />
}

export default AdminRoute
