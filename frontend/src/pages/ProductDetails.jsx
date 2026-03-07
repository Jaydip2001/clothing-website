import { useEffect, useState } from "react"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)

  const user = JSON.parse(localStorage.getItem("user"))

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

  /* ================= ADD TO CART ================= */
  const addToCart = async () => {
    if (!product) return

    // ===== GUEST USER =====
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

      localStorage.setItem(
        "guestCart",
        JSON.stringify(guestCart)
      )

      alert("Added to cart 🛒")
      return
    }

    // ===== LOGGED-IN USER =====
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

    // ===== GUEST USER =====
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

      localStorage.setItem(
        "guestWishlist",
        JSON.stringify(guestWishlist)
      )

      alert("Added to wishlist ❤️")
      return
    }

    // ===== LOGGED-IN USER =====
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
    <div style={{ padding: "30px", display: "flex", gap: "40px" }}>
      
      {/* ================= LEFT SIDE IMAGE ================= */}
      <div style={{ flex: 1 }}>
        <img
          src={`http://localhost:5000/uploads/${product.image}`}
          alt={product.name}
          width="100%"
          style={{ maxWidth: "400px" }}
        />
      </div>

      {/* ================= RIGHT SIDE DETAILS ================= */}
      <div style={{ flex: 1 }}>
        <h2>{product.name}</h2>
        <h3 style={{ color: "green" }}>₹{product.price}</h3>

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          High quality fabric. Premium design. Comfortable fit.
        </p>

        {/* ===== QUANTITY SELECTOR ===== */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ marginRight: "10px" }}>
            Quantity:
          </label>

          <button
            onClick={() =>
              quantity > 1 && setQuantity(quantity - 1)
            }
          >
            -
          </button>

          <span style={{ margin: "0 15px" }}>
            {quantity}
          </span>

          <button
            onClick={() => setQuantity(quantity + 1)}
          >
            +
          </button>
        </div>

        {/* ===== BUTTONS ===== */}
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
      state: {
        product: product,
        quantity: quantity
      }
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
  )
}

export default ProductDetails
