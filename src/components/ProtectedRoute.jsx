import React from "react"
import { Navigate, Outlet } from "react-router-dom"
import useUserStore from "../global/user"

const ProtectedRoute = ({ children }) => {
  const { user } = useUserStore()
  const token = localStorage.getItem("token")

  // If there's no user and no token, redirect them to the login page immediately
  if (!user && !token) {
    return <Navigate to="/login" replace />
  }

  // If there's a token but the user data hasn't finished loading yet, show a loading indicator
  if (!user && token) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Authenticating...
      </div>
    )
  }

  // Otherwise, render the protected component
  return children ? children : <Outlet />
}

export default ProtectedRoute
