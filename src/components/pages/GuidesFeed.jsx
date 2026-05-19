import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { get_all_guides } from "../../../API/guide.api"
import useUserStore from "../../global/user"
import ReportModal from "../ReportModal"
import toast from "react-hot-toast"

const GuidesFeed = () => {
  const { user } = useUserStore()
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)
  const [reportTarget, setReportTarget] = useState(null)

  const fetchGuides = async () => {
    try {
      const result = await get_all_guides()
      setGuides(result)
    } catch (error) {
      toast.error("Failed to load official guides")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGuides()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-400 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row md:text-left">
        <div>
          <h1 className="font-serif text-5xl font-black text-white">Culinary Guides</h1>
          <p className="mt-4 text-xl text-amber-100/60">
            Curated culinary wisdom and community discussions.
          </p>
        </div>
        {user && (
          <Link
            to="/guides/new"
            className="flex items-center gap-3 rounded-full border border-amber-400/20 bg-amber-400/10 px-8 py-4 text-xs font-black tracking-widest text-amber-200 uppercase transition-all hover:bg-amber-400/20 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Write a Guide
          </Link>
        )}
      </header>

      {guides.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-2xl text-white/40">No official guides yet. Stay tuned!</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => {
            const authorIdString = (guide.authorId?._id || guide.authorId || "").toString()
            const userIdString = (user?._id || user?.id || "").toString()
            const isAuthor = authorIdString === userIdString
            
            return (
              <div
                key={guide._id}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0f141d] transition-all hover:border-white/20 hover:bg-[#151a24] hover:shadow-2xl hover:shadow-black/40"
              >
                {/* Floating Report Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!user) {
                      toast.error("Please login to report content");
                      return;
                    }
                    setReportTarget({ id: guide._id, type: "guide" });
                  }}
                  className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-black/40 px-3 py-1.5 text-[10px] font-black tracking-widest text-amber-500/80 uppercase backdrop-blur-md transition-all hover:bg-amber-500 hover:text-black"
                  title="Report Guide"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 01-2 2zm9-13.5V9" />
                  </svg>
                  REPORT 🚩
                </button>

                <Link to={`/guide/${guide._id}`} className="block relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src={guide.thumbnailUrl}
                    alt={guide.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop";
                    }}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <Link to={`/guide/${guide._id}`}>
                    <h2 className="mb-2 font-serif text-2xl font-bold text-white hover:text-amber-200 transition-colors">
                      {guide.title}
                    </h2>
                  </Link>
                  <div className="mt-auto flex items-center justify-between text-sm text-white/40">
                    <div className="flex flex-col">
                      <span>By {guide.author}</span>
                      <span>{new Date(guide.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {reportTarget && (
        <ReportModal
          targetId={reportTarget.id}
          targetType={reportTarget.type}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  )
}

export default GuidesFeed
