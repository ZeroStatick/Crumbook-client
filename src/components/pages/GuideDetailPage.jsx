import React, { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { get_guide_by_id, add_guide_comment, delete_guide, delete_guide_comment } from "../../../API/guide.api"
import useUserStore from "../../global/user"
import Avatar from "../Avatar"
import ReportModal from "../ReportModal"
import toast from "react-hot-toast"

const GuideDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [guide, setGuide] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [reportTarget, setReportTarget] = useState(null)

  const fetchGuideData = async () => {
    try {
      const result = await get_guide_by_id(id)
      setGuide(result.guide)
      setComments(result.comments)
    } catch (error) {
      toast.error("Failed to load guide details")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const result = await add_guide_comment(id, newComment)
      setComments([...comments, result])
      setNewComment("")
      toast.success("Comment added!")
    } catch (error) {
      toast.error("Failed to post comment")
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await delete_guide_comment(id, commentId)
      setComments(comments.filter(c => c._id !== commentId))
      toast.success("Comment deleted")
    } catch (error) {
      toast.error("Failed to delete comment")
    }
  }

  const handleDeleteGuide = async () => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-in fade-in zoom-in duration-300' : 'animate-out fade-out zoom-out duration-300'} pointer-events-auto flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-white/10 bg-[#0f141d] p-5 shadow-2xl shadow-black`}>
        <p className="font-serif text-sm font-black text-white">Are you sure you want to delete this guide?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="rounded-lg border border-white/10 px-3 py-1 text-[10px] font-black text-white/40 hover:bg-white/5">CANCEL</button>
          <button 
            onClick={async () => { 
              toast.dismiss(t.id); 
              try {
                await delete_guide(id);
                toast.success("Guide deleted");
                navigate("/guides");
              } catch (err) {
                toast.error("Delete failed");
              }
            }} 
            className="rounded-lg bg-rose-600 px-3 py-1 text-[10px] font-black text-white shadow-lg hover:bg-rose-700"
          >
            DELETE
          </button>
        </div>
      </div>
    ))
  }

  useEffect(() => {
    fetchGuideData()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-400 border-t-transparent"></div>
      </div>
    )
  }

  if (!guide) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl text-white">Guide not found</h2>
      </div>
    )
  }

  const authorIdString = (guide.authorId?._id || guide.authorId || "").toString()
  const userIdString = (user?._id || user?.id || "").toString()
  const isAuthor = authorIdString === userIdString
  const isAdmin = user?.role >= 2
  const canDelete = isAdmin || isAuthor

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10">
        <Link
          to="/guides"
          className="group flex items-center gap-2 text-sm font-bold tracking-widest text-white/40 uppercase transition-colors hover:text-white"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span> Back to guides
        </Link>
      </div>

      <article className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f141d] shadow-2xl">
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          <img
            src={guide.thumbnailUrl}
            alt={guide.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop";
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {canDelete && (
            <div className="absolute top-6 right-6 flex items-center gap-3">
              <Link
                to={`/guide/edit/${id}`}
                className="flex items-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-400 shadow-2xl backdrop-blur-xl transition-all hover:bg-amber-400/20 active:scale-95"
                title="Edit Guide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
              <button
                onClick={handleDeleteGuide}
                className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-500 shadow-2xl backdrop-blur-xl transition-all hover:bg-rose-500/20 active:scale-95"
                title="Delete Guide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        <div className="p-8 md:p-12">
          <h1 className="mb-4 font-serif text-5xl font-black text-white">{guide.title}</h1>
          
          {guide.tags?.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {guide.tags.map((tag, idx) => (
                <span key={idx} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black tracking-widest text-white/40 uppercase">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="mb-12 flex items-center gap-4 text-amber-100/60">
            <span className="rounded-full bg-amber-400/20 px-4 py-1 text-sm font-bold text-amber-200">
              {guide.isOfficialGuide ? "Official Guide" : "Community Guide"}
            </span>
            <span>By {guide.author}</span>
            <span>•</span>
            <span>{new Date(guide.createdAt).toLocaleDateString()}</span>
            <button
              onClick={() => {
                if (!user) {
                  toast.error("Please login to report content");
                  return;
                }
                setReportTarget({ id, type: "guide" });
              }}
              className="ml-auto flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-5 py-2 text-[10px] font-black tracking-widest text-amber-400/60 uppercase transition-all hover:bg-amber-400 hover:text-black"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 01-2 2zm9-13.5V9" />
              </svg>
              REPORT 🚩
            </button>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            <div className="md:col-span-1">
              <h3 className="mb-4 font-serif text-2xl font-bold text-amber-200">
                {guide.ingredients?.length > 0 ? "Requirements & Context" : ""}
              </h3>
              <ul className="space-y-2 text-white/80">
                {guide.ingredients?.map((ing, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"></span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="mb-4 font-serif text-2xl font-bold text-amber-200">Guide Content</h3>
              <div 
                className="prose prose-invert max-w-none text-lg leading-relaxed text-white/80"
                dangerouslySetInnerHTML={{ __html: guide.instructions }}
              />
            </div>
          </div>
        </div>
      </article>

      {/* Discussion Section */}
      <section className="mt-16">
        <h2 className="mb-8 font-serif text-3xl font-bold text-white">Discussion</h2>
        
        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-12">
            <textarea
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white placeholder-white/20 focus:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              placeholder="Share your thoughts or variations..."
              rows="4"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            ></textarea>
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 rounded-full bg-amber-400 px-8 py-3 font-bold text-black transition-all hover:bg-amber-300 disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </form>
        ) : (
          <div className="mb-12 rounded-2xl border border-white/5 bg-white/5 p-6 text-center">
            <p className="text-white/60">Please login to join the discussion.</p>
          </div>
        )}

        <div className="space-y-8">
          {comments.length === 0 ? (
            <p className="text-center text-white/40">No comments yet. Be the first to start the discussion!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="flex gap-4">
                <Avatar
                  src={comment.comment_author?.profile_picture}
                  name={comment.comment_author?.name}
                  size="h-10 w-10"
                />
                <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{comment.comment_author?.name}</span>
                      <span className="text-[10px] text-white/40 uppercase tracking-widest">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(user?._id || user?.id) !== (comment.comment_author?._id || comment.comment_author?.id) && (
                        <button
                          onClick={() => {
                            if (!user) {
                              toast.error("Please login to report content");
                              return;
                            }
                            setReportTarget({ id: comment._id, type: "guide_comment" });
                          }}
                          className="flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/5 px-2 py-0.5 text-[9px] font-black tracking-widest text-rose-500/60 uppercase transition-all hover:bg-rose-500 hover:text-white"
                          title="Report Comment"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 01-2 2zm9-13.5V9" />
                          </svg>
                          REPORT 🚩
                        </button>
                      )}
                      
                      {((user?._id || user?.id) === (comment.comment_author?._id || comment.comment_author?.id) || isAdmin) && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-black tracking-widest text-white/40 uppercase transition-all hover:bg-rose-600 hover:text-white hover:border-rose-600"
                          title="Delete Comment"
                        >
                          DELETE
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-white/80">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
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

export default GuideDetailPage
