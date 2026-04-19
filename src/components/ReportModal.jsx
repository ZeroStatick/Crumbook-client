import React, { useState } from "react"
import { create_report } from "../../API/report.api" // Fixed path: src/components/ to API/
import toast from "react-hot-toast"

const ReportModal = ({ recipeId, onClose }) => {
  const [reportData, setReportData] = useState({ sort: "other", reason: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReportSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await create_report({
        ...reportData,
        recipe_id: recipeId,
      })
      toast.success("Report submitted successfully")
      onClose()
    } catch (error) {
      toast.error(error.message || "Failed to submit report")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Report Recipe</h2>
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Reason for reporting
            </label>
            <select
              value={reportData.sort}
              onChange={(e) =>
                setReportData({ ...reportData, sort: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-orange-500"
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
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Details (Optional)
            </label>
            <textarea
              value={reportData.reason}
              onChange={(e) =>
                setReportData({ ...reportData, reason: e.target.value })
              }
              placeholder="Provide more context..."
              className="h-32 w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-orange-500"
              maxLength={500}
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {reportData.reason.length}/500
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
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
