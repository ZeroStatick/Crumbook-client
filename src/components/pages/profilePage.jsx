import React from "react"
import useUserStore from "../../global/user"

const ProfilePage = () => {
  const { user } = useUserStore()

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-xl bg-white shadow-md">
        {/* Cover Photo */}

        <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

        {/* Profile Header */}
        <div className="relative px-6 pb-6">
          <div className="-mt-16 mb-4 flex flex-col items-center justify-between sm:-mt-12 sm:flex-row sm:items-end">
            <div className="relative">
              <img
                className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 object-cover shadow-sm"
                src={user?.profileImage || "https://via.placeholder.com/150"}
                alt="Profile Avatar"
              />
            </div>
            <div className="mt-4 sm:mt-0">
              <button className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700">
                Edit Profile
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.username || user?.name || "Crumbook User"}
            </h1>
            <p className="mt-1 text-lg font-medium text-gray-600">Home Chef</p>
            <p className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-500 sm:justify-start">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Food Lover • Joined Recently
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-8 border-t border-gray-100 pt-8 md:grid-cols-3">
            {/* About Section */}
            <div className="col-span-1 md:col-span-2">
              <h2 className="mb-4 text-xl font-bold text-gray-900">About Me</h2>
              <p className="leading-relaxed text-gray-600">
                Passionate home chef with a love for discovering and sharing new
                recipes. Welcome to my Crumbook profile!
              </p>
            </div>

            {/* Contact & Links Section */}
            <div className="col-span-1 rounded-lg border border-gray-100 bg-gray-50 p-5">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Contact Info
              </h2>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex flex-col">
                  <span className="font-semibold text-gray-900">Email</span>
                  <a
                    href={`mailto:${user?.email || ""}`}
                    className="transition-colors hover:text-indigo-600"
                  >
                    {user?.email || "No email provided"}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
