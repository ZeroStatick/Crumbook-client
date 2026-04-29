import React from "react"
import { Navigate, Outlet } from "react-router-dom"
import useUserStore from "../global/user"

const GuestRoute = ({ children }) => {
  const { user } = useUserStore()
  const token = localStorage.getItem("token")

  // If there's a user or a token, redirect them to the home page
  if (user || token) {
    return <Navigate to="/" replace />
  }

  // Otherwise, render the guest component (like Login or Register)
  return children ? children : <Outlet />
}

export default GuestRoute
