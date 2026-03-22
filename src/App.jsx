import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./components/pages/Home.jsx"

// קומפוננטה = רכיב = פונקציה שמחזירה
// JSX
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
