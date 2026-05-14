import React from "react"
import { Link } from "react-router-dom"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t border-white/10 bg-[#090c12]/95 px-6 py-16 text-white/60 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-4">
        <div className="col-span-1 md:col-span-2">
          <Link
            to="/"
            className="mb-6 inline-block font-serif text-3xl font-black tracking-tight text-white transition-transform hover:scale-105"
          >
            Crumbook
          </Link>
          <p className="max-w-md text-base leading-relaxed text-white/60">
            Your ultimate recipe companion. Discover, create, and share delicious meals with the world.
            Join our community of food lovers today and transform your kitchen experience.
          </p>
          <div className="mt-8 flex gap-4">
            {/* Social Icons Placeholder */}
            {["FB", "TW", "IG"].map((icon) => (
              <div
                key={icon}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-bold text-white/70 transition-all hover:border-amber-400/20 hover:bg-white/10 hover:text-white"
              >
                {icon}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-6 font-serif text-sm font-bold tracking-widest text-white uppercase">
            Quick Links
          </h3>
          <ul className="space-y-4">
            <li>
              <Link to="/" className="text-sm transition-colors hover:text-amber-200">Home</Link>
            </li>
            <li>
              <Link to="/recipes" className="text-sm transition-colors hover:text-amber-200">All Recipes</Link>
            </li>
            <li>
              <Link to="/drop-ingredients" className="text-sm transition-colors hover:text-amber-200">Drop Ingredients</Link>
            </li>
            <li>
              <Link to="/recipes/new" className="text-sm transition-colors hover:text-amber-200">Create Recipe</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-6 font-serif text-sm font-bold tracking-widest text-white uppercase">
            Account
          </h3>
          <ul className="space-y-4">
            <li>
              <Link to="/login" className="text-sm transition-colors hover:text-amber-200">Login</Link>
            </li>
            <li>
              <Link to="/register" className="text-sm transition-colors hover:text-amber-200">Register</Link>
            </li>
            <li>
              <Link to="/profile" className="text-sm transition-colors hover:text-amber-200">My Profile</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-7xl border-t border-white/5 pt-8 text-center text-xs text-white/40">
        <p>&copy; {currentYear} Crumbook. Built for foodies, by foodies. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
