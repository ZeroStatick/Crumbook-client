import api from "./api.api"
import { RECIPE_URL } from "../constant/endpoints"

export const create_recipe = (recipeData) => api.post(RECIPE_URL, recipeData)

export const get_all_recipes = () => api.get(RECIPE_URL)

export const get_recipe_by_id = (id) => api.get(`${RECIPE_URL}/${id}`)

export const update_recipe = (id, recipeData) => api.put(`${RECIPE_URL}/${id}`, recipeData)

export const delete_recipe = (id) => api.delete(`${RECIPE_URL}/${id}`)

export const get_recipes_by_user_id = (id) => api.get(`${RECIPE_URL}/user/${id}`)
