import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import "./user-css/wishlist.css"

function Wishlist() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem("user"))

  useEffect(() => {
    user ? loadUserWishlist() : loadGuestWishlist()
  }, [])

  /* ── LOAD ── */
  const loadUserWishlist = async () => {
    const res = await axios.get(`http://localhost:5000/api/wishlist/${user.id}`)
    setItems(res.data)
    setLoading(false)
  }

  const loadGuestWishlist = async () => {
    const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist") || "[]")
    if (guestWishlist.length === 0) { setItems([]); setLoading(false); return }
    const res = await axios.get("http://localhost:5000/api/products")
    const fullItems = guestWishlist.map(w => res.data.find(p => p.id === w.product_id)).filter(Boolean)
    setItems(fullItems)
    setLoading(false)
  }

  /* ── REMOVE ── */
  const removeFromWishlist = async (product_id) => {
    if (!user) {
      let w = JSON.parse(localStorage.getItem("guestWishlist") || "[]")
      w = w.filter(i => i.product_id !== product_id)
      localStorage.setItem("guestWishlist", JSON.stringify(w))
      window.dispatchEvent(new Event("wishlistUpdated"))
      loadGuestWishlist(); return
    }
    await axios.post("http://localhost:5000/api/wishlist/remove", { user_id: user.id, product_id })
    window.dispatchEvent(new Event("wishlistUpdated"))
    loadUserWishlist()
  }

  /* ── ADD TO CART ── */
  const addToCart = async (item) => {
    if (!user) {
      const cart = JSON.parse(localStorage.getItem("guestCart") || "[]")
      const exists = cart.find(i => i.product_id === item.id)
      if (exists) exists.quantity += 1
      else cart.push({ product_id: item.id, quantity: 1 })
      localStorage.setItem("guestCart", JSON.stringify(cart))
      window.dispatchEvent(new Event("cartUpdated"))
      alert("Added to cart!")
      return
    }
    await axios.post("http://localhost:5000/api/cart/add", { user_id: user.id, product_id: item.id, quantity: 1 })
    window.dispatchEvent(new Event("cartUpdated"))
    alert("Added to cart!")
  }

  if (loading) return <div style={{ padding: "60px", textAlign: "center", fontFamily: "'DM Sans',sans-serif" }}>Loading...</div>

  return (
    <div className="wishlist-page">

      {/* ── HEADER ── */}
      <div className="wishlist-header">
        <button className="wishlist-back" onClick={() => navigate(-1)}>← Back</button>
        <h1 className="wishlist-title">
          Wishlist
          {items.length > 0 && <span className="wishlist-count">({items.length} item{items.length !== 1 ? "s" : ""})</span>}
        </h1>
      </div>

      <div className="wishlist-body">
        {items.length === 0 ? (

          /* ── EMPTY ── */
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">♡</div>
            <h2>Your wishlist is empty</h2>
            <p>Save items you love and come back to them anytime.</p>
            <button className="wishlist-empty-btn" onClick={() => navigate("/")}>Start Shopping</button>
          </div>

        ) : (

          /* ── GRID ── */
          <div className="wishlist-grid">
            {items.map((item, i) => (
              <div key={item.id} className="wishlist-card" style={{ animationDelay: `${i * 0.05}s` }}>

                <div className="wishlist-card-img-wrap">
                  <img
                    src={`http://localhost:5000/uploads/${item.image}`}
                    alt={item.name}
                    onClick={() => navigate(`/product/${item.id}`)}
                    style={{ cursor: "pointer" }}
                  />

                  {/* Remove — top right */}
                  <button
                    className="wishlist-remove-btn"
                    onClick={() => removeFromWishlist(item.id)}
                    title="Remove from wishlist"
                  >✕</button>

                  {/* Add to bag — slides up */}
                  <div className="wishlist-card-actions">
                    <button className="wishlist-add-btn" onClick={() => addToCart(item)}>
                      Add to Bag
                    </button>
                  </div>
                </div>

                <div className="wishlist-card-info">
                  {item.category && <p className="wishlist-card-category">{item.category}</p>}
                  <p className="wishlist-card-name" onClick={() => navigate(`/product/${item.id}`)}>
                    {item.name}
                  </p>
                  <p className="wishlist-card-price">₹{item.price}</p>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default Wishlist