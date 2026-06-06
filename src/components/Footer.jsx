import React from "react"
import { Link } from "react-router-dom"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/5 bg-[#0a0c10] px-6 py-24 text-white/40">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 md:grid-cols-4">
        <div className="col-span-1 md:col-span-2">
          <Link
            to="/"
            className="mb-8 inline-block font-serif text-2xl font-normal tracking-[0.2em] uppercase text-white"
          >
            Crumbook
          </Link>
          <p className="max-w-md text-base leading-relaxed font-light">
            A refined culinary collective dedicated to the art of cooking. 
            Discover, curate, and share techniques that define the modern kitchen.
          </p>
          <div className="mt-10 flex gap-8">
            {["Instagram", "Twitter", "Facebook"].map((platform) => (
              <a
                key={platform}
                href="#"
                className="text-xs font-bold uppercase tracking-[0.2em] hover:text-white transition-colors"
              >
                {platform}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-8 text-xs font-bold tracking-[0.3em] text-white uppercase">
            Directory
          </h3>
          <ul className="space-y-4">
            <li>
              <Link to="/recipes" className="text-sm font-medium tracking-wider hover:text-white transition-colors">Recipes</Link>
            </li>
            <li>
              <Link to="/guides" className="text-sm font-medium tracking-wider hover:text-white transition-colors">Guides</Link>
            </li>
            <li>
              <Link to="/drop-ingredients" className="text-sm font-medium tracking-wider hover:text-white transition-colors">Inventory</Link>
            </li>
            <li>
              <Link to="/ai-chef" className="text-sm font-medium tracking-wider hover:text-white transition-colors">AI Chef</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-8 text-xs font-bold tracking-[0.3em] text-white uppercase">
            Access
          </h3>
          <ul className="space-y-4">
            <li>
              <Link to="/login" className="text-sm font-medium tracking-wider hover:text-white transition-colors">Login</Link>
            </li>
            <li>
              <Link to="/register" className="text-sm font-medium tracking-wider hover:text-white transition-colors">Join Collective</Link>
            </li>
            <li>
              <Link to="/profile" className="text-sm font-medium tracking-wider hover:text-white transition-colors">Profile</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-24 max-w-7xl border-t border-white/5 pt-12 text-center text-[11px] font-bold uppercase tracking-[0.4em] text-white/20">
        <p>&copy; {currentYear} Crumbook Collective. All Rights Reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
