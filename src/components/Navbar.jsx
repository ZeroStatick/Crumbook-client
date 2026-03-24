import React from "react"
import { Link, useNavigate } from "react-router-dom"
import useUserStore from "../global/user"

const Navbar = () => {
  const { user, setUser } = useUserStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")
    setUser(null)
    navigate("/login")
  }

  return (
    <nav
      style={{
        padding: "15px 20px",
        backgroundColor: "#333",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
      }}
    >
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <Link
          to="/"
          style={{
            color: "#fff",
            textDecoration: "none",
            fontSize: "1.2rem",
            fontWeight: "bold",
          }}
        >
          Crumbook
        </Link>
        <Link to="/recipes" style={{ color: "#ddd", textDecoration: "none" }}>
          Recipes
        </Link>
      </div>

      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        {user ? (
          <>
            <span style={{ color: "#ccc" }}>Hello, {user.name || "Chef"}</span>
            <Link
              to="/profile"
              style={{ color: "#ddd", textDecoration: "none" }}
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              style={{
                padding: "6px 12px",
                backgroundColor: "#dc3545",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: "#ddd", textDecoration: "none" }}>
              Login
            </Link>
            <Link
              to="/register"
              style={{
                padding: "6px 12px",
                backgroundColor: "#28a745",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "4px",
                fontWeight: "bold",
              }}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
