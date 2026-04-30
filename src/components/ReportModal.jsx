import React, { useState } from "react"
import { create_report } from "../../API/report.api" // Fixed path: src/components/ to API/
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
      toast.success("Report submitted successfully")
      onClose()
    } catch (error) {
      toast.error(error.message || "Failed to submit report")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#52250d]/40 p-4 backdrop-blur-sm">
      <div className="bg-[#10141e]/95 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] animate-in zoom-in w-full max-w-md rounded-2xl p-6 duration-200 fade-in">
        <h2 className="mb-4 text-xl font-bold text-cb-text">
          Report {targetType === "recipe" ? "Recipe" : "Comment"}
        </h2>
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-cb-text-soft">
              Reason for reporting
            </label>
            <select
              value={reportData.sort}
              onChange={(e) =>
                setReportData({ ...reportData, sort: e.target.value })
              }
              className="rounded-2xl border border-white/15 bg-white/10 text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all w-full p-2.5"
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

          <div>
            <label className="mb-1 block text-sm font-medium text-cb-text-soft">
              Details (Optional)
            </label>
            <textarea
              value={reportData.reason}
              onChange={(e) =>
                setReportData({ ...reportData, reason: e.target.value })
              }
              placeholder="Provide more context..."
              className="rounded-2xl border border-white/15 bg-white/10 text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all h-32 w-full p-2.5"
              maxLength={500}
            />
            <p className="mt-1 text-right text-xs text-cb-text-soft/75">
              {reportData.reason.length}/500
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl font-bold text-[#f3d8b0] bg-white/10 border border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.18)] hover:bg-white/15 active:scale-95 transition-all rounded-lg px-4 py-2 text-sm font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl font-bold text-white bg-gradient-to-br from-[#b45309] to-[#d88b1c] shadow-[0_12px_30px_rgba(216,139,28,0.26)] hover:brightness-105 active:scale-95 transition-all rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReportModal
