import { useState, useEffect } from "react"
import axios from "axios"
import { useLocation, useNavigate } from "react-router-dom"

function Checkout() {

  const user = JSON.parse(localStorage.getItem("user"))
  const location = useLocation()
  const navigate = useNavigate()

  /* ================= BUY NOW DATA ================= */

  const directProduct = location.state?.product
  const directQty = location.state?.quantity || 1


  /* ================= CART DATA ================= */

  const [cartItems, setCartItems] = useState([])


  useEffect(() => {

    if (!directProduct) {

      const fetchCart = async () => {

        if (user) {

          const res = await axios.get(
            `http://localhost:5000/api/cart/${user.id}`
          )

          setCartItems(res.data)

        } else {

          const guestCart =
            JSON.parse(localStorage.getItem("guestCart")) || []

          setCartItems(guestCart)

        }

      }

      fetchCart()

    }

  }, [])



  /* ================= TOTAL ================= */

  const totalAmount = directProduct
    ? directProduct.price * directQty
    : cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )


  /* ================= ADDRESS ================= */

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [pincode, setPincode] = useState("")


  /* ================= PAYMENT ================= */

  const [paymentMethod, setPaymentMethod] = useState("COD")
  const [upiId, setUpiId] = useState("")


  /* ================= VALIDATION ================= */

  const isFormValid = () => {

    if (!fullName || !phone || !address || !city || !state || !pincode) {
      return false
    }

    if (paymentMethod === "UPI" && !upiId) {
      return false
    }

    return true
  }


  /* ================= PLACE ORDER ================= */

  const placeOrder = async () => {

    if (!user) { alert("Please login first"); return }
    if (!isFormValid()) { alert("Please complete address and payment"); return }

    try {

      let items = []

      /* BUY NOW */
      if (directProduct) {

        items.push({
          product_id: directProduct.id,
          quantity: directQty,
          price: directProduct.price
        })

      }

      /* CART ORDER */
      else {

        items = cartItems.map(item => ({
          product_id: item.product_id || item.id,
          quantity: item.quantity,
          price: item.price
        }))

      }

      /* ✅ Send address directly with the order */
      await axios.post(
        "http://localhost:5000/api/orders/create",
        {
          user_id: user.id,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          upi_id: upiId,
          items,
          address: {
            full_name: fullName,
            phone,
            address,
            city,
            state,
            pincode
          }
        }
      )

      /* ✅ Show success then redirect to My Orders */
      alert("Order placed successfully! 🎉")
      navigate("/my-orders")

    } catch (err) {
      alert("Order failed")
      console.error(err)
    }

  }


  return (

    <div style={{ padding: "30px" }}>

      <h1>Checkout</h1>


      {/* ================= BUY NOW PRODUCT ================= */}

      {directProduct && (

        <div style={{
          border: "1px solid #ccc",
          padding: "15px",
          marginBottom: "20px",
          width: "350px"
        }}>

          <h3>Product</h3>

          <img
            src={`http://localhost:5000/uploads/${directProduct.image}`}
            width="150"
            alt=""
          />

          <p><b>{directProduct.name}</b></p>

          <p>Price : ₹{directProduct.price}</p>

          <p>Quantity : {directQty}</p>

        </div>

      )}



      {/* ================= CART PRODUCTS ================= */}

      {!directProduct && cartItems.length > 0 && (

        <div>

          <h2>Your Cart</h2>

          {cartItems.map(item => (

            <div key={item.product_id} style={{ marginBottom: "10px" }}>

              <img
                src={`http://localhost:5000/uploads/${item.image}`}
                width="60"
                alt=""
              />

              {item.name} × {item.quantity} — ₹{item.price}

            </div>

          ))}

        </div>

      )}


      <hr />


      {/* ================= ADDRESS ================= */}

      <h2>Shipping Address</h2>

      <input
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <br /><br />

      <textarea
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="State"
        value={state}
        onChange={(e) => setState(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Pincode"
        value={pincode}
        onChange={(e) => setPincode(e.target.value)}
      />

      <br /><br />


      <hr />


      {/* ================= PAYMENT ================= */}

      <h2>Payment Method</h2>

      <select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >

        <option value="COD">Cash On Delivery</option>

        <option value="UPI">UPI Payment</option>

        <option value="Card">Debit / Credit Card</option>

      </select>


      <br /><br />


      {paymentMethod === "UPI" && (

        <div>

          <h3>Enter UPI ID</h3>

          <input
            placeholder="example@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
          />

        </div>

      )}


      <hr />


      <h2>Total Amount : ₹{totalAmount}</h2>


      <button
        disabled={!isFormValid()}
        style={{
          padding: "10px 20px",
          background: isFormValid() ? "green" : "gray",
          color: "white",
          border: "none",
          cursor: isFormValid() ? "pointer" : "not-allowed"
        }}
        onClick={placeOrder}
      >
        Place Order
      </button>


    </div>

  )

}

export default Checkout