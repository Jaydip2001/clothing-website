import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"


function Cart() {
  const [cartItems, setCartItems] = useState([])
  const user = JSON.parse(localStorage.getItem("user"))
const navigator = useNavigate()
  /* ================= LOAD CART ================= */
  useEffect(() => {
    if (!user) {
      loadGuestCart()
    } else {
      loadUserCart()
    }
  }, [])

  /* ================= GUEST CART ================= */
  const loadGuestCart = async () => {
    const guestCart =
      JSON.parse(localStorage.getItem("guestCart")) || []

    if (guestCart.length === 0) {
      setCartItems([])
      return
    }

    const res = await axios.get("http://localhost:5000/api/products")

    const fullItems = guestCart.map((item) => {
      const product = res.data.find(
        (p) => p.id === item.product_id
      )

      return {
        ...product,
        quantity: item.quantity,
        product_id: item.product_id
      }
    })

    setCartItems(fullItems)
  }

  /* ================= USER CART ================= */
  const loadUserCart = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/cart/${user.id}`
    )
    setCartItems(res.data)
  }

  /* ================= REMOVE ITEM ================= */
  const removeItem = async (item) => {
    // GUEST
    if (!user) {
      let guestCart =
        JSON.parse(localStorage.getItem("guestCart")) || []

      guestCart = guestCart.filter(
        (i) => i.product_id !== item.product_id
      )

      localStorage.setItem(
        "guestCart",
        JSON.stringify(guestCart)
      )
      loadGuestCart()
      return
    }

    // USER
    await axios.delete(
      `http://localhost:5000/api/cart/remove/${item.id}`
    )
    loadUserCart()
  }

  /* ================= UPDATE QUANTITY ================= */
  const updateQty = async (item, change) => {
    // GUEST
    if (!user) {
      let guestCart =
        JSON.parse(localStorage.getItem("guestCart")) || []

      const found = guestCart.find(
        (i) => i.product_id === item.product_id
      )

      if (!found) return

      found.quantity += change
      if (found.quantity < 1) {
        guestCart = guestCart.filter(
          (i) => i.product_id !== item.product_id
        )
      }

      localStorage.setItem(
        "guestCart",
        JSON.stringify(guestCart)
      )
      loadGuestCart()
      return
    }

    // USER
    const newQty = item.quantity + change
    if (newQty < 1) {
      removeItem(item)
      return
    }

    await axios.put("http://localhost:5000/api/cart/update", {
      cart_id: item.id,
      quantity: newQty
    })

    loadUserCart()
  }

  /* ================= TOTAL ================= */
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <div>
      <button onClick={() => navigator("/")}>
  ⬅ Back to Home
</button>
      <h1>Your Cart</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div
              key={item.id || item.product_id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
                display: "flex",
                gap: "15px"
              }}
            >
              <img
                src={`http://localhost:5000/uploads/${item.image}`}
                width="80"
              />

              <div>
                <h3>{item.name}</h3>
                <p>₹{item.price}</p>

                <div>
                  <button onClick={() => updateQty(item, -1)}>
                    -
                  </button>
                  <span style={{ margin: "0 10px" }}>
                    {item.quantity}
                  </span>
                  <button onClick={() => updateQty(item, 1)}>
                    +
                  </button>
                </div>

                <p>
                  Total: ₹{item.price * item.quantity}
                </p>

                <button onClick={() => removeItem(item)}>
                  Remove
                </button>
              </div>
            </div>
          ))}

          <h2>Grand Total: ₹{total}</h2>

          <button onClick={() => navigator("/checkout")}>
            Checkout
          </button>
        </>
      )}
    </div>
  )
}

export default Cart
