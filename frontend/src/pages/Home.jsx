import { useEffect, useState } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"

function Home() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const catRes = await axios.get("http://localhost:5000/api/categories")
      const prodRes = await axios.get("http://localhost:5000/api/products")

      setCategories(catRes.data)
      setProducts(prodRes.data)
    }

    fetchData()
  }, [])

  /* ================= ADD TO CART ================= */
  const addToCart = async (product) => {
    const user = JSON.parse(localStorage.getItem("user"))

    // LOGGED-IN USER → DB CART
    if (user) {
      await axios.post("http://localhost:5000/api/cart/add", {
        user_id: user.id,
        product_id: product.id,
        quantity: 1
      })
      alert("Added to cart")
      return
    }

    // GUEST USER → LOCAL STORAGE CART
    let cart = JSON.parse(localStorage.getItem("cart")) || []

    const existing = cart.find(item => item.product_id === product.id)

    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      })
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    alert("Added to cart")
  }

  /* ================= BUY NOW ================= */
  const buyNow = (product) => {
    addToCart(product)
    navigate("/cart")
  }

  /* ================= WISHLIST (LATER) ================= */
  const addToWishlist = (product) => {
    alert(`Wishlist coming later ❤️ (${product.name})`)
  }

  return (
    <div>
      <h1>Welcome to Clothing Store</h1>
      <p>Shop the latest fashion with us</p>

      {/* ================= CATEGORIES ================= */}
      <h2>Categories</h2>
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        {categories.map(cat => (
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
        {products.map(p => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              width: "220px"
            }}
          >
            {p.image && (
              <img
                src={`http://localhost:5000/uploads/${p.image}`}
                alt={p.name}
                width="100%"
                height="150"
                style={{ objectFit: "cover" }}
              />
            )}

            <h3>{p.name}</h3>
            <p>₹{p.price}</p>

            <button onClick={() => addToCart(p)}>
              Add to Cart
            </button>

            <br /><br />

            <button onClick={() => buyNow(p)}>
              Buy Now
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
