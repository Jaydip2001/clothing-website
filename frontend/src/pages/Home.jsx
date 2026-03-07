import { useEffect, useState } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"

function Home() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)

  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      const catRes = await axios.get("http://localhost:5000/api/categories")
      const prodRes = await axios.get("http://localhost:5000/api/products")

      setCategories(catRes.data)
      setProducts(prodRes.data)
    }

    fetchData()
  }, [])

  /* ================= LOAD COUNTS ================= */
  const loadCounts = async () => {
    if (user) {
      // 🛒 CART COUNT (USER)
      const cartRes = await axios.get(
        `http://localhost:5000/api/cart/${user.id}`
      )

      const cartQty = cartRes.data.reduce(
        (sum, item) => sum + item.quantity,
        0
      )
      setCartCount(cartQty)

      // ❤️ WISHLIST COUNT (USER)
      const wishRes = await axios.get(
        `http://localhost:5000/api/wishlist/${user.id}`
      )
      setWishlistCount(wishRes.data.length)
    } else {
      // 🛒 CART COUNT (GUEST)
      const guestCartRaw = localStorage.getItem("guestCart")
      const guestCart = guestCartRaw ? JSON.parse(guestCartRaw) : []
      setCartCount(guestCart.length)

      // ❤️ WISHLIST COUNT (GUEST) — FIXED
      const guestWishlistRaw =
        localStorage.getItem("guestWishlist")

      if (!guestWishlistRaw) {
        setWishlistCount(0)
      } else {
        const guestWishlist = JSON.parse(guestWishlistRaw)
        setWishlistCount(guestWishlist.length)
      }
    }
  }

  useEffect(() => {
    loadCounts()

    window.addEventListener("wishlistUpdated", loadCounts)
    window.addEventListener("cartUpdated", loadCounts)

    return () => {
      window.removeEventListener("wishlistUpdated", loadCounts)
      window.removeEventListener("cartUpdated", loadCounts)
    }
  }, [user])

  /* ================= ADD TO CART ================= */
  const addToCart = async (product) => {
    if (!user) {
      const cart =
        JSON.parse(localStorage.getItem("guestCart")) || []

      const exists = cart.find(
        i => i.product_id === product.id
      )

      if (exists) exists.quantity += 1
      else cart.push({ product_id: product.id, quantity: 1 })

      localStorage.setItem("guestCart", JSON.stringify(cart))
      window.dispatchEvent(new Event("cartUpdated"))
      alert("Added to cart")
      return
    }

    await axios.post("http://localhost:5000/api/cart/add", {
      user_id: user.id,
      product_id: product.id,
      quantity: 1
    })

    loadCounts()
    alert("Added to cart")
  }

  /* ================= ADD / REMOVE WISHLIST ================= */
  const addToWishlist = async (product) => {
    // ===== GUEST USER =====
    if (!user) {
      let wishlist =
        JSON.parse(localStorage.getItem("guestWishlist")) || []

      const index = wishlist.findIndex(
        i => i.product_id === product.id
      )

      if (index !== -1) {
        wishlist.splice(index, 1)

        if (wishlist.length === 0) {
          localStorage.removeItem("guestWishlist")
        } else {
          localStorage.setItem(
            "guestWishlist",
            JSON.stringify(wishlist)
          )
        }

        window.dispatchEvent(new Event("wishlistUpdated"))
        alert("Removed from wishlist 💔")
        return
      }

      wishlist.push({ product_id: product.id })
      localStorage.setItem(
        "guestWishlist",
        JSON.stringify(wishlist)
      )

      window.dispatchEvent(new Event("wishlistUpdated"))
      alert("Added to wishlist ❤️")
      return
    }

    // ===== LOGGED-IN USER =====
    try {
      await axios.post("http://localhost:5000/api/wishlist/add", {
        user_id: user.id,
        product_id: product.id
      })

      loadCounts()
      alert("Added to wishlist ❤️")
    } catch {
      alert("Already in wishlist ❤️")
    }
  }

  return (
    <div>
      {/* ================= HEADER ================= */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h1>Welcome to Clothing Store</h1>
          <p>Shop the latest fashion with us</p>
        </div>

        <div style={{ display: "flex", gap: "15px" }}>
          {!user ? (
            <button onClick={() => navigate("/login")}>
              👤 Login
            </button>
          ) : (
            <>
              <span>Hi, {user.name}</span>
              <button
                onClick={() => {
                  localStorage.removeItem("user")
                  window.location.reload()
                }}
              >
                Logout
              </button>
            </>
          )}

          <button onClick={() => navigate("/wishlist")}>
            ❤️ Wishlist ({wishlistCount})
          </button>

          <button onClick={() => navigate("/cart")}>
            🛒 Cart ({cartCount})
          </button>
          <button onClick={()=>navigate("/my-orders")}>
📦 My Orders
</button>
        </div>
      </div>

      <hr />

      {/* ================= CATEGORIES ================= */}
      <h2>Categories</h2>
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/products?category=${cat.id}`}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                width: "150px",
                textAlign: "center"
              }}
            >
              {cat.image && (
                <img
                  src={`http://localhost:5000/uploads/${cat.image}`}
                  alt={cat.name}
                  width="100%"
                  height="100"
                  style={{ objectFit: "cover" }}
                />
              )}
              <p>{cat.name}</p>
            </div>
          </Link>
        ))}
      </div>

      <hr />

      {/* ================= ALL PRODUCTS ================= */}
      <h2>All Products</h2>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              width: "220px"
            }}
          >
            <Link to={`/product/${p.id}`}>
              <img
                src={`http://localhost:5000/uploads/${p.image}`}
                alt={p.name}
                width="100%"
                height="150"
                style={{ objectFit: "cover" }}
              />
            </Link>


            <Link to={`/product/${p.id}`} style={{ textDecoration: "none", color: "black" }}>
              <h3>{p.name}</h3>
            </Link>

            <p>₹{p.price}</p>

            <button onClick={() => addToCart(p)}>
              Add to Cart
            </button>

            <br /><br />

            <button onClick={() => addToWishlist(p)}>
              ❤️ Wishlist
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
