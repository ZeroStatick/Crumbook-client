import api from "./api.api";
import { AI_URL } from "../constant/endpoints";

export const get_ai_response = async (message, history) => {
  try {
    const response = await api.post(`${AI_URL}/chat`, { message, history });
    return response;
  } catch (error) {
    throw error;
  }
};
