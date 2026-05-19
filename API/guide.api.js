import api from "./api.api";

export const get_all_guides = () => api.get("/api/guides");

export const get_guide_by_id = (id) => api.get(`/api/guides/${id}`);

export const create_guide = (data) => api.post("/api/guides", data);

export const update_guide = (id, data) => api.put(`/api/guides/${id}`, data);

export const generate_guide = (customPrompt = "") => api.post("/api/guides/generate", { customPrompt });

export const delete_guide = (id) => api.delete(`/api/guides/${id}`);

export const add_guide_comment = (id, text) => api.post(`/api/guides/${id}/comments`, { text });

export const delete_guide_comment = (guideId, commentId) => api.delete(`/api/guides/${guideId}/comments/${commentId}`);
