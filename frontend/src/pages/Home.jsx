import { useEffect, useState } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import "./user-css/Home.css"

function Home() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [reviewCounts, setReviewCounts] = useState({})
  const [search, setSearch] = useState("")

  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))

  /* ── FETCH ── */
  useEffect(() => {
    const fetchData = async () => {
      const [catRes, prodRes, reviewRes] = await Promise.all([
        axios.get("http://localhost:5000/api/categories/with-subs"),
        axios.get("http://localhost:5000/api/products"),
        axios.get("http://localhost:5000/api/reviews"),
      ])
      setCategories(catRes.data)
      setProducts(prodRes.data)

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

  /* ── COUNTS ── */
  const loadCounts = async () => {
    if (user) {
      const cartRes = await axios.get(`http://localhost:5000/api/cart/${user.id}`)
      setCartCount(cartRes.data.reduce((s, i) => s + i.quantity, 0))
      const wishRes = await axios.get(`http://localhost:5000/api/wishlist/${user.id}`)
      setWishlistCount(wishRes.data.length)
    } else {
      setCartCount(JSON.parse(localStorage.getItem("guestCart") || "[]").length)
      setWishlistCount(JSON.parse(localStorage.getItem("guestWishlist") || "[]").length)
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

  /* ── CART ── */
  const addToCart = async (product) => {
    if (!user) {
      const cart = JSON.parse(localStorage.getItem("guestCart") || "[]")
      const exists = cart.find(i => i.product_id === product.id)
      if (exists) exists.quantity += 1
      else cart.push({ product_id: product.id, quantity: 1 })
      localStorage.setItem("guestCart", JSON.stringify(cart))
      window.dispatchEvent(new Event("cartUpdated"))
      alert("Added to cart!")
      return
    }
    await axios.post("http://localhost:5000/api/cart/add", { user_id: user.id, product_id: product.id, quantity: 1 })
    loadCounts()
    alert("Added to cart!")
  }

  /* ── WISHLIST ── */
  const addToWishlist = async (product) => {
    if (!user) {
      let w = JSON.parse(localStorage.getItem("guestWishlist") || "[]")
      const idx = w.findIndex(i => i.product_id === product.id)
      if (idx !== -1) {
        w.splice(idx, 1)
        w.length === 0 ? localStorage.removeItem("guestWishlist") : localStorage.setItem("guestWishlist", JSON.stringify(w))
        window.dispatchEvent(new Event("wishlistUpdated"))
        alert("Removed from wishlist")
        return
      }
      w.push({ product_id: product.id })
      localStorage.setItem("guestWishlist", JSON.stringify(w))
      window.dispatchEvent(new Event("wishlistUpdated"))
      alert("Added to wishlist!")
      return
    }
    try {
      await axios.post("http://localhost:5000/api/wishlist/add", { user_id: user.id, product_id: product.id })
      loadCounts()
      alert("Added to wishlist!")
    } catch { alert("Already in wishlist") }
  }

  const renderStars = (avg) => {
    const f = Math.round(avg || 0)
    return "★".repeat(f) + "☆".repeat(5 - f)
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="home-page">

      {/* ══════════════════════════════════════════
          NAVBAR — logo | search | icons
          ══════════════════════════════════════════ */}
      <nav className="home-nav">

        {/* Logo */}
        <span className="nav-brand" onClick={() => navigate("/")}>
          Style<span>Hub</span>
        </span>

        {/* Search */}
        <div className="nav-search-wrap">
          <input
            className="nav-search"
            type="text"
            placeholder="Search styles, categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search
            ? <button className="nav-search-clear" onClick={() => setSearch("")}>✕</button>
            : <span className="nav-search-icon">🔍</span>
          }
        </div>

        {/* Icon Actions */}
        <div className="nav-actions">
          {!user ? (
            <button className="nav-icon-btn primary" onClick={() => navigate("/login")}>
              Sign In
            </button>
          ) : (
            <div className="nav-profile-wrap">
              <button className="nav-profile-btn">
                <span className="nav-profile-avatar">{user.name.charAt(0).toUpperCase()}</span>
                <span className="nav-greeting">Hi, {user.name.split(" ")[0]}</span>
                <span style={{ fontSize: "10px", marginLeft: "2px" }}>▾</span>
              </button>
              <div className="nav-profile-dropdown">
                <div className="nav-profile-dropdown-inner">
                  <div className="nav-dropdown-header">
                    <p className="nav-dropdown-name">{user.name}</p>
                    <p className="nav-dropdown-email">{user.email}</p>
                  </div>
                  <div className="nav-dropdown-divider" />
                  <button className="nav-dropdown-item" onClick={() => navigate("/profile")}>👤 My Profile</button>
                  <button className="nav-dropdown-item" onClick={() => navigate("/my-orders")}>📦 My Orders</button>
                  <button className="nav-dropdown-item" onClick={() => navigate("/wishlist")}>♡ Wishlist</button>
                  <div className="nav-dropdown-divider" />
                  <button className="nav-dropdown-item danger" onClick={() => { localStorage.removeItem("user"); window.location.reload() }}>↩ Logout</button>
                </div>
              </div>
            </div>
          )}

          <div className="nav-divider" />

          <button className="nav-icon-btn" onClick={() => navigate("/wishlist")}>
            <span className="nav-icon-svg">♡</span>
            <span>Wishlist</span>
            {wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
          </button>

          <button className="nav-icon-btn" onClick={() => navigate("/cart")}>
            <span className="nav-icon-svg">🛍</span>
            <span>Cart</span>
            {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
          </button>

          <button className="nav-icon-btn" onClick={() => navigate("/my-orders")}>
            <span className="nav-icon-svg">📦</span>
            <span>Orders</span>
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          CATEGORY NAV BAR — mega dropdown
          ══════════════════════════════════════════ */}
      {!search && (
        <div className="cat-nav">

          {/* SALE */}
          <div className="cat-nav-item">
            <span className="cat-nav-link sale"
              onClick={() => document.getElementById("all-products")?.scrollIntoView({ behavior: "smooth" })}>
              SALE
            </span>
          </div>

          {/* Each category with MEGA dropdown */}
          {categories.map(cat => (
            <div key={cat.id} className="cat-nav-item">
              <Link to={`/products?category=${cat.id}`} className="cat-nav-link">
                {cat.name}
                <span className="cat-nav-chevron">▾</span>
              </Link>

              {/* MEGA DROPDOWN — full width */}
              <div className="cat-mega">

                {/* LEFT — image + name */}
                <div className="cat-mega-img-wrap">
                  {cat.image ? (
                    <img
                      src={`http://localhost:5000/uploads/${cat.image}`}
                      alt={cat.name}
                      className="cat-mega-img"
                    />
                  ) : (
                    <div className="cat-mega-img-placeholder">🛍️</div>
                  )}
                  <span className="cat-mega-cat-name">{cat.name}</span>
                </div>

                {/* RIGHT — subcategories if exist, else all categories */}
                <div className="cat-mega-links">
                  {cat.subcategories && cat.subcategories.length > 0 ? (
                    <>
                      <span className="cat-mega-section-title">Shop {cat.name}</span>
                      {cat.subcategories.map(sub => (
                        <Link
                          key={sub.id}
                          to={`/products?category=${cat.id}&sub=${sub.id}`}
                          className="cat-mega-link"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </>
                  ) : (
                    <>
                      <span className="cat-mega-section-title">All Categories</span>
                      {categories.map(c => (
                        <Link
                          key={c.id}
                          to={`/products?category=${c.id}`}
                          className={`cat-mega-link ${c.id === cat.id ? "bold" : ""}`}
                        >
                          {c.name}
                        </Link>
                      ))}
                    </>
                  )}
                  <Link
                    to={`/products?category=${cat.id}`}
                    className="cat-mega-link view-all"
                  >
                    View All {cat.name} →
                  </Link>
                </div>

              </div>
            </div>
          ))}

          {/* View All */}
          <div className="cat-nav-item">
            <span className="cat-nav-link"
              onClick={() => document.getElementById("all-products")?.scrollIntoView({ behavior: "smooth" })}>
              View All
            </span>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════
          HERO — full bleed image + text right
          ══════════════════════════════════════════ */}
      {!search && (
        <section className="hero">
          {/* scroll indicator left side */}
          <div className="hero-scroll">
            <div className="hero-scroll-line" />
            Scroll
          </div>

          {/* text — right side */}
          <div className="hero-text">
            <h1 className="hero-title">
              Shape<br />
              <em>of Now</em>
            </h1>
            <button className="hero-cta"
              onClick={() => document.getElementById("all-products")?.scrollIntoView({ behavior: "smooth" })}>
              Shop Now
            </button>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          CATEGORIES GRID
          ══════════════════════════════════════════ */}
      {!search && categories.length > 0 && (
        <section className="home-section bg-off" id="categories-section">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">Explore</p>
              <h2 className="section-title">Shop by <em>Category</em></h2>
            </div>
            <button className="section-link"
              onClick={() => document.getElementById("all-products")?.scrollIntoView({ behavior: "smooth" })}>
              View All →
            </button>
          </div>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link key={cat.id} to={`/products?category=${cat.id}`} className="category-card">
                {cat.image ? (
                  <>
                    <img src={`http://localhost:5000/uploads/${cat.image}`} alt={cat.name} />
                    <div className="category-card-overlay">
                      <span className="category-card-name">{cat.name}</span>
                      <span className="category-card-arrow">Shop Now →</span>
                    </div>
                  </>
                ) : (
                  <div className="category-card-no-img">
                    <span className="category-card-name" style={{ color: "#333" }}>{cat.name}</span>
                    <span style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#777", marginTop: "4px" }}>Shop Now →</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          PROMO BANNER
          ══════════════════════════════════════════ */}
      {!search && (
        <div className="promo-banner">
          <p className="promo-eyebrow">Limited Time Offer</p>
          <h2 className="promo-title">Up to <em>50% Off</em><br />Selected Styles</h2>
          <p className="promo-sub">New markdowns added — while stocks last</p>
          <button className="promo-btn"
            onClick={() => document.getElementById("all-products")?.scrollIntoView({ behavior: "smooth" })}>
            Shop the Sale
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════
          ALL PRODUCTS
          ══════════════════════════════════════════ */}
      <section className="home-section" id="all-products">

        {search ? (
          <div className="search-results-header">
            <div>
              <h2 className="search-results-title">Results for "<span>{search}</span>"</h2>
              <p className="search-results-count">{filteredProducts.length} item{filteredProducts.length !== 1 ? "s" : ""} found</p>
            </div>
            <button className="search-clear-btn" onClick={() => setSearch("")}>✕ Clear</button>
          </div>
        ) : (
          <div className="section-header">
            <div>
              <p className="section-eyebrow">Curated for you</p>
              <h2 className="section-title">All <em>Products</em></h2>
            </div>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3 className="empty-title">No results for "{search}"</h3>
            <p className="empty-sub">Try a different keyword or browse our categories</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((p, i) => {
              const review = reviewCounts[p.id]
              return (
                <div key={p.id} className="product-card" style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className="product-img-wrap">
                    <Link to={`/product/${p.id}`}>
                      <img src={`http://localhost:5000/uploads/${p.image}`} alt={p.name} />
                    </Link>
                    <div className="product-card-actions">
                      <button className="product-card-btn cart" onClick={() => addToCart(p)}>Add to Bag</button>
                      <button className="product-card-btn wish" onClick={() => addToWishlist(p)} title="Wishlist">♡</button>
                    </div>
                    {review && parseFloat(review.avg) >= 4 && (
                      <span className="product-badge">Top Rated</span>
                    )}
                  </div>
                  <div>
                    <Link to={`/product/${p.id}`} className="product-name">{p.name}</Link>
                    <p className="product-price">Rs. {p.price}</p>
                    <div className="product-stars">
                      <span className="stars-icons">{renderStars(review?.avg)}</span>
                      <span className="stars-text">{review ? `${review.avg} (${review.count})` : "No reviews"}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════ */}
      <footer className="home-footer">
        © {new Date().getFullYear()} <strong>StyleHub</strong> &nbsp;·&nbsp;
        Discover fashion that tells your story
      </footer>

    </div>
  )
}

export default Home