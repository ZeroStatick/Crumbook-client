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
    <div className="min-h-screen bg-transparent text-[#f6efe8] flex flex-col items-center justify-center px-4">
      <div className="bg-[#10141e]/95 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] w-full max-w-md rounded-3xl p-8">
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
              className="rounded-2xl border border-white/15 bg-white/10 text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all mt-1 w-full p-2.5"
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
              className="rounded-2xl border border-white/15 bg-white/10 text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all mt-1 w-full p-2.5"
              value={loginData.password}
              onChange={formHandle}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`rounded-xl font-bold text-white bg-gradient-to-br from-[#b45309] to-[#d88b1c] shadow-[0_12px_30px_rgba(216,139,28,0.26)] hover:brightness-105 active:scale-95 transition-all w-full p-2.5 ${
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
