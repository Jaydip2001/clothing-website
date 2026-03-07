import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function Wishlist() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const user = JSON.parse(localStorage.getItem("user"))

  /* ================= LOAD WISHLIST ================= */
  useEffect(() => {
    if (user) loadUserWishlist()
    else loadGuestWishlist()
  }, [])

  /* ===== LOGGED-IN USER ===== */
  const loadUserWishlist = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/wishlist/${user.id}`
    )
    setItems(res.data)
  }

  /* ===== GUEST USER ===== */
 const loadGuestWishlist = async () => {
  const guestWishlist =
    JSON.parse(localStorage.getItem("guestWishlist")) || []

  if (guestWishlist.length === 0) {
    setItems([])
    return
  }

  // 🔥 Fetch all products
  const res = await axios.get("http://localhost:5000/api/products")

  // 🔥 Match product_id with product data
  const fullItems = guestWishlist
    .map(w =>
      res.data.find(p => p.id === w.product_id)
    )
    .filter(Boolean) // removes undefined safety

  setItems(fullItems)
}


  /* ================= REMOVE FROM WISHLIST ================= */
  const removeFromWishlist = async (product_id) => {
  // 🔹 GUEST USER
  if (!user) {
    let guestWishlist =
      JSON.parse(localStorage.getItem("guestWishlist")) || []

    guestWishlist = guestWishlist.filter(
      item => item.product_id !== product_id
    )

    localStorage.setItem(
      "guestWishlist",
      JSON.stringify(guestWishlist)
    )

    loadGuestWishlist()

    // 🔥 FIX: force count sync
    window.dispatchEvent(new Event("wishlistUpdated"))
    return
  }

  // 🔹 LOGGED-IN USER
  await axios.post("http://localhost:5000/api/wishlist/remove", {
    user_id: user.id,
    product_id
  })

  loadUserWishlist()
}


  return (
    <div>
     <button onClick={() => navigate("/")}>
  ⬅ Back to Home
</button>
      <h1>Your Wishlist</h1>

      {items.length === 0 ? (
        <p>No items in wishlist</p>
      ) : (
        items.map(item => (
          <div
            key={item.id}
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

              <button
                onClick={() => removeFromWishlist(item.id)}
              >
                ❌ Remove
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Wishlist
