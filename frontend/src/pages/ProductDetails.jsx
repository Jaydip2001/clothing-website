import { useEffect, useState } from "react"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"
import "./user-css/productdetails.css"

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))

  const [product, setProduct]   = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [reviews, setReviews]   = useState([])
  const [rating, setRating]     = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment]   = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [activeImg, setActiveImg] = useState(0)

  /* ── FETCH PRODUCT ── */
  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(res => setProduct(res.data))
  }, [id])

  /* ── FETCH REVIEWS ── */
  const fetchReviews = async () => {
    const res = await axios.get(`http://localhost:5000/api/reviews/product/${id}`)
    setReviews(res.data)
  }
  useEffect(() => { fetchReviews() }, [id])

  /* ── AVG RATING ── */
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const renderStars = (n) => {
    const f = Math.round(n || 0)
    return "★".repeat(f) + "☆".repeat(5 - f)
  }

  /* ── SUBMIT REVIEW ── */
  const submitReview = async () => {
    if (!user)          { alert("Please login to submit a review"); return }
    if (!comment.trim()) { alert("Please write a comment"); return }
    try {
      await axios.post("http://localhost:5000/api/reviews/add", {
        product_id: id, user_id: user.id, rating, comment
      })
      setComment(""); setRating(5)
      fetchReviews()
    } catch { alert("Failed to submit review") }
  }

  /* ── ADD TO CART ── */
  const addToCart = async () => {
    if (!product) return

    // if product has sizes, size must be selected
    if (product.sizes && !selectedSize) {
      alert("Please select a size first")
      return
    }

    if (!user) {
      const cart = JSON.parse(localStorage.getItem("guestCart") || "[]")
      // same product + same size = same item, different size = different item
      const existing = cart.find(i => i.product_id === product.id && i.size === (selectedSize || null))
      if (existing) existing.quantity += quantity
      else cart.push({ product_id: product.id, quantity, size: selectedSize || null })
      localStorage.setItem("guestCart", JSON.stringify(cart))
      window.dispatchEvent(new Event("cartUpdated"))
      alert("Added to cart!")
      return
    }
    await axios.post("http://localhost:5000/api/cart/add", {
      user_id: user.id, product_id: product.id, quantity, size: selectedSize || null
    })
    window.dispatchEvent(new Event("cartUpdated"))
    alert("Added to cart!")
  }

  /* ── ADD TO WISHLIST ── */
  const addToWishlist = async () => {
    if (!product) return
    if (!user) {
      const w = JSON.parse(localStorage.getItem("guestWishlist") || "[]")
      if (w.some(i => i.product_id === product.id)) { alert("Already in wishlist"); return }
      w.push({ product_id: product.id })
      localStorage.setItem("guestWishlist", JSON.stringify(w))
      window.dispatchEvent(new Event("wishlistUpdated"))
      alert("Added to wishlist!")
      return
    }
    try {
      await axios.post("http://localhost:5000/api/wishlist/add", { user_id: user.id, product_id: product.id })
      window.dispatchEvent(new Event("wishlistUpdated"))
      alert("Added to wishlist!")
    } catch { alert("Already in wishlist") }
  }

  if (!product) return <div className="pd-loading">Loading...</div>

  return (
    <div className="pd-page">

      {/* ── BREADCRUMB ── */}
      <div className="pd-breadcrumb">
        <span className="pd-breadcrumb-link" onClick={() => navigate("/")}>Home</span>
        <span className="pd-breadcrumb-sep">›</span>
        {product.category && (
          <>
            <span className="pd-breadcrumb-link"
              onClick={() => navigate(`/products?category=${product.category_id}`)}>
              {product.category}
            </span>
            <span className="pd-breadcrumb-sep">›</span>
          </>
        )}
        <span className="pd-breadcrumb-current">{product.name}</span>
      </div>

      {/* ── MAIN — IMAGE + INFO ── */}
      <div className="pd-main">

        {/* LEFT — IMAGE GALLERY */}
        <div className="pd-image-wrap">
          {/* Main image */}
          <div className="pd-main-img">
            <img
              src={`http://localhost:5000/uploads/${
                product.images && product.images.length > 0
                  ? product.images[activeImg]?.image
                  : product.image
              }`}
              alt={product.name}
            />
          </div>
          {/* Thumbnails — only show if multiple images */}
          {product.images && product.images.length > 1 && (
            <div className="pd-thumbnails">
              {product.images.map((img, i) => (
                <div
                  key={img.id}
                  className={`pd-thumb ${activeImg === i ? "active" : ""}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={`http://localhost:5000/uploads/${img.image}`} alt={`view ${i + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — DETAILS */}
        <div className="pd-info">

          {product.category && (
            <span className="pd-category-tag">{product.category}
              {product.subcategory && ` › ${product.subcategory}`}
            </span>
          )}

          <h1 className="pd-name">{product.name}</h1>
          <p className="pd-price">₹{product.price}</p>

          {/* avg rating */}
          {avgRating && (
            <div className="pd-rating-summary">
              <span className="pd-rating-stars">{renderStars(avgRating)}</span>
              <span className="pd-rating-text">{avgRating} / 5 · {reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
            </div>
          )}

          <p className="pd-description">
            {product.description || "High quality fabric. Premium design. Comfortable fit. A timeless piece for your wardrobe."}
          </p>

          {/* SIZES */}
          {product.sizes && (
            <div style={{ marginBottom: "28px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--dark-gray)", marginBottom: "12px" }}>
                Select Size
                {selectedSize
                  ? <span style={{ color: "var(--accent)", marginLeft: "8px" }}>— {selectedSize}</span>
                  : <span style={{ color: "var(--danger)", marginLeft: "8px", fontWeight: 400, letterSpacing: 0, textTransform: "none", fontSize: "11px" }}>* Required</span>
                }
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {product.sizes.split(",").map(s => s.trim()).filter(Boolean).map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size === selectedSize ? "" : size)}
                    style={{
                      minWidth: "48px", height: "48px", padding: "0 12px",
                      border: `1.5px solid ${selectedSize === size ? "var(--black)" : "#d8d8d8"}`,
                      background: selectedSize === size ? "var(--black)" : "var(--white)",
                      color: selectedSize === size ? "var(--white)" : "var(--black)",
                      fontFamily: "var(--font-body)", fontSize: "12px",
                      fontWeight: 700, cursor: "pointer",
                      borderRadius: "2px", transition: "all 0.2s"
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUANTITY */}
          <div className="pd-qty-row">
            <span className="pd-qty-label">Quantity</span>
            <div className="pd-qty-controls">
              <button className="pd-qty-btn" onClick={() => quantity > 1 && setQuantity(q => q - 1)} disabled={quantity <= 1}>−</button>
              <span className="pd-qty-num">{quantity}</span>
              <button className="pd-qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="pd-actions">
            <button className="pd-btn-cart" onClick={addToCart}>Add to Bag</button>
            <button className="pd-btn-buynow" onClick={() =>
              navigate("/checkout", { state: { product, quantity } })
            }>
              Buy Now
            </button>
            <button className="pd-btn-wish" onClick={addToWishlist}>
              ♡ &nbsp; Add to Wishlist
            </button>
          </div>

          <button className="pd-back-link" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </div>

      <hr className="pd-divider" />

      {/* ── REVIEWS ── */}
      <div className="pd-reviews">
        <div className="pd-reviews-header">
          <h2 className="pd-reviews-title">
            Customer <span>Reviews</span>
          </h2>
          <span className="pd-reviews-count">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
        </div>

        {/* LIST */}
        {reviews.length === 0 ? (
          <p className="pd-no-reviews">No reviews yet — be the first to share your experience!</p>
        ) : (
          <div className="pd-review-list">
            {reviews.map(r => (
              <div key={r.id} className="pd-review-card">
                <div className="pd-review-top">
                  <span className="pd-review-stars">{renderStars(r.rating)}</span>
                  <span className="pd-review-date">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <p className="pd-review-author">{r.user_name}</p>
                <p className="pd-review-comment">{r.comment}</p>
                {r.admin_reply && (
                  <div className="pd-review-reply">
                    <b>🏪 Store Reply:</b> {r.admin_reply}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* WRITE REVIEW */}
        <div className="pd-write-review">
          <h3 className="pd-write-review-title">Write a Review</h3>

          {!user ? (
            <p className="pd-login-prompt">
              Please <b onClick={() => navigate("/login")}>sign in</b> to write a review.
            </p>
          ) : (
            <>
              {/* STARS */}
              <div className="pd-star-row">
                <span className="pd-star-label">Your Rating</span>
                <div className="pd-star-picker">
                  {[1,2,3,4,5].map(star => (
                    <span
                      key={star}
                      className={star <= (hoverRating || rating) ? "pd-star-active" : "pd-star-inactive"}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >★</span>
                  ))}
                </div>
              </div>

              {/* COMMENT */}
              <textarea
                className="pd-textarea"
                placeholder="Share your experience with this product..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
              />

              <button className="pd-submit-btn" onClick={submitReview}>
                Submit Review
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  )
}

export default ProductDetails