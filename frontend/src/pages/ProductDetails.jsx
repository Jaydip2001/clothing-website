import { useEffect, useState } from "react"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)

  const user = JSON.parse(localStorage.getItem("user"))

  /* ================= REVIEWS STATE ================= */
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")


  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    const fetchProduct = async () => {
      const res = await axios.get(
        `http://localhost:5000/api/products/${id}`
      )
      setProduct(res.data)
    }

    fetchProduct()
  }, [id])


  /* ================= FETCH REVIEWS ================= */
  const fetchReviews = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/reviews/product/${id}`
    )
    setReviews(res.data)
  }

  useEffect(() => {
    fetchReviews()
  }, [id])


  /* ================= SUBMIT REVIEW ================= */
  const submitReview = async () => {

    if (!user) {
      alert("Please login to submit a review")
      return
    }

    if (!comment.trim()) {
      alert("Please write a comment")
      return
    }

    try {
      await axios.post("http://localhost:5000/api/reviews/add", {
        product_id: id,
        user_id: user.id,
        rating,
        comment
      })

      setComment("")
      setRating(5)
      fetchReviews()   // ✅ refresh reviews after submit

    } catch (err) {
      alert("Failed to submit review")
    }
  }


  /* ================= ADD TO CART ================= */
  const addToCart = async () => {
    if (!product) return

    if (!user) {
      let guestCart =
        JSON.parse(localStorage.getItem("guestCart")) || []

      const existing = guestCart.find(
        item => item.product_id === product.id
      )

      if (existing) {
        existing.quantity += quantity
      } else {
        guestCart.push({
          product_id: product.id,
          quantity: quantity
        })
      }

      localStorage.setItem("guestCart", JSON.stringify(guestCart))
      alert("Added to cart 🛒")
      return
    }

    await axios.post("http://localhost:5000/api/cart/add", {
      user_id: user.id,
      product_id: product.id,
      quantity: quantity
    })

    alert("Added to cart 🛒")
  }


  /* ================= ADD TO WISHLIST ================= */
  const addToWishlist = async () => {
    if (!product) return

    if (!user) {
      let guestWishlist =
        JSON.parse(localStorage.getItem("guestWishlist")) || []

      const exists = guestWishlist.some(
        item => item.product_id === product.id
      )

      if (exists) {
        alert("Already in wishlist ❤️")
        return
      }

      guestWishlist.push({ product_id: product.id })
      localStorage.setItem("guestWishlist", JSON.stringify(guestWishlist))
      alert("Added to wishlist ❤️")
      return
    }

    try {
      await axios.post("http://localhost:5000/api/wishlist/add", {
        user_id: user.id,
        product_id: product.id
      })
      alert("Added to wishlist ❤️")
    } catch {
      alert("Already in wishlist ❤️")
    }
  }


  if (!product) return <h2>Loading...</h2>

  return (
    <div style={{ padding: "30px" }}>

      {/* ================= PRODUCT SECTION ================= */}
      <div style={{ display: "flex", gap: "40px" }}>

        {/* LEFT — IMAGE */}
        <div style={{ flex: 1 }}>
          <img
            src={`http://localhost:5000/uploads/${product.image}`}
            alt={product.name}
            width="100%"
            style={{ maxWidth: "400px" }}
          />
        </div>

        {/* RIGHT — DETAILS */}
        <div style={{ flex: 1 }}>
          <h2>{product.name}</h2>
          <h3 style={{ color: "green" }}>₹{product.price}</h3>

          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            High quality fabric. Premium design. Comfortable fit.
          </p>

          {/* QUANTITY */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ marginRight: "10px" }}>Quantity:</label>

            <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}>
              -
            </button>

            <span style={{ margin: "0 15px" }}>{quantity}</span>

            <button onClick={() => setQuantity(quantity + 1)}>
              +
            </button>
          </div>

          {/* BUTTONS */}
          <button
            onClick={addToCart}
            style={{
              background: "#f0c14b",
              padding: "10px 20px",
              border: "none",
              cursor: "pointer",
              marginBottom: "10px"
            }}
          >
            🛒 Add to Cart
          </button>

          <br />

          <button
            onClick={() =>
              navigate("/checkout", {
                state: { product: product, quantity: quantity }
              })
            }
            style={{
              background: "orange",
              padding: "10px 20px",
              border: "none",
              cursor: "pointer",
              marginBottom: "10px"
            }}
          >
            Buy Now
          </button>

          <br />

          <button
            onClick={addToWishlist}
            style={{
              padding: "10px 20px",
              border: "1px solid #ccc",
              cursor: "pointer"
            }}
          >
            ❤️ Add to Wishlist
          </button>

          <br /><br />

          <button onClick={() => navigate("/")}>
            ⬅ Back to Home
          </button>
        </div>
      </div>


      <hr style={{ margin: "40px 0" }} />


      {/* ================= REVIEWS SECTION ================= */}
      <div>
        <h2>Customer Reviews ({reviews.length})</h2>

        {/* ===== SHOW REVIEWS ===== */}
        {reviews.length === 0 ? (

          <p style={{ color: "gray" }}>
            No reviews yet. Be the first to review!
          </p>

        ) : (

          reviews.map(r => (
            <div
              key={r.id}
              style={{
                border: "1px solid #eee",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
                background: "#fafafa"
              }}
            >
              {/* STARS */}
              <div style={{ color: "#f5a623", fontSize: "18px" }}>
                {"⭐".repeat(r.rating)}
                <span style={{ color: "#333", fontSize: "14px", marginLeft: "8px" }}>
                  {r.rating}/5
                </span>
              </div>

              {/* USER & DATE */}
              <p style={{ fontWeight: "bold", margin: "5px 0" }}>
                {r.user_name}
                <span style={{ fontWeight: "normal", color: "gray", fontSize: "13px", marginLeft: "10px" }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </p>

              {/* COMMENT */}
              <p style={{ margin: "5px 0" }}>{r.comment}</p>

              {/* ADMIN REPLY */}
              {r.admin_reply && (
                <div style={{
                  background: "#e8f4fd",
                  borderLeft: "3px solid #2196F3",
                  padding: "8px 12px",
                  marginTop: "8px",
                  borderRadius: "4px"
                }}>
                  <b>🏪 Store Reply:</b> {r.admin_reply}
                </div>
              )}
            </div>
          ))

        )}


        <hr style={{ margin: "30px 0" }} />


        {/* ===== WRITE A REVIEW ===== */}
        <h3>Write a Review</h3>

        {!user ? (

          <p style={{ color: "gray" }}>
            Please <b
              style={{ cursor: "pointer", color: "blue" }}
              onClick={() => navigate("/login")}
            >
              login
            </b> to write a review.
          </p>

        ) : (

          <div>

            {/* STAR RATING */}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ marginRight: "10px" }}>Rating:</label>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    fontSize: "24px",
                    cursor: "pointer",
                    color: star <= rating ? "#f5a623" : "#ccc"
                  }}
                >
                  ★
                </span>
              ))}
              <span style={{ marginLeft: "10px", color: "gray" }}>
                {rating}/5
              </span>
            </div>

            {/* COMMENT */}
            <textarea
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                maxWidth: "500px",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "14px"
              }}
            />

            <br /><br />

            <button
              onClick={submitReview}
              style={{
                background: "#2196F3",
                color: "white",
                padding: "10px 25px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "15px"
              }}
            >
              Submit Review ✅
            </button>

          </div>

        )}

      </div>
    </div>
  )
}

export default ProductDetails