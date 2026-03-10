import { useState, useEffect } from "react"
import axios from "axios"
import { useLocation, useNavigate } from "react-router-dom"
import "./user-css/checkout.css"

function Checkout() {
  const user     = JSON.parse(localStorage.getItem("user"))
  const location = useLocation()
  const navigate = useNavigate()

  const directProduct = location.state?.product
  const directQty     = location.state?.quantity || 1

  const [cartItems, setCartItems]       = useState([])
  const [fullName, setFullName]         = useState(user?.name || "")
  const [phone, setPhone]               = useState("")
  const [address, setAddress]           = useState("")
  const [city, setCity]                 = useState("")
  const [state, setState]               = useState("")
  const [pincode, setPincode]           = useState("")
  const [paymentMethod, setPaymentMethod] = useState("COD")
  const [upiId, setUpiId]               = useState("")
  const [cardNumber, setCardNumber]   = useState("")
  const [cardName, setCardName]       = useState("")
  const [cardExpiry, setCardExpiry]   = useState("")
  const [cardCvv, setCardCvv]         = useState("")
  const [placing, setPlacing]         = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  /* ── LOAD CART ── */
  useEffect(() => {
    if (directProduct) return
    const fetchCart = async () => {
      if (user) {
        const res = await axios.get(`http://localhost:5000/api/cart/${user.id}`)
        setCartItems(res.data)
      } else {
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]")
        // fetch product details for guest cart
        const prodRes = await axios.get("http://localhost:5000/api/products")
        const full = guestCart.map(i => {
          const p = prodRes.data.find(p => p.id === i.product_id)
          return p ? { ...p, quantity: i.quantity, product_id: i.product_id, size: i.size } : null
        }).filter(Boolean)
        setCartItems(full)
      }
    }
    fetchCart()
  }, [])

  /* ── TOTALS ── */
  const subtotal = directProduct
    ? directProduct.price * directQty
    : cartItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const shipping = subtotal > 999 ? 0 : 99
  const total    = subtotal + shipping

  /* ── FORMAT HELPERS ── */
  const formatCardNumber = (val) =>
    val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim()
  const formatExpiry = (val) => {
    const clean = val.replace(/\D/g, "").slice(0, 4)
    return clean.length >= 3 ? clean.slice(0, 2) + "/" + clean.slice(2) : clean
  }

  /* ── VALIDATION ── */
  const isValid = fullName && phone && address && city && state && pincode &&
    (paymentMethod !== "UPI"  || upiId) &&
    (paymentMethod !== "Card" || (cardNumber && cardName && cardExpiry && cardCvv))

  /* ── PLACE ORDER ── */
  const placeOrder = async () => {
    if (!user) { alert("Please login first"); return }
    if (!isValid) return
    setPlacing(true)
    try {
      const items = directProduct
        ? [{ product_id: directProduct.id, quantity: directQty, price: directProduct.price }]
        : cartItems.map(i => ({ product_id: i.product_id || i.id, quantity: i.quantity, price: i.price }))

      await axios.post("http://localhost:5000/api/orders/create", {
        user_id: user.id,
        total_amount: total,
        payment_method: paymentMethod,
        upi_id: upiId,
        items,
        address: { full_name: fullName, phone, address, city, state, pincode }
      })

      setOrderSuccess(true)
    } catch (err) {
      alert("Order failed. Please try again.")
      console.error(err)
    } finally {
      setPlacing(false)
    }
  }

  const displayItems = directProduct
    ? [{ ...directProduct, quantity: directQty, product_id: directProduct.id }]
    : cartItems

  const paymentOptions = [
    { id: "COD",  icon: "📦", label: "Cash on Delivery",     desc: "Pay when your order arrives" },
    { id: "UPI",  icon: "📱", label: "UPI Payment",          desc: "Google Pay, PhonePe, Paytm" },
    { id: "Card", icon: "💳", label: "Debit / Credit Card",  desc: "Visa, Mastercard, RuPay" },
  ]

  return (
    <div className="checkout-page">

      {/* ── HEADER ── */}
      <div className="checkout-header">
        <button className="checkout-back" onClick={() => navigate(-1)}>← Back</button>
        <h1 className="checkout-header-title">Checkout</h1>
      </div>

      {/* ── STEPS ── */}
      <div className="checkout-steps">
        <div className="checkout-step done">
          <div className="checkout-step-num">✓</div>
          <span>Bag</span>
        </div>
        <div className="checkout-step-line" />
        <div className="checkout-step active">
          <div className="checkout-step-num">2</div>
          <span>Details</span>
        </div>
        <div className="checkout-step-line" />
        <div className="checkout-step">
          <div className="checkout-step-num">3</div>
          <span>Confirm</span>
        </div>
      </div>

      <div className="checkout-body">

        {/* ── LEFT ── */}
        <div>

          {/* SHIPPING ADDRESS */}
          <div className="checkout-card">
            <div className="checkout-card-header">
              <div className="checkout-card-num">1</div>
              <h2>Shipping Address</h2>
            </div>
            <div className="checkout-card-body">
              <div className="checkout-form">
                <div className="checkout-form-row">
                  <div className="checkout-form-group">
                    <label>Full Name *</label>
                    <input placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} />
                  </div>
                  <div className="checkout-form-group">
                    <label>Phone *</label>
                    <input placeholder="10-digit number" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                </div>
                <div className="checkout-form-group">
                  <label>Address *</label>
                  <textarea placeholder="House no., Street, Area..." value={address} onChange={e => setAddress(e.target.value)} />
                </div>
                <div className="checkout-form-row">
                  <div className="checkout-form-group">
                    <label>City *</label>
                    <input placeholder="Mumbai" value={city} onChange={e => setCity(e.target.value)} />
                  </div>
                  <div className="checkout-form-group">
                    <label>State *</label>
                    <input placeholder="Maharashtra" value={state} onChange={e => setState(e.target.value)} />
                  </div>
                </div>
                <div className="checkout-form-group" style={{ maxWidth: "200px" }}>
                  <label>Pincode *</label>
                  <input placeholder="400001" value={pincode} onChange={e => setPincode(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT */}
          <div className="checkout-card">
            <div className="checkout-card-header">
              <div className="checkout-card-num">2</div>
              <h2>Payment Method</h2>
            </div>
            <div className="checkout-card-body">
              <div className="payment-options">
                {paymentOptions.map(opt => (
                  <div
                    key={opt.id}
                    className={`payment-option ${paymentMethod === opt.id ? "selected" : ""}`}
                    onClick={() => setPaymentMethod(opt.id)}
                  >
                    <div className="payment-option-radio" />
                    <span className="payment-option-icon">{opt.icon}</span>
                    <div>
                      <p className="payment-option-label">{opt.label}</p>
                      <p className="payment-option-desc">{opt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {paymentMethod === "UPI" && (
                <div className="checkout-upi-wrap">
                  <label>Enter UPI ID *</label>
                  <input
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                  />
                </div>
              )}

              {paymentMethod === "Card" && (
                <div className="checkout-card-wrap">
                  {/* Visual card preview */}
                  <div className="card-preview">
                    <div className="card-preview-top">
                      <span className="card-chip">▣</span>
                      <span className="card-network">
                        {cardNumber.replace(/\s/g, "").startsWith("4") ? "VISA"
                          : cardNumber.replace(/\s/g, "").startsWith("5") ? "MASTERCARD"
                          : "CARD"}
                      </span>
                    </div>
                    <p className="card-preview-number">
                      {cardNumber || "•••• •••• •••• ••••"}
                    </p>
                    <div className="card-preview-bottom">
                      <div>
                        <span className="card-preview-label">Card Holder</span>
                        <span className="card-preview-value">{cardName || "YOUR NAME"}</span>
                      </div>
                      <div>
                        <span className="card-preview-label">Expires</span>
                        <span className="card-preview-value">{cardExpiry || "MM/YY"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card fields */}
                  <div className="checkout-form" style={{ marginTop: "16px" }}>
                    <div className="checkout-form-group">
                      <label>Card Number *</label>
                      <input
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                      />
                    </div>
                    <div className="checkout-form-group">
                      <label>Name on Card *</label>
                      <input
                        placeholder="John Doe"
                        value={cardName}
                        onChange={e => setCardName(e.target.value.toUpperCase())}
                      />
                    </div>
                    <div className="checkout-form-row">
                      <div className="checkout-form-group">
                        <label>Expiry Date *</label>
                        <input
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                          maxLength={5}
                        />
                      </div>
                      <div className="checkout-form-group">
                        <label>CVV *</label>
                        <input
                          placeholder="•••"
                          type="password"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── ORDER SUMMARY ── */}
        <div className="checkout-summary">
          <div className="checkout-summary-header">
            <h2>Order Summary</h2>
          </div>
          <div className="checkout-summary-body">

            {/* items */}
            <div className="checkout-summary-items">
              {displayItems.map((item, i) => (
                <div key={i} className="checkout-summary-item">
                  <img src={`http://localhost:5000/uploads/${item.image}`} alt={item.name} />
                  <div className="checkout-summary-item-info">
                    <p className="checkout-summary-item-name">{item.name}</p>
                    <p className="checkout-summary-item-meta">
                      Qty: {item.quantity}
                      {item.size && ` · Size: ${item.size}`}
                    </p>
                  </div>
                  <span className="checkout-summary-item-price">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* totals */}
            <div className="checkout-summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="checkout-summary-row">
              <span>Shipping</span>
              {shipping === 0
                ? <span className="summary-free">FREE</span>
                : <span>₹{shipping}</span>}
            </div>
            <div className="checkout-summary-row">
              <span>Payment</span>
              <span>{paymentMethod}</span>
            </div>
            <div className="checkout-summary-row total">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>

            <button
              className="checkout-place-btn"
              disabled={!isValid || placing}
              onClick={placeOrder}
            >
              {placing ? "Placing Order..." : "Place Order"}
            </button>

            <p className="checkout-secure">🔒 Secure & Encrypted Checkout</p>
          </div>
        </div>

      </div>

      {/* ── SUCCESS MODAL ── */}
      {orderSuccess && (
        <div className="order-success-overlay">
          <div className="order-success-modal">
            <div className="order-success-icon">🎉</div>
            <h2 className="order-success-title">Order Placed!</h2>
            <p className="order-success-msg">
              Your order has been placed successfully. We'll notify you once it's confirmed.
            </p>
            <button
              className="order-success-btn"
              onClick={() => navigate("/my-orders")}
            >
              View My Orders
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default Checkout