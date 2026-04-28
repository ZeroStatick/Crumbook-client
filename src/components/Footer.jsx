import React from "react"
import { Link } from "react-router-dom"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t border-amber-200/60 bg-gradient-to-r from-[#7c2d12] via-[#9a3d16] to-[#c86b16] px-6 py-16 text-amber-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <Link
            to="/"
            className="mb-6 inline-block text-3xl font-black tracking-tighter text-white"
          >
            Crumbook
          </Link>
          <p className="max-w-md leading-relaxed">
            Your ultimate recipe companion. Discover, create, and share delicious meals with the world.
            Join our community of food lovers today and transform your kitchen experience.
          </p>
          <div className="mt-8 flex gap-4">
            {/* Social Icons Placeholder */}
            <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-amber-50/12 transition-colors hover:bg-amber-50/24">FB</div>
            <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-amber-50/12 transition-colors hover:bg-amber-50/24">TW</div>
            <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-amber-50/12 transition-colors hover:bg-amber-50/24">IG</div>
          </div>
        </div>

        <div>
          <h3 className="mb-6 text-lg font-bold text-white">Quick Links</h3>
          <ul className="space-y-4">
            <li>
              <Link to="/" className="transition-colors hover:text-white">Home</Link>
            </li>
            <li>
              <Link to="/recipes" className="transition-colors hover:text-white">All Recipes</Link>
            </li>
            <li>
              <Link to="/drop-ingredients" className="transition-colors hover:text-white">Drop Ingredients</Link>
            </li>
            <li>
              <Link to="/recipes/new" className="transition-colors hover:text-white">Create Recipe</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-6 text-lg font-bold text-white">Account</h3>
          <ul className="space-y-4">
            <li>
              <Link to="/login" className="transition-colors hover:text-white">Login</Link>
            </li>
            <li>
              <Link to="/register" className="transition-colors hover:text-white">Register</Link>
            </li>
            <li>
              <Link to="/profile" className="transition-colors hover:text-white">My Profile</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-7xl border-t border-amber-100/20 pt-8 text-center text-sm text-amber-100/80">
        <p>&copy; {currentYear} Crumbook. Built for foodies, by foodies. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
