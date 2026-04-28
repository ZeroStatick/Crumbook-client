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
    <div className="theme-page flex min-h-screen flex-col items-center justify-center px-4">
      <div className="theme-card w-full max-w-md rounded-3xl p-8">
        <h2 className="mb-6 text-center text-2xl font-bold text-cb-text">
          Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-cb-text-soft">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="theme-input mt-1 w-full p-2.5"
              value={loginData.email}
              onChange={formHandle}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cb-text-soft">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="theme-input mt-1 w-full p-2.5"
              value={loginData.password}
              onChange={formHandle}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`theme-button-primary w-full p-2.5 ${
              isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-cb-text-soft">
            Don't have an account?{" "}
            <NavLink to="/register" className="font-semibold text-cb-primary hover:underline">
              Register
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
