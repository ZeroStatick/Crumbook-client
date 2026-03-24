import React from "react"
import { Link } from "react-router-dom"
import useUserStore from "../global/user"

const Home = () => {
  const { user } = useUserStore()

  return (
    <div
      style={{
        padding: "40px 20px",
        textAlign: "center",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "10px" }}>
        Welcome to Crumbook
      </h1>
      <p style={{ fontSize: "1.2rem", color: "#555", marginBottom: "30px" }}>
        Your personal digital recipe collection.
      </p>

      <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
        <Link
          to="/recipes"
          style={{
            padding: "12px 24px",
            backgroundColor: "#007bff",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "5px",
            fontWeight: "bold",
            fontSize: "1.1rem",
          }}
        >
          Browse Recipes
        </Link>
        {user && (
          <Link
            to="/profile"
            style={{
              padding: "12px 24px",
              backgroundColor: "#6c757d",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "5px",
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            My Profile
          </Link>
        )}
      </div>
    </div>
  )
}

export default Home
