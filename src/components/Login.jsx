import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { login } from "../../API/auth.api.js"
import useUserStore from "../global/user"

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const setUser = useUserStore((state) => state.setUser)
  const navigate = useNavigate()

  const formHandle = ({ target }) => {
    setLoginData({
      ...loginData,
      [target.name]: target.value,
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await login(loginData)
      // login helper already sets localStorage and returns { user, token }
      setUser(result.user)
      console.log("Login success!")
      navigate("/")
    } catch (err) {
      console.log("failed to log", err)
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-96 rounded bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="rounded bg-red-100 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="mt-1 w-full rounded border p-2 focus:border-blue-500 focus:ring-blue-500"
              value={loginData.email}
              onChange={formHandle}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="mt-1 w-full rounded border p-2 focus:border-blue-500 focus:ring-blue-500"
              value={loginData.password}
              onChange={formHandle}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full rounded bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 ${
              isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <NavLink to="/register" className="text-blue-600 hover:underline">
              Register
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
