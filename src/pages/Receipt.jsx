import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import apiClient, { getErrorMessage } from '../api/client'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'
import './Receipt.css'

function Receipt() {
  const { id } = useParams()
  const routeState = useLocation().state
  const [order, setOrder] = useState(routeState ?? null)
  const [isLoading, setIsLoading] = useState(!routeState)
  const [error, setError] = useState('')

  useEffect(() => {
    if (routeState) {
      return
    }

    let isCancelled = false

    async function fetchOrder() {
      setIsLoading(true)
      setError('')
      try {
        const { data } = await apiClient.get(`/orders/${id}/`)
        if (!isCancelled) {
          setOrder(data)
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

    fetchOrder()

    return () => {
      isCancelled = true
    }
  }, [id, routeState])

  if (isLoading) {
    return <Spinner label="Loading receipt…" />
  }

  if (error) {
    return (
      <div className="receipt-page">
        <ErrorMessage message={error} />
        <Link className="receipt-back-link" to="/products">
          Back to products
        </Link>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="receipt-page">
        <ErrorMessage message="Order not found." />
        <Link className="receipt-back-link" to="/products">
          Back to products
        </Link>
      </div>
    )
  }

  const formattedDate = new Date(order.created_at).toLocaleString()

  return (
    <div className="receipt-page">
      <div className="receipt-card">
        <h1 className="receipt-title">Order Confirmed</h1>

        <div className="receipt-row">
          <span className="receipt-label">Order #</span>
          <span className="receipt-value">{order.id}</span>
        </div>
        <div className="receipt-row">
          <span className="receipt-label">Product</span>
          <span className="receipt-value">{order.product_title}</span>
        </div>
        <div className="receipt-row">
          <span className="receipt-label">Price</span>
          <span className="receipt-value">${order.unit_price}</span>
        </div>
        <div className="receipt-row">
          <span className="receipt-label">Location</span>
          <span className="receipt-value">{order.location}</span>
        </div>
        <div className="receipt-row">
          <span className="receipt-label">Date</span>
          <span className="receipt-value">{formattedDate}</span>
        </div>

        <Link className="receipt-back-link" to="/products">
          Back to products
        </Link>
      </div>
    </div>
  )
}

export default Receipt
