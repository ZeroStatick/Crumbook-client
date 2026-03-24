import { useState } from "react"
import { BASE_URL, REGISTER_URL } from "../../constant/endpoints"
import { NavLink, useNavigate } from "react-router-dom"
import axios from "axios"

const Register = () => {
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const navigate = useNavigate()
  const updateData = ({ target }) => {
    setRegisterData({
      ...registerData,
      [target.name]: target.value,
    })
  }
  const handleRegister = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post(
        `${BASE_URL}${REGISTER_URL}`,
        registerData,
      )
      console.log(response.data)
    } catch (e) {
      console.log("failed to register", e.response.status)
    }
  }
  return (
    <>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={updateData}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={updateData}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={updateData}
        />
        <button type="submit">Register</button>
      </form>
    </>
  )
}

export default Register
