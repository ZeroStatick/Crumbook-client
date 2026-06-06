import React, { useState, useRef, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { logout } from "../../API/auth.api"
import useUserStore from "../global/user"
import Avatar from "./Avatar"
import crumbookLogo from "../assets/crumbookLogo.png"
import defaultUserIcon from "../assets/defaultusericone.png"

const Navbar = () => {
  const { user, setUser } = useUserStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false)
  const avatarMenuRef = useRef(null)

  const handleLogout = () => {
    logout()
    setUser(null)
    setIsAvatarMenuOpen(false)
    setIsSidebarOpen(false)
    navigate("/login")
  }

  // Close menus on route change
  useEffect(() => {
    setIsSidebarOpen(false)
    setIsAvatarMenuOpen(false)
  }, [location.pathname])

  // Close avatar menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target)) {
        setIsAvatarMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const navLinks = [
    { name: "Recipes", path: "/recipes" },
    { name: "Guides", path: "/guides" },
    { name: "Inventory", path: "/drop-ingredients" },
    { name: "AI Chef", path: "/ai-chef" },
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0c10]/95 px-4 sm:px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          
          {/* Left: Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img 
              src={crumbookLogo} 
              alt="Logo" 
              className="h-10 w-10 md:h-12 md:w-12 rounded-xl object-cover" 
            />
            <span className="font-serif text-xl md:text-2xl font-normal tracking-[0.2em] uppercase hidden min-[500px]:block">
              Crumbook
            </span>
          </Link>

          {/* Center: Desktop Links (Hidden < 1150px) */}
          <div className="hidden min-[1150px]:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 transition-colors hover:text-white"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* User Avatar & Dropdown */}
            <div className="relative" ref={avatarMenuRef}>
              <button 
                onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                className="flex items-center justify-center transition-transform active:scale-95 outline-none"
              >
                <Avatar 
                  src={user ? user.profile_picture : defaultUserIcon} 
                  name={user?.name || "Guest"} 
                  size="h-9 w-9 md:h-10 md:w-10"
                  fontSize="text-[10px]"
                />
              </button>

              {/* Avatar Dropdown */}
              {isAvatarMenuOpen && (
                <div className="absolute right-0 mt-4 w-52 origin-top-right rounded-2xl border border-white/10 bg-[#0a0c10] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[70]">
                  <div className="py-1">
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-white/5 mb-2">
                          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 mb-1">Signed in as</p>
                          <p className="text-sm font-serif text-white truncate">{user.name}</p>
                        </div>
                        <Link 
                          to="/profile" 
                          className="block px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                          My Profile
                        </Link>
                        {user.role >= 2 && (
                          <Link 
                            to="/admin" 
                            className="block px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                          >
                            Admin Panel
                          </Link>
                        )}
                        <button 
                          onClick={handleLogout} 
                          className="w-full text-left block px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400/80 hover:text-rose-400 hover:bg-rose-400/5 rounded-xl transition-colors mt-1"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-3 border-b border-white/5 mb-2">
                          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 mb-1">Crumbook</p>
                          <p className="text-sm font-serif text-white">Guest Chef</p>
                        </div>
                        <Link 
                          to="/login" 
                          className="block px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                          Login
                        </Link>
                        <Link 
                          to="/register" 
                          className="block px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                          Join Now
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Burger Icon (Visible < 1150px) */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex min-[1150px]:hidden flex-col gap-1.5 p-2 transition-opacity hover:opacity-70 outline-none z-[80]"
              aria-label="Toggle Menu"
            >
              <div className={`h-0.5 w-6 bg-white transition-all duration-300 ${isSidebarOpen ? "rotate-45 translate-y-[8px]" : ""}`}></div>
              <div className={`h-0.5 w-6 bg-white transition-all duration-300 ${isSidebarOpen ? "opacity-0" : ""}`}></div>
              <div className={`h-0.5 w-6 bg-white transition-all duration-300 ${isSidebarOpen ? "-rotate-45 -translate-y-[8px]" : ""}`}></div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div 
        className={`fixed inset-0 z-[60] flex justify-end min-[1150px]:hidden transition-opacity duration-500 ${isSidebarOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>

        {/* Content */}
        <div className={`relative h-full w-full max-w-[320px] bg-[#0a0c10] border-l border-white/5 p-10 flex flex-col transform transition-transform duration-500 ease-out ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex justify-start mb-20">
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/20">Menu</span>
          </div>
          
          <div className="flex flex-col gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="font-serif text-2xl font-light tracking-widest text-white/60 hover:text-white transition-colors uppercase"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="mt-auto">
            <div className="pt-8 border-t border-white/5 text-[9px] font-bold uppercase tracking-[0.3em] text-white/10">
              Crumbook Collective
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
