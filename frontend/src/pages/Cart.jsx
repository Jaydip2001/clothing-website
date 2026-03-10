import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import "./user-css/cart.css"

function Cart() {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem("user"))
  const navigate = useNavigate()

  /* ── LOAD ── */
  useEffect(() => {
    user ? loadUserCart() : loadGuestCart()
  }, [])

  const loadGuestCart = async () => {
    const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]")
    if (guestCart.length === 0) { setCartItems([]); setLoading(false); return }
    const res = await axios.get("http://localhost:5000/api/products")
    const items = guestCart.map((item, idx) => {
      const product = res.data.find(p => p.id === item.product_id)
      if (!product) return null
      return { ...product, quantity: item.quantity, product_id: item.product_id, size: item.size || null, _guestIdx: idx }
    }).filter(Boolean)
    setCartItems(items)
    setLoading(false)
  }

  const loadUserCart = async () => {
    const res = await axios.get(`http://localhost:5000/api/cart/${user.id}`)
    setCartItems(res.data)
    setLoading(false)
  }

  /* ── REMOVE ── */
  const removeItem = async (item) => {
    if (!user) {
      let cart = JSON.parse(localStorage.getItem("guestCart") || "[]")
      cart = cart.filter(i => !(i.product_id === item.product_id && i.size === item.size))
      localStorage.setItem("guestCart", JSON.stringify(cart))
      window.dispatchEvent(new Event("cartUpdated"))
      loadGuestCart(); return
    }
    await axios.delete(`http://localhost:5000/api/cart/remove/${item.id}`)
    window.dispatchEvent(new Event("cartUpdated"))
    loadUserCart()
  }

  /* ── UPDATE QTY ── */
  const updateQty = async (item, change) => {
    if (!user) {
      let cart = JSON.parse(localStorage.getItem("guestCart") || "[]")
      const found = cart.find(i => i.product_id === item.product_id && i.size === item.size)
      if (!found) return
      found.quantity += change
      if (found.quantity < 1) cart = cart.filter(i => !(i.product_id === item.product_id && i.size === item.size))
      localStorage.setItem("guestCart", JSON.stringify(cart))
      window.dispatchEvent(new Event("cartUpdated"))
      loadGuestCart(); return
    }
    const newQty = item.quantity + change
    if (newQty < 1) { removeItem(item); return }
    await axios.put("http://localhost:5000/api/cart/update", { cart_id: item.id, quantity: newQty })
    window.dispatchEvent(new Event("cartUpdated"))
    loadUserCart()
  }

  /* ── TOTALS ── */
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const shipping = subtotal > 999 ? 0 : 99
  const total    = subtotal + shipping

  if (loading) return <div style={{ padding: "60px", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>Loading your cart...</div>

  return (
    <div className="cart-page">

      {/* ── HEADER ── */}
      <div className="cart-header">
        <button className="cart-back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1 className="cart-header-title">
          Your Bag
          {cartItems.length > 0 && <span className="cart-header-count">({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})</span>}
        </h1>
      </div>

      <div className="cart-body">

        {cartItems.length === 0 ? (
          /* ── EMPTY ── */
          <div className="cart-empty">
            <div className="cart-empty-icon">🛍️</div>
            <h2>Your bag is empty</h2>
            <p>Looks like you haven't added anything yet.</p>
            <button className="cart-empty-btn" onClick={() => navigate("/")}>Continue Shopping</button>
          </div>
        ) : (
          <>
            {/* ── ITEMS ── */}
            <div className="cart-items">
              {cartItems.map((item, idx) => (
                <div key={`${item.product_id}-${item.size || "nosize"}-${item.id || idx}`} className="cart-item" style={{ animationDelay: `${idx * 0.06}s` }}>

                  {/* IMAGE */}
                  <Link to={`/product/${item.product_id || item.id}`}>
                    <img
                      className="cart-item-img"
                      src={`http://localhost:5000/uploads/${item.image}`}
                      alt={item.name}
                    />
                  </Link>

                  {/* INFO */}
                  <div className="cart-item-info">
                    {item.category && <p className="cart-item-category">{item.category}</p>}
                    <Link to={`/product/${item.product_id || item.id}`} style={{ textDecoration: "none" }}>
                      <p className="cart-item-name">{item.name}</p>
                    </Link>
                    <p className="cart-item-price">₹{item.price}</p>

                    {/* SIZE BADGE */}
                    {item.size && (
                      <p style={{
                        display: "inline-block",
                        fontSize: "10px", fontWeight: 700,
                        letterSpacing: "0.12em", textTransform: "uppercase",
                        border: "1.5px solid #d8d8d8", padding: "3px 10px",
                        borderRadius: "2px", color: "var(--dark-gray)",
                        marginBottom: "12px"
                      }}>
                        Size: {item.size}
                      </p>
                    )}

                    {/* QTY */}
                    <div className="cart-qty">
                      <button className="cart-qty-btn" onClick={() => updateQty(item, -1)} disabled={item.quantity <= 1}>−</button>
                      <span className="cart-qty-num">{item.quantity}</span>
                      <button className="cart-qty-btn" onClick={() => updateQty(item, 1)}>+</button>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="cart-item-right">
                    <div className="cart-item-subtotal">
                      <span>Subtotal</span>
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                    <button className="cart-remove-btn" onClick={() => removeItem(item)}>✕ Remove</button>
                  </div>

                </div>
              ))}
            </div>

            {/* ── SUMMARY ── */}
            <div className="cart-summary">
              <div className="cart-summary-header">
                <h2 className="cart-summary-title">Order Summary</h2>
              </div>
              <div className="cart-summary-body">
                <div className="cart-summary-row">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Shipping</span>
                  {shipping === 0
                    ? <span className="summary-free">FREE</span>
                    : <span>₹{shipping}</span>
                  }
                </div>
                {shipping > 0 && (
                  <div style={{ fontSize: "11px", color: "var(--mid-gray)", marginBottom: "12px" }}>
                    Add ₹{(999 - subtotal + 1).toLocaleString()} more for free shipping
                  </div>
                )}
                <div className="cart-summary-row total">
                  <span className="summary-label">Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>

                <button className="cart-checkout-btn" onClick={() => navigate("/checkout")}>
                  Proceed to Checkout
                </button>
                <button className="cart-continue-btn" onClick={() => navigate("/")}>
                  Continue Shopping
                </button>

                <p className="cart-secure-note">🔒 Secure & Encrypted Checkout</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Cart