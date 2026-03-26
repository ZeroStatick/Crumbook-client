import React from "react"
import { Link } from "react-router-dom"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      style={{
        padding: "40px 20px",
        backgroundColor: "#333",
        color: "#fff",
        marginTop: "60px",
        borderTop: "1px solid #444",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "30px",
        }}
      >
        <div style={{ flex: "1 1 300px" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "15px", color: "#fff" }}>
            Crumbook
          </h2>
          <p style={{ color: "#aaa", lineHeight: "1.6", maxWidth: "400px" }}>
            Your ultimate recipe companion. Discover, create, and share delicious meals with the world.
            Join our community of food lovers today!
          </p>
        </div>

        <div style={{ flex: "1 1 200px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "15px", color: "#eee" }}>
            Quick Links
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/" style={{ color: "#aaa", textDecoration: "none" }}>Home</Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/recipes" style={{ color: "#aaa", textDecoration: "none" }}>All Recipes</Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/recipes/new" style={{ color: "#aaa", textDecoration: "none" }}>Create Recipe</Link>
            </li>
          </ul>
        </div>

        <div style={{ flex: "1 1 200px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "15px", color: "#eee" }}>
            Account
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/login" style={{ color: "#aaa", textDecoration: "none" }}>Login</Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/register" style={{ color: "#aaa", textDecoration: "none" }}>Register</Link>
            </li>
          </ul>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "40px auto 0",
          paddingTop: "20px",
          borderTop: "1px solid #444",
          textAlign: "center",
          color: "#888",
          fontSize: "0.9rem",
        }}
      >
        <p>&copy; {currentYear} Crumbook. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
