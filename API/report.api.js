import api from "./api.api"
import { REPORT_URL } from "../constant/endpoints"

export const get_all_reports = () => api.get(REPORT_URL)

export const create_report = (reportData) => api.post(REPORT_URL, reportData)

export const update_report_status = (id, status) => api.patch(`${REPORT_URL}/${id}`, { status })

export const delete_report = (id) => api.delete(`${REPORT_URL}/${id}`)
