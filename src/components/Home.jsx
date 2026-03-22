import React from "react"
import { Link } from "react-router-dom"

const Home = () => {
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

      <div>
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
      </div>
    </div>
  )
}

export default Home
