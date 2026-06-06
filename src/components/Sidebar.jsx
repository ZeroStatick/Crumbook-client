import React from "react"
import { Link } from "react-router-dom"

/**
 * Mobile Sidebar component for the Navbar.
 * 
 * @param {boolean} isOpen - Whether the sidebar is visible
 * @param {Function} onClose - Function to close the sidebar
 * @param {Array} links - Navigation links to display
 */
const Sidebar = ({ isOpen, onClose, links }) => {
  return (
    <div 
      className={`fixed inset-0 z-[60] flex justify-end min-[1150px]:hidden transition-opacity duration-500 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      ></div>

      {/* Content */}
      <div className={`relative h-full w-full max-w-[320px] bg-[#0a0c10] border-l border-white/5 p-10 flex flex-col transform transition-transform duration-500 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-start mb-20">
          <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/20">Menu</span>
        </div>
        
        <div className="flex flex-col gap-8">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="font-serif text-2xl font-light tracking-widest text-white/60 hover:text-white transition-colors uppercase"
              onClick={onClose}
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
  )
}

export default Sidebar
