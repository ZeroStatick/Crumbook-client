import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { logout } from "../../API/auth.api"
import useUserStore from "../global/user"

const Navbar = () => {
  const { user, setUser } = useUserStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
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
        <Link
          to="/drop-ingredients"
          style={{ color: "#ddd", textDecoration: "none" }}
        >
          Drop Ingredients
        </Link>
      </div>

      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        {user ? (
          <>
            <Link
              to="/profile"
              style={{
                color: "#ddd",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "#555",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  overflow: "hidden",
                }}
              >
                <img
                  src={
                    user.profile_picture ||
                    "https://ui-avatars.com/api/?name=" + user.name
                  }
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectCover: "cover",
                  }}
                />
              </div>

              <span style={{ color: "#ccc" }}>
                Hello, {user.name || "Chef"}
              </span>
            </Link>
            {(user.role === "admin" || user.isAdmin) && (
              <Link
                to="/admin"
                style={{
                  color: "#ffd700",
                  textDecoration: "none",
                  fontWeight: "bold",
                  border: "1px solid #ffd700",
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
              >
                Admin
              </Link>
            )}
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
