import React from "react"
import { Link, Navigate, Outlet } from "react-router-dom"
import useUserStore from "../global/user"

const AdminRoute = ({ children }) => {
  const { user } = useUserStore()
  const token = localStorage.getItem("token")
  const [authError, setAuthError] = React.useState(false)

  // Redirect to login immediately if no token
  React.useEffect(() => {
    if (!token) {
      setAuthError(true)
    }
    
    // If we have a token but no user after 5 seconds, it's likely a fetch failure
    const timeout = setTimeout(() => {
      if (token && !user) {
        setAuthError(true)
      }
    }, 5000)

    return () => clearTimeout(timeout)
  }, [token, user])

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (authError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#090b10] p-6 text-center">
        <div className="mb-6 rounded-full bg-rose-500/10 p-4 text-rose-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-black text-white">Verification Timeout</h1>
        <p className="mt-4 max-w-md text-amber-100/60">
          We couldn't verify your administrative credentials. This might be due to a slow connection or an expired session.
        </p>
        <div className="mt-10 flex gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="rounded-full border border-amber-400/20 bg-amber-400/10 px-8 py-3 text-xs font-black tracking-widest text-amber-200 uppercase transition-all hover:bg-amber-400/20"
          >
            Retry Connection
          </button>
          <Link 
            to="/login"
            className="rounded-full border border-white/10 px-8 py-3 text-xs font-black tracking-widest text-white/40 uppercase transition-all hover:bg-white/5"
          >
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  // If there's a token but user data hasn't finished loading yet
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090b10]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-400/20 border-t-amber-400"></div>
          <div className="font-serif text-sm font-black tracking-widest text-amber-200/40 uppercase">
            Verifying Credentials...
          </div>
        </div>
      </div>
    )
  }

  // Check if user is admin. Backend uses: 1 (User), 2 (Admin), 3 (Owner)
  if (user.role < 2) {
    return <Navigate to="/" replace />
  }

  return children ? children : <Outlet />
}

export default AdminRoute
