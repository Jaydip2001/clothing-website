import { useEffect, useState } from "react"
import axios from "axios"
import { useLocation, useNavigate } from "react-router-dom"

function Products() {
  const [products, setProducts] = useState([])
  const location = useLocation()
  const navigate = useNavigate()

  const query = new URLSearchParams(location.search)
  const categoryId = query.get("category")

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      const url = categoryId
        ? `http://localhost:5000/api/products?category=${categoryId}`
        : `http://localhost:5000/api/products`

      const res = await axios.get(url)
      setProducts(res.data)
    }

    fetchProducts()
  }, [categoryId])

  /* ================= ADD TO CART (GUEST + USER) ================= */
  const addToCart = (product) => {
    const user = JSON.parse(localStorage.getItem("user"))

    // 🧑 LOGGED-IN USER → DB CART (later sync)
    if (user) {
      axios.post("http://localhost:5000/api/cart/add", {
        user_id: user.id,
        product_id: product.id,
        quantity: 1
      })
      alert("Added to cart")
      return
    }

    // 👤 GUEST USER → LOCAL STORAGE CART
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

  /* ================= UI ================= */
  return (
    <div>
      <h1>All Products</h1>

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

export default Products
