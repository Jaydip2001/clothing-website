import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Cart() {
  const [cartItems, setCartItems] = useState([])
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem("user"))

  /* ================= LOAD CART ================= */
  useEffect(() => {
    const loadCart = async () => {
      // 🔐 LOGGED-IN USER → DATABASE CART
      if (user) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/cart/${user.id}`
          )
          setCartItems(res.data)
        } catch (err) {
          console.error(err)
          alert("Failed to load cart")
        }
      }
      // 👤 GUEST USER → LOCAL STORAGE CART
      else {
        const localCart =
          JSON.parse(localStorage.getItem("cart")) || []
        setCartItems(localCart)
      }
    }

    loadCart()
  }, [user])

  /* ================= REMOVE ITEM ================= */
  const removeItem = async (product_id) => {
    // LOGGED-IN USER
    if (user) {
      await axios.delete(
        `http://localhost:5000/api/cart/remove`,
        {
          data: {
            user_id: user.id,
            product_id
          }
        }
      )

      const res = await axios.get(
        `http://localhost:5000/api/cart/${user.id}`
      )
      setCartItems(res.data)
    }
    // GUEST USER
    else {
      let cart =
        JSON.parse(localStorage.getItem("cart")) || []

      cart = cart.filter(item => item.product_id !== product_id)

      localStorage.setItem("cart", JSON.stringify(cart))
      setCartItems(cart)
    }
  }

  /* ================= TOTAL ================= */
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  /* ================= UI ================= */
  return (
    <div>
      <h1>Your Cart</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {cartItems.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "15px",
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px"
              }}
            >
              {item.image && (
                <img
                  src={`http://localhost:5000/uploads/${item.image}`}
                  width="80"
                  alt=""
                />
              )}

              <div>
                <h3>{item.name}</h3>
                <p>₹{item.price}</p>
                <p>Qty: {item.quantity}</p>
                <p>Total: ₹{item.price * item.quantity}</p>

                <button
                  onClick={() => removeItem(item.product_id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <h2>Grand Total: ₹{total}</h2>

          <button onClick={() => alert("Checkout coming next 🚀")}>
            Checkout
          </button>

          {!user && (
            <p style={{ marginTop: "10px" }}>
              Login during checkout to save your order
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default Cart
