const { API_call } = require("./api.api.js");

const register = async (userData) => {
  const result = await API_call("/api/auth/register", "POST", userData);
  // Note: Your backend register controller currently doesn't return a token, just the user data.
  localStorage.setItem("user_data", JSON.stringify(result));
  return result;
};

const login = async (userData) => {
  const result = await API_call("/api/auth/login", "POST", userData);
  localStorage.setItem("user_data", JSON.stringify(result));
  return result;
};

const logout = () => {
  localStorage.removeItem("user_data");
};

module.exports = { register, login, logout };
