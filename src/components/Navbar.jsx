import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { logout } from "../../API/auth.api"
import useUserStore from "../global/user"
import { DEFAULT_AVATAR } from "../../constant/images.js"
import crumbookLogo from "../assets/crumbookLogo.png"

const Navbar = () => {
  const { user, setUser } = useUserStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate("/login")
  }

  return (
    <nav className="sticky top-0 z-50 mb-8 border-b border-white/10 bg-[#090c12]/95 px-6 py-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-10">
          <Link
            to="/"
            className="flex items-center gap-4 text-white transition-transform hover:scale-105"
          >
            <img
              src={crumbookLogo}
              alt="Crumbook logo"
              className="h-14 w-14 rounded-2xl object-cover"
            />
            <span className="font-serif text-3xl font-black tracking-tight">
              Crumbook
            </span>
          </Link>
          <div className="hidden items-baseline gap-8 md:flex">
            <Link
              to="/recipes"
              className="font-serif font-semibold tracking-[0.02em] text-amber-100/80 transition-colors hover:text-white"
            >
              Recipes
            </Link>
            <Link
              to="/drop-ingredients"
              className="font-serif font-semibold tracking-[0.02em] text-amber-100/80 transition-colors hover:text-white"
            >
              Drop Ingredients
            </Link>
            <Link
              to="/ai-chef"
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-black text-white transition-colors hover:bg-white/10"
            >
              <span className="text-lg">👨‍🍳</span> AI Chef
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition-colors hover:border-white/20 hover:bg-white/10"
              >
                <div className="h-8 w-8 overflow-hidden rounded-full border border-white/10 bg-[#111821]">
                  <img
                    src={user.profile_picture || DEFAULT_AVATAR}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="hidden font-bold text-white sm:inline">
                  {user.name || "Chef"}
                </span>
              </Link>

              {user.role >= 2 && (
                <Link
                  to="/admin"
                  className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black tracking-widest text-white uppercase transition-colors hover:bg-white/10 lg:inline-block"
                >
                  Admin
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="rounded-full border border-amber-400/30 bg-amber-400/10 px-5 py-2 text-sm font-bold text-amber-100 shadow-lg shadow-amber-950/20 transition-all hover:bg-amber-400/20 active:scale-95"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="font-serif rounded-full font-semibold tracking-[0.02em] text-amber-100/80 transition-colors hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="font-serif rounded-full border border-white/10 bg-white/5 px-6 py-2 font-semibold tracking-[0.02em] text-white shadow-lg shadow-black/20 transition-all hover:bg-white/10 active:scale-95"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
