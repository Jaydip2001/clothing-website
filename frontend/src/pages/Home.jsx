import { useEffect, useState } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"

function Home() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [reviewCounts, setReviewCounts] = useState({})
  const [search, setSearch] = useState("")  // ✅ search state

  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      const catRes = await axios.get("http://localhost:5000/api/categories")
      const prodRes = await axios.get("http://localhost:5000/api/products")

      setCategories(catRes.data)
      setProducts(prodRes.data)

      const reviewRes = await axios.get("http://localhost:5000/api/reviews")
      const counts = {}

      reviewRes.data.forEach(r => {
        if (!counts[r.product_id]) counts[r.product_id] = { count: 0, total: 0 }
        counts[r.product_id].count += 1
        counts[r.product_id].total += r.rating
      })

      Object.keys(counts).forEach(id => {
        counts[id].avg = (counts[id].total / counts[id].count).toFixed(1)
      })

      setReviewCounts(counts)
    }

    fetchData()
  }, [])

  /* ================= FILTERED PRODUCTS ================= */
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  /* ================= LOAD COUNTS ================= */
  const loadCounts = async () => {
    if (user) {
      const cartRes = await axios.get(`http://localhost:5000/api/cart/${user.id}`)
      const cartQty = cartRes.data.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(cartQty)

      const wishRes = await axios.get(`http://localhost:5000/api/wishlist/${user.id}`)
      setWishlistCount(wishRes.data.length)

    } else {
      const guestCartRaw = localStorage.getItem("guestCart")
      const guestCart = guestCartRaw ? JSON.parse(guestCartRaw) : []
      setCartCount(guestCart.length)

      const guestWishlistRaw = localStorage.getItem("guestWishlist")
      if (!guestWishlistRaw) setWishlistCount(0)
      else setWishlistCount(JSON.parse(guestWishlistRaw).length)
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
      const cart = JSON.parse(localStorage.getItem("guestCart")) || []
      const exists = cart.find(i => i.product_id === product.id)
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
    if (!user) {
      let wishlist = JSON.parse(localStorage.getItem("guestWishlist")) || []
      const index = wishlist.findIndex(i => i.product_id === product.id)

      if (index !== -1) {
        wishlist.splice(index, 1)
        if (wishlist.length === 0) localStorage.removeItem("guestWishlist")
        else localStorage.setItem("guestWishlist", JSON.stringify(wishlist))
        window.dispatchEvent(new Event("wishlistUpdated"))
        alert("Removed from wishlist")
        return
      }

      wishlist.push({ product_id: product.id })
      localStorage.setItem("guestWishlist", JSON.stringify(wishlist))
      window.dispatchEvent(new Event("wishlistUpdated"))
      alert("Added to wishlist")
      return
    }

    try {
      await axios.post("http://localhost:5000/api/wishlist/add", {
        user_id: user.id,
        product_id: product.id
      })
      loadCounts()
      alert("Added to wishlist")
    } catch {
      alert("Already in wishlist")
    }
  }

  return (
    <div>

      {/* ================= HEADER ================= */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Welcome to Clothing Store</h1>
          <p>Shop the latest fashion with us</p>
        </div>

        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          {!user ? (
            <button onClick={() => navigate("/login")}>Login</button>
          ) : (
            <>
              <span>Hi, {user.name}</span>
              <button onClick={() => {
                localStorage.removeItem("user")
                window.location.reload()
              }}>
                Logout
              </button>
            </>
          )}

          <button onClick={() => navigate("/wishlist")}>
            Wishlist ({wishlistCount})
          </button>

          <button onClick={() => navigate("/cart")}>
            Cart ({cartCount})
          </button>

          <button onClick={() => navigate("/my-orders")}>
            My Orders
          </button>
        </div>
      </div>

      <hr />

      {/* ================= SEARCH BAR ================= */}
      <div style={{ margin: "15px 0", display: "flex", alignItems: "center", gap: "10px" }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px 15px",
            width: "350px",
            borderRadius: "25px",
            border: "1px solid #ccc",
            fontSize: "15px",
            outline: "none"
          }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{
              padding: "8px 14px",
              borderRadius: "20px",
              border: "1px solid #ccc",
              cursor: "pointer",
              background: "#f5f5f5"
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ================= CATEGORIES (hidden when searching) ================= */}
      {!search && (
        <>
          <h2>Categories</h2>
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                style={{ textDecoration: "none" }}
              >
                <div style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  width: "150px",
                  textAlign: "center"
                }}>
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
        </>
      )}

      {/* ================= ALL PRODUCTS ================= */}
      <h2>
        {search
          ? `Results for "${search}" (${filteredProducts.length})`
          : "All Products"
        }
      </h2>

      {filteredProducts.length === 0 && (
        <p style={{ color: "gray" }}>No products found for "{search}"</p>
      )}

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {filteredProducts.map((p) => (
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

            <p>Rs.{p.price}</p>

            {/* REVIEW STARS + COUNT */}
            <p style={{ margin: "4px 0 10px", fontSize: "13px" }}>
              <span style={{ color: "#f5a623" }}>
                {"star".repeat(0)}
                {Array.from({ length: Math.round(reviewCounts[p.id]?.avg || 0) }).map((_, i) => (
                  <span key={i}>⭐</span>
                ))}
              </span>
              <span style={{ color: "#666", marginLeft: "5px" }}>
                {reviewCounts[p.id]
                  ? `${reviewCounts[p.id].avg} (${reviewCounts[p.id].count} review${reviewCounts[p.id].count > 1 ? "s" : ""})`
                  : "No reviews yet"}
              </span>
            </p>

            <button onClick={() => addToCart(p)}>Add to Cart</button>

            <br /><br />

            <button onClick={() => addToWishlist(p)}>Wishlist</button>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Home