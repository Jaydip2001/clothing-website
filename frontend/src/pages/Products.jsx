import { useEffect, useState } from "react"
import axios from "axios"
import { useLocation, useNavigate, Link } from "react-router-dom"
import "./user-css/products.css"

function Products() {
  const [products, setProducts] = useState([])
  const [categoryName, setCategoryName] = useState("")
  const [subcategoryName, setSubcategoryName] = useState("")

  const location = useLocation()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))

  const query = new URLSearchParams(location.search)
  const categoryId = query.get("category")
  const subId = query.get("sub")

  /* ── FETCH ── */
  useEffect(() => {
    const fetchProducts = async () => {
      let url = `http://localhost:5000/api/products`
      const params = []
      if (categoryId) params.push(`category=${categoryId}`)
      if (subId) params.push(`sub=${subId}`)
      if (params.length) url += `?${params.join("&")}`

      const res = await axios.get(url)
      setProducts(res.data)

      // set page title from first product or fetch category name
      if (res.data.length > 0) {
        setCategoryName(res.data[0].category || "")
        setSubcategoryName(res.data[0].subcategory || "")
      } else {
        // fetch category name even if no products
        if (categoryId) {
          const catRes = await axios.get("http://localhost:5000/api/categories")
          const cat = catRes.data.find(c => String(c.id) === String(categoryId))
          if (cat) setCategoryName(cat.name)
        }
        setSubcategoryName("")
      }
    }
    fetchProducts()
  }, [categoryId, subId])

  /* ── ADD TO CART ── */
  const addToCart = async (product) => {
    if (!user) {
      const cart = JSON.parse(localStorage.getItem("guestCart") || "[]")
      const existing = cart.find(i => i.product_id === product.id)
      if (existing) existing.quantity += 1
      else cart.push({ product_id: product.id, quantity: 1 })
      localStorage.setItem("guestCart", JSON.stringify(cart))
      window.dispatchEvent(new Event("cartUpdated"))
      alert("Added to cart!")
      return
    }
    await axios.post("http://localhost:5000/api/cart/add", {
      user_id: user.id, product_id: product.id, quantity: 1
    })
    window.dispatchEvent(new Event("cartUpdated"))
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
      window.dispatchEvent(new Event("wishlistUpdated"))
      alert("Added to wishlist!")
    } catch { alert("Already in wishlist") }
  }

  const renderStars = (avg) => {
    const f = Math.round(avg || 0)
    return "★".repeat(f) + "☆".repeat(5 - f)
  }

  // page title
  const pageTitle = subId && subcategoryName
    ? subcategoryName
    : categoryName || "All Products"

  const breadcrumb = subId && subcategoryName
    ? `${categoryName} › ${subcategoryName}`
    : categoryName || "All Products"

  return (
    <div className="products-page">

      {/* ── HEADER ── */}
      <div className="products-page-header">
        <div className="products-breadcrumb">
          <span onClick={() => navigate("/")} className="breadcrumb-link">Home</span>
          <span className="breadcrumb-sep">›</span>
          {subId ? (
            <>
              <span
                onClick={() => navigate(`/products?category=${categoryId}`)}
                className="breadcrumb-link"
              >
                {categoryName}
              </span>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-current">{subcategoryName}</span>
            </>
          ) : (
            <span className="breadcrumb-current">{categoryName || "All Products"}</span>
          )}
        </div>

        <div className="products-title-row">
          <h1 className="products-title">{pageTitle}</h1>
          <span className="products-count">{products.length} items</span>
        </div>
      </div>

      {/* ── GRID ── */}
      {products.length === 0 ? (
        <div className="products-empty">
          <div className="products-empty-icon">🔍</div>
          <h3>No products found</h3>
          <p>Try browsing a different category</p>
          <button className="products-back-btn" onClick={() => navigate("/")}>← Back to Home</button>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((p, i) => (
            <div key={p.id} className="product-card" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="product-img-wrap">
                <Link to={`/product/${p.id}`}>
                  <img src={`http://localhost:5000/uploads/${p.image}`} alt={p.name} />
                </Link>
                <div className="product-card-actions">
                  <button className="product-card-btn cart" onClick={() => addToCart(p)}>Add to Bag</button>
                  <button className="product-card-btn wish" onClick={() => addToWishlist(p)}>♡</button>
                </div>
              </div>
              <div className="product-info">
                <Link to={`/product/${p.id}`} className="product-name">{p.name}</Link>
                {p.subcategory && (
                  <span className="product-sub-tag">{p.subcategory}</span>
                )}
                <p className="product-price">Rs. {p.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Products