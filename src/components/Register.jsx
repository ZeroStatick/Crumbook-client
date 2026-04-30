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
    <div className="min-h-screen bg-transparent text-[#f6efe8] flex flex-col items-center justify-center px-4">
      <div className="bg-[#10141e]/95 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] w-full max-w-md rounded-3xl p-8">
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
              className="rounded-2xl border border-white/15 bg-white/10 text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all mt-1 w-full p-2.5"
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
              className="rounded-2xl border border-white/15 bg-white/10 text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all mt-1 w-full p-2.5"
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
              className="rounded-2xl border border-white/15 bg-white/10 text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all mt-1 w-full p-2.5"
              value={registerData.password}
              onChange={updateData}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`rounded-xl font-bold text-white bg-gradient-to-br from-[#b45309] to-[#d88b1c] shadow-[0_12px_30px_rgba(216,139,28,0.26)] hover:brightness-105 active:scale-95 transition-all w-full p-2.5 ${
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
