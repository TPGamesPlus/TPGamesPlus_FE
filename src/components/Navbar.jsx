import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import logo from '../assets/Horizontal_EN_LogoTamtam.svg'
import './Navbar.css'

function Navbar() {
  const { accessToken, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <Link to={accessToken ? '/products' : '/login'} className="navbar-brand">
        <img src={logo} alt="Tamatem Plus" className="navbar-logo" />
      </Link>

      {accessToken && (
        <button type="button" className="navbar-logout" onClick={handleLogout}>
          Log out
        </button>
      )}
    </header>
  )
}

export default Navbar
