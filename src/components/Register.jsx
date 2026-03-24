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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Register
        </h2>
        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-100 rounded">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="w-full p-2 mt-1 border rounded focus:ring-blue-500 focus:border-blue-500"
              value={registerData.name}
              onChange={updateData}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-2 mt-1 border rounded focus:ring-blue-500 focus:border-blue-500"
              value={registerData.email}
              onChange={updateData}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full p-2 mt-1 border rounded focus:ring-blue-500 focus:border-blue-500"
              value={registerData.password}
              onChange={updateData}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <NavLink to="/login" className="text-blue-600 hover:underline">
              Login
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
