import './Spinner.css'

function Spinner({ label = 'Loading…' }) {
  return (
    <div className="spinner-wrap" role="status" aria-live="polite">
      <span className="spinner" />
      <span className="spinner-label">{label}</span>
    </div>
  )
}

export default Spinner
