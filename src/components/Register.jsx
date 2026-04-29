import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { register } from "../../API/auth.api"

const Register = () => {
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const updateData = ({ target }) => {
    setRegisterData({
      ...registerData,
      [target.name]: target.value,
    })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await register(registerData)
      console.log("Registration successful!")
      navigate("/login")
    } catch (err) {
      console.log("failed to register", err)
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="theme-page flex min-h-screen flex-col items-center justify-center px-4">
      <div className="theme-card w-full max-w-md rounded-3xl p-8">
        <h2 className="mb-6 text-center text-2xl font-bold text-cb-text">
          Register
        </h2>
        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-cb-text-soft">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="theme-input mt-1 w-full p-2.5"
              value={registerData.name}
              onChange={updateData}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cb-text-soft">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="theme-input mt-1 w-full p-2.5"
              value={registerData.email}
              onChange={updateData}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cb-text-soft">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="theme-input mt-1 w-full p-2.5"
              value={registerData.password}
              onChange={updateData}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`theme-button-primary w-full p-2.5 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-cb-text-soft">
            Already have an account?{" "}
            <NavLink to="/login" className="font-semibold text-cb-primary hover:underline">
              Login
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
