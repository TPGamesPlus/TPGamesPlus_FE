import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import apiClient, { getErrorMessage } from '../api/client'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'
import './ProductDetails.css'

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isBuying, setIsBuying] = useState(false)
  const [buyError, setBuyError] = useState('')

  useEffect(() => {
    let isCancelled = false

    async function fetchProduct() {
      setIsLoading(true)
      setError('')
      try {
        const { data } = await apiClient.get(`/products/${id}/`)
        if (!isCancelled) {
          setProduct(data)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(getErrorMessage(err))
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchProduct()

    return () => {
      isCancelled = true
    }
  }, [id])

  async function handleBuy() {
    setBuyError('')
    setIsBuying(true)
    try {
      const { data: order } = await apiClient.post('/orders/', { product: Number(id) })
      navigate(`/orders/${order.id}`, { state: order })
    } catch (err) {
      setBuyError(getErrorMessage(err))
    } finally {
      setIsBuying(false)
    }
  }

  if (isLoading) {
    return <Spinner label="Loading product…" />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!product) {
    return null
  }

  return (
    <div className="details-page">
      <div className="details-card">
        <span className="details-badge">{product.location}</span>
        <h1 className="details-title">{product.title}</h1>
        <p className="details-description">{product.description}</p>
        <p className="details-price">${product.price}</p>

        <ErrorMessage message={buyError} />

        <button
          type="button"
          className="details-buy-btn"
          onClick={handleBuy}
          disabled={isBuying}
        >
          {isBuying ? 'Processing…' : 'Buy'}
        </button>
      </div>
    </div>
  )
}

export default ProductDetails
