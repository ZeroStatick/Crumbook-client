import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { logout } from "../../API/auth.api"
import useUserStore from "../global/user"
import defaultAvatar from "../assets/bread.jfif"

const Navbar = () => {
  const { user, setUser } = useUserStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate("/login")
  }

  return (
    <nav className="sticky top-0 z-50 mb-8 border-b border-amber-300/40 bg-gradient-to-r from-[#9a3d16]/95 via-[#b45309]/95 to-[#d88b1c]/95 px-6 py-4 shadow-xl backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-2xl font-black tracking-tighter text-amber-50 transition-transform hover:scale-105"
          >
            Crumbook
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/recipes" 
              className="font-semibold text-amber-50/85 transition-colors hover:text-white"
            >
              Recipes
            </Link>
            <Link
              to="/drop-ingredients"
              className="font-semibold text-amber-50/85 transition-colors hover:text-white"
            >
              Drop Ingredients
            </Link>
            <Link
              to="/ai-chef"
              className="flex items-center gap-1.5 rounded-lg border border-amber-200/35 bg-amber-100/18 px-3 py-1 font-black text-amber-100 transition-colors hover:text-white"
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
                className="flex items-center gap-2 rounded-full border border-transparent px-3 py-1.5 transition-colors hover:border-amber-100/25 hover:bg-amber-950/10"
              >
                <div className="h-8 w-8 overflow-hidden rounded-full border border-amber-100/40 bg-amber-950/30">
                  <img 
                    src={user.profile_picture || defaultAvatar} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="hidden sm:inline font-bold text-amber-50">{user.name || "Chef"}</span>
              </Link>
              
              {user.role >= 2 && (
                <Link
                  to="/admin"
                  className="hidden rounded-xl border border-amber-100/30 bg-amber-50/18 px-4 py-2 text-sm font-black uppercase tracking-widest text-amber-50 transition-colors hover:bg-amber-50/28 lg:inline-block"
                >
                  Admin
                </Link>
              )}
              
              <button
                onClick={handleLogout}
                className="rounded-xl border border-amber-200/80 bg-amber-50 px-5 py-2 text-sm font-bold text-amber-950 shadow-lg transition-all active:scale-95 hover:bg-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="font-bold text-amber-50/85 transition-colors hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl border border-amber-100/40 bg-amber-50 px-6 py-2 font-bold text-[#9a3d16] shadow-lg transition-all active:scale-95 hover:bg-white"
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
