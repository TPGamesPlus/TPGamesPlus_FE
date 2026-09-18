import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient, { getErrorMessage } from '../api/client'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'
import { getItemImageUrl } from '../utils/itemImages'
import './ProductListing.css'

const PAGE_SIZE = 12
const LOCATIONS = ['ALL', 'JO', 'SA']
const FLAG_SRC = {
  JO: '/assets/flags/jo.svg',
  SA: '/assets/flags/sa.svg',
}

function getFacets(payload) {
  const facets = payload?.facets
  if (!facets || typeof facets !== 'object') {
    return { titles: [], min_price: null, max_price: null }
  }

  return {
    titles: Array.isArray(facets.titles) ? facets.titles : [],
    min_price: facets.min_price ?? null,
    max_price: facets.max_price ?? null,
  }
}

function toPriceNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function pricesMatch(left, right) {
  if (left == null || right == null) {
    return false
  }
  return Math.abs(Number(left) - Number(right)) < 0.001
}

function formatPrice(value) {
  const parsed = toPriceNumber(value)
  if (parsed == null) {
    return '—'
  }
  return `$${parsed.toFixed(2)}`
}

function LocationLabel({ location }) {
  const flagSrc = FLAG_SRC[location]

  return (
    <span className="location-label">
      {flagSrc ? <img src={flagSrc} alt="" className="location-flag" /> : null}
      {location}
    </span>
  )
}

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
      <span className="product-badge">
        <LocationLabel location={product.location} />
      </span>
    </button>
  )
}

function ProductListing() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [location, setLocation] = useState('ALL')
  const [titleFilter, setTitleFilter] = useState('')
  const [priceOrder, setPriceOrder] = useState('default')
  const [priceMin, setPriceMin] = useState(null)
  const [priceMax, setPriceMax] = useState(null)
  const [appliedPriceMin, setAppliedPriceMin] = useState(null)
  const [appliedPriceMax, setAppliedPriceMax] = useState(null)
  const [data, setData] = useState({ count: 0, next: null, previous: null, results: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const facets = getFacets(data)
  const facetMin = toPriceNumber(facets.min_price)
  const facetMax = toPriceNumber(facets.max_price)
  const hasPriceFacets = facetMin != null && facetMax != null
  const sliderMin = priceMin ?? facetMin
  const sliderMax = priceMax ?? facetMax
  const sliderDisabled = !hasPriceFacets
  const priceStep =
    hasPriceFacets && Number.isInteger(facetMin) && Number.isInteger(facetMax) ? 1 : 0.01
  const titleOptions =
    titleFilter && !facets.titles.includes(titleFilter)
      ? [titleFilter, ...facets.titles]
      : facets.titles
  const facetsRef = useRef(facets)
  const priceMinRef = useRef(priceMin)
  const priceMaxRef = useRef(priceMax)
  const appliedPriceMinRef = useRef(appliedPriceMin)
  const appliedPriceMaxRef = useRef(appliedPriceMax)
  facetsRef.current = facets
  priceMinRef.current = priceMin
  priceMaxRef.current = priceMax
  appliedPriceMinRef.current = appliedPriceMin
  appliedPriceMaxRef.current = appliedPriceMax

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
        if (titleFilter) {
          params.title = titleFilter
        }
        if (priceOrder === 'asc') {
          params.ordering = 'price'
        } else if (priceOrder === 'desc') {
          params.ordering = '-price'
        }
        const currentFacetMin = toPriceNumber(facetsRef.current.min_price)
        const currentFacetMax = toPriceNumber(facetsRef.current.max_price)
        const atFullSpan =
          currentFacetMin != null &&
          currentFacetMax != null &&
          pricesMatch(appliedPriceMin, currentFacetMin) &&
          pricesMatch(appliedPriceMax, currentFacetMax)
        if (appliedPriceMin != null && appliedPriceMax != null && !atFullSpan) {
          params.min_price = appliedPriceMin
          params.max_price = appliedPriceMax
        }
        const { data: responseData } = await apiClient.get('/products/', { params })
        if (!isCancelled) {
          setData(responseData)
          const nextFacets = getFacets(responseData)
          const nextMin = toPriceNumber(nextFacets.min_price)
          const nextMax = toPriceNumber(nextFacets.max_price)
          if (nextMin != null && nextMax != null) {
            setPriceMin((current) => (current == null ? nextMin : current))
            setPriceMax((current) => (current == null ? nextMax : current))
          }
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
  }, [page, location, titleFilter, priceOrder, appliedPriceMin, appliedPriceMax])

  function clearPriceRange() {
    setPriceMin(null)
    setPriceMax(null)
    setAppliedPriceMin(null)
    setAppliedPriceMax(null)
  }

  function commitPriceRange() {
    const nextMin = priceMinRef.current
    const nextMax = priceMaxRef.current
    if (nextMin == null || nextMax == null) {
      return
    }

    const currentMin = appliedPriceMinRef.current
    const currentMax = appliedPriceMaxRef.current
    if (pricesMatch(nextMin, currentMin) && pricesMatch(nextMax, currentMax)) {
      return
    }

    const facetMinBound = toPriceNumber(facetsRef.current.min_price)
    const facetMaxBound = toPriceNumber(facetsRef.current.max_price)
    const stillFullSpan =
      currentMin == null &&
      currentMax == null &&
      pricesMatch(nextMin, facetMinBound) &&
      pricesMatch(nextMax, facetMaxBound)
    if (stillFullSpan) {
      return
    }

    setAppliedPriceMin(nextMin)
    setAppliedPriceMax(nextMax)
    setPage(1)
  }

  function handleLocationChange(newLocation) {
    setLocation(newLocation)
    setPage(1)
    clearPriceRange()
  }

  function handleTitleChange(event) {
    setTitleFilter(event.target.value)
    setPage(1)
    clearPriceRange()
  }

  function handleOrderChange(event) {
    setPriceOrder(event.target.value)
    setPage(1)
  }

  function handlePriceMinChange(event) {
    const next = Math.min(Number(event.target.value), priceMaxRef.current ?? Number(event.target.value))
    priceMinRef.current = next
    setPriceMin(next)
  }

  function handlePriceMaxChange(event) {
    const next = Math.max(Number(event.target.value), priceMinRef.current ?? Number(event.target.value))
    priceMaxRef.current = next
    setPriceMax(next)
  }

  const span = hasPriceFacets ? facetMax - facetMin || 1 : 1
  const fillLeft = hasPriceFacets && sliderMin != null ? ((sliderMin - facetMin) / span) * 100 : 0
  const fillRight = hasPriceFacets && sliderMax != null ? ((facetMax - sliderMax) / span) * 100 : 0

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
              <LocationLabel location={loc} />
            </button>
          ))}
        </div>
      </div>

      <div className="listing-filters">
        <label className="listing-filter">
          <span className="listing-filter-label">Game title</span>
          <select
            className="listing-filter-select"
            value={titleFilter}
            onChange={handleTitleChange}
          >
            <option value="">All titles</option>
            {titleOptions.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
        </label>

        <label className="listing-filter">
          <span className="listing-filter-label">Order by price</span>
          <select
            className="listing-filter-select"
            value={priceOrder}
            onChange={handleOrderChange}
          >
            <option value="default">Default</option>
            <option value="asc">Price: low to high</option>
            <option value="desc">Price: high to low</option>
          </select>
        </label>

        <div className="listing-filter listing-filter-range">
          <span className="listing-filter-label">Price range</span>
          <span className="price-range-values">
            {formatPrice(sliderMin)} – {formatPrice(sliderMax)}
          </span>
          <div className={`price-range-slider${sliderDisabled ? ' disabled' : ''}`}>
            <div className="price-range-rail">
              <div
                className="price-range-fill"
                style={{ left: `${fillLeft}%`, right: `${fillRight}%` }}
              />
            </div>
            <input
              type="range"
              className="price-range-thumb price-range-thumb-min"
              min={facetMin ?? 0}
              max={facetMax ?? 0}
              step={priceStep}
              value={sliderMin ?? 0}
              disabled={sliderDisabled}
              aria-label="Minimum price"
              onChange={handlePriceMinChange}
              onPointerUp={commitPriceRange}
              onKeyUp={commitPriceRange}
            />
            <input
              type="range"
              className="price-range-thumb price-range-thumb-max"
              min={facetMin ?? 0}
              max={facetMax ?? 0}
              step={priceStep}
              value={sliderMax ?? 0}
              disabled={sliderDisabled}
              aria-label="Maximum price"
              onChange={handlePriceMaxChange}
              onPointerUp={commitPriceRange}
              onKeyUp={commitPriceRange}
            />
          </div>
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
