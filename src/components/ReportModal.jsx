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
      <div className="theme-card animate-in zoom-in w-full max-w-md rounded-2xl p-6 duration-200 fade-in">
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
              className="theme-input w-full p-2.5"
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
              className="theme-input h-32 w-full p-2.5"
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
              className="theme-button-secondary rounded-lg px-4 py-2 text-sm font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="theme-button-primary rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-50"
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
