import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { logout } from "../../API/auth.api"
import useUserStore from "../global/user"

const Navbar = () => {
  const { user, setUser } = useUserStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate("/login")
  }

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 py-4 mb-8 shadow-xl">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-2xl font-black text-blue-400 tracking-tighter hover:scale-105 transition-transform"
          >
            Crumbook
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/recipes" 
              className="text-slate-300 hover:text-blue-400 font-semibold transition-colors"
            >
              Recipes
            </Link>
            <Link
              to="/drop-ingredients"
              className="text-slate-300 hover:text-blue-400 font-semibold transition-colors"
            >
              Drop Ingredients
            </Link>
            <Link
              to="/ai-chef"
              className="text-blue-400 hover:text-blue-300 font-black transition-colors flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-400/10 border border-blue-400/20"
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
              >
                <div className="w-8 h-8 rounded-full bg-blue-900/50 border border-blue-700 overflow-hidden">
                  <img 
                    src={user.profile_picture || `https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff`} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="hidden sm:inline font-bold text-slate-200">{user.name || "Chef"}</span>
              </Link>
              
              {user.role >= 2 && (
                <Link
                  to="/admin"
                  className="hidden lg:inline-block px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 text-sm font-black uppercase tracking-widest border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                >
                  Admin
                </Link>
              )}
              
              <button
                onClick={handleLogout}
                className="px-5 py-2 bg-slate-100 text-slate-900 rounded-xl font-bold text-sm hover:bg-white transition-all active:scale-95 shadow-lg"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-slate-300 hover:text-white font-bold transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 active:scale-95 border border-blue-500/30"
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
