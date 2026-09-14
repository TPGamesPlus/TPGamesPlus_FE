import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient, { getErrorMessage } from '../api/client'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'
import { getItemImageUrl } from '../utils/itemImages'
import './ProductListing.css'

const PAGE_SIZE = 12
const LOCATIONS = ['ALL', 'JO', 'SA']

function ProductCard({ product, onClick }) {
  const imageUrl = getItemImageUrl(product.title)
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <button type="button" className="product-card" onClick={onClick}>
      <div className="product-image-frame">
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="product-image"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="product-image-placeholder">
            <span className="product-image-placeholder-text">{product.title}</span>
          </div>
        )}
      </div>
      <span className="product-title">{product.title}</span>
      <span className="product-price">${product.price}</span>
      <span className="product-badge">{product.location}</span>
    </button>
  )
}

function ProductListing() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [location, setLocation] = useState('ALL')
  const [data, setData] = useState({ count: 0, next: null, previous: null, results: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCancelled = false

    async function fetchProducts() {
      setIsLoading(true)
      setError('')
      try {
        const params = { page, page_size: PAGE_SIZE }
        if (location !== 'ALL') {
          params.location = location
        }
        const { data: responseData } = await apiClient.get('/products/', { params })
        if (!isCancelled) {
          setData(responseData)
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

    fetchProducts()

    return () => {
      isCancelled = true
    }
  }, [page, location])

  function handleLocationChange(newLocation) {
    setLocation(newLocation)
    setPage(1)
  }

  return (
    <div className="listing-page">
      <div className="listing-header">
        <h1>Products</h1>
        <div className="location-filter">
          {LOCATIONS.map((loc) => (
            <button
              key={loc}
              type="button"
              className={`location-filter-btn${location === loc ? ' active' : ''}`}
              onClick={() => handleLocationChange(loc)}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      <ErrorMessage message={error} />

      {isLoading ? (
        <Spinner label="Loading products…" />
      ) : data.results.length === 0 ? (
        <p className="listing-status">No products found.</p>
      ) : (
        <div className="product-grid">
          {data.results.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => navigate(`/products/${product.id}`)}
            />
          ))}
        </div>
      )}

      <div className="listing-pagination">
        <button
          type="button"
          disabled={!data.previous || isLoading}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Previous
        </button>
        <span className="listing-count">{data.count} total</span>
        <button
          type="button"
          disabled={!data.next || isLoading}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default ProductListing
