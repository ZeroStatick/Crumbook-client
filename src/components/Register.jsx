import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { register } from "../../API/auth.api"
import useUserStore from "../global/user"

const Register = () => {
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const setUser = useUserStore((state) => state.setUser)

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
      const result = await register(registerData)
      setUser(result.user)
      navigate("/")
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0f141d] p-10 shadow-2xl shadow-black/40">
        <div className="text-center mb-10">
          <p className="mb-2 inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-1 text-[10px] tracking-[0.3em] text-amber-200 uppercase">
            Join Crumbook
          </p>
          <h2 className="font-serif text-4xl font-black tracking-tight text-white">
            Create Profile
          </h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-medium text-rose-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="ml-1 block text-xs font-black tracking-widest text-white/40 uppercase">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Chef Nom de Plume"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition-all placeholder:text-white/20 focus:border-amber-400/30 focus:bg-white/10"
              value={registerData.name}
              onChange={updateData}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="ml-1 block text-xs font-black tracking-widest text-white/40 uppercase">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="chef@crumbook.com"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition-all placeholder:text-white/20 focus:border-amber-400/30 focus:bg-white/10"
              value={registerData.email}
              onChange={updateData}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="ml-1 block text-xs font-black tracking-widest text-white/40 uppercase">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition-all placeholder:text-white/20 focus:border-amber-400/30 focus:bg-white/10"
              value={registerData.password}
              onChange={updateData}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`mt-4 w-full rounded-full border border-amber-400/20 bg-amber-400/15 py-4 text-sm font-bold text-amber-100 shadow-lg shadow-amber-950/20 transition-all hover:bg-amber-400/25 active:scale-[0.98] ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Creating Account..." : "Join the Community"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-8">
          <p className="text-sm text-white/40">
            Already have an account?{" "}
            <NavLink to="/login" className="font-bold text-amber-200 hover:text-amber-100 transition-colors">
              Login here
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
