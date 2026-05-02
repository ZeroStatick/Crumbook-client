import React, { useState } from "react"
import { create_report } from "../../API/report.api"
import toast from "react-hot-toast"

const ReportModal = ({ targetId, targetType = "recipe", onClose }) => {
  const [reportData, setReportData] = useState({ sort: "other", reason: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReportSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        ...reportData,
        target_type: targetType,
      }
      if (targetType === "recipe") payload.recipe_id = targetId
      if (targetType === "comment") payload.comment_id = targetId

      await create_report(payload)
      toast.success("Incident trace recorded")
      onClose()
    } catch (error) {
      toast.error(error.message || "Submission failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#0f141d] p-10 shadow-2xl shadow-black/60 animate-in zoom-in-95 duration-300">
        <div className="mb-8">
          <p className="mb-2 inline-flex rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-1 text-[10px] font-black tracking-[0.3em] text-rose-300 uppercase">
            Security Incident
          </p>
          <h2 className="font-serif text-3xl font-black tracking-tight text-white">
            Report {targetType}
          </h2>
        </div>

        <form onSubmit={handleReportSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="ml-1 text-[10px] font-black tracking-widest text-white/40 uppercase">
              Incident Category
            </label>
            <select
              value={reportData.sort}
              onChange={(e) =>
                setReportData({ ...reportData, sort: e.target.value })
              }
              className="w-full rounded-2xl border border-white/10 bg-[#0a0f16] px-5 py-4 text-sm font-black text-amber-200 outline-none transition-all focus:border-amber-400/30"
              required
            >
              <option value="spam">Spam / Advertising</option>
              <option value="harassment">Harassment</option>
              <option value="hate_speech">Hate Speech</option>
              <option value="inappropriate_content">Inappropriate Content</option>
              <option value="copyright_infringement">Copyright Infringement</option>
              <option value="dangerous_content">Dangerous Content</option>
              <option value="off_topic">Off-topic</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="ml-1 text-[10px] font-black tracking-widest text-white/40 uppercase">
              Incident Context (Optional)
            </label>
            <textarea
              value={reportData.reason}
              onChange={(e) =>
                setReportData({ ...reportData, reason: e.target.value })
              }
              placeholder="Provide specific details about the violation..."
              className="h-32 w-full rounded-2xl border border-white/10 bg-white/5 p-5 text-white outline-none transition-all placeholder:text-white/20 focus:border-amber-400/30 focus:bg-white/10"
              maxLength={500}
            />
            <div className="flex items-center justify-between px-1">
              <span className="text-[9px] font-black tracking-widest text-white/20 uppercase italic">Confidential Submission</span>
              <span className="text-[10px] font-black tracking-widest text-white/40">
                {reportData.reason.length}/500
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="order-2 rounded-full border border-white/10 bg-white/5 px-8 py-3 text-xs font-black tracking-widest text-white/40 uppercase transition-all hover:bg-white/10 hover:text-white sm:order-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="order-1 rounded-full border border-rose-500/20 bg-rose-500/15 px-8 py-3 text-xs font-black tracking-widest text-rose-400 uppercase shadow-lg shadow-rose-950/20 transition-all hover:bg-rose-500/25 active:scale-[0.98] disabled:opacity-50 sm:order-2"
            >
              {isSubmitting ? "Transmitting..." : "Submit Incident"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReportModal
