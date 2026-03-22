async function API_call(path, method, body) {
  method = method || "GET";
  const options = { method, headers: {} };
  if (body) {
    options.body = JSON.stringify(body);
    options.headers["content-type"] = "application/json";
  }
  const user_json = localStorage.getItem("user_data");
  if (user_json) {
    const user_data = JSON.parse(user_json);
    const token = user_data.token;
    // The backend already includes the "Bearer " prefix in the token string!
    options.headers["authorization"] = token;
  }
  const response = await fetch(path, options);
  const response_body = await response.json();
  if (!response_body.success) {
    throw new Error(response_body.message);
  }
  return response_body.result;
}

const get_all_users = () => API_call("/api/users");

const edit_user = (user_id, new_user_data) =>
  API_call(`/api/users/${user_id}`, "PUT", new_user_data);

const delete_user = (user_id) => API_call(`/api/users/${user_id}`, "DELETE");

module.exports = { API_call, get_all_users, edit_user, delete_user };
