import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import ProductListing from './pages/ProductListing'
import ProductDetails from './pages/ProductDetails'
import Receipt from './pages/Receipt'
import './App.css'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/products" element={<ProductListing />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/orders/:id" element={<Receipt />} />
        </Route>

        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </>
  )
}

export default App
