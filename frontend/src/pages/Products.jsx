import { useEffect, useState } from "react"
import axios from "axios"
import { useLocation } from "react-router-dom"

function Products() {
  const [products, setProducts] = useState([])
  const location = useLocation()

  const query = new URLSearchParams(location.search)
  const categoryId = query.get("category")

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

  /* ===== TEMP ACTIONS (logic comes next) ===== */
  const addToCart = (product) => {
    console.log("Add to cart:", product)
    alert("Added to cart (logic coming next)")
  }

  const buyNow = (product) => {
    console.log("Buy now:", product)
    alert("Buy now (checkout coming next)")
  }

  const addToWishlist = (product) => {
    console.log("Wishlist:", product)
    alert("Added to wishlist (logic coming next)")
  }

  return (
    <div>
      <h1>Products</h1>

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

            {/* ACTION BUTTONS */}
            <button onClick={() => addToCart(p)}>Add to Cart</button>
            <br /><br />

            <button onClick={() => buyNow(p)}>Buy Now</button>
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
