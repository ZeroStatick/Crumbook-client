import React from "react"
import { Link } from "react-router-dom"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-400 py-16 px-6 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <Link
            to="/"
            className="text-3xl font-black text-white tracking-tighter mb-6 inline-block"
          >
            Crumbook
          </Link>
          <p className="max-w-md leading-relaxed">
            Your ultimate recipe companion. Discover, create, and share delicious meals with the world.
            Join our community of food lovers today and transform your kitchen experience.
          </p>
          <div className="mt-8 flex gap-4">
            {/* Social Icons Placeholder */}
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">FB</div>
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-400 transition-colors cursor-pointer">TW</div>
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors cursor-pointer">IG</div>
          </div>
        </div>

        <div>
          <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
          <ul className="space-y-4">
            <li>
              <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
            </li>
            <li>
              <Link to="/recipes" className="hover:text-blue-400 transition-colors">All Recipes</Link>
            </li>
            <li>
              <Link to="/drop-ingredients" className="hover:text-blue-400 transition-colors">Drop Ingredients</Link>
            </li>
            <li>
              <Link to="/recipes/new" className="hover:text-blue-400 transition-colors">Create Recipe</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold text-lg mb-6">Account</h3>
          <ul className="space-y-4">
            <li>
              <Link to="/login" className="hover:text-blue-400 transition-colors">Login</Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-blue-400 transition-colors">Register</Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-blue-400 transition-colors">My Profile</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-800 mt-16 pt-8 text-center text-sm">
        <p>&copy; {currentYear} Crumbook. Built for foodies, by foodies. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
