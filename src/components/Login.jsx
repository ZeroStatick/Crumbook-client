import { useState } from "react"
import { BASE_URL, LOGIN_URL } from "../../constant/endpoints"
import { NavLink, useNavigate } from "react-router-dom"

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  const navigate = useNavigate()

  const formHandle = ({ target }) => {
    setLoginData({
      ...loginData,
      [target.name]: target.value,
    })
  }

  const loginSuccessSave = (token) => {
    localStorage.setItem("token", token)
    console.log("token saved")
    navigate("/")
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post(`${BASE_URL}${LOGIN_URL}`, loginData)
      const token = response.data.token

      if (token) {
        loginSuccessSave(token)
      } else {
        alert(response.data.message)
      }
    } catch (e) {
      console.log("failed to log", e)
    }
  }
  return (
    <>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={formHandle}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={formHandle}
        />
        <button type="submit">Login</button>
      </form>
    </>
  )
}

export default Login
