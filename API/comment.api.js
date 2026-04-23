import api from "./api.api"
import { COMMENT_URL } from "../constant/endpoints"

export const create_comment = (commentData) => api.post(COMMENT_URL, commentData)

export const get_comments_by_recipe = (recipeId) =>
  api.get(`${COMMENT_URL}/recipe/${recipeId}`)

export const update_comment = (id, commentData) =>
  api.put(`${COMMENT_URL}/${id}`, commentData)

export const delete_comment = (id) => api.delete(`${COMMENT_URL}/${id}`)
