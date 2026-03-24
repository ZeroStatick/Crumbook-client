import api from "./api.api"
import { INGREDIENT_URL } from "../constant/endpoints"

export const get_all_ingredients = (category) => {
  const url = category ? `${INGREDIENT_URL}?category=${category}` : INGREDIENT_URL
  return api.get(url)
}

export const add_ingredient = (ingredientData) => api.post(INGREDIENT_URL, ingredientData)

export const get_ingredient_by_id = (id) => api.get(`${INGREDIENT_URL}/${id}`)
