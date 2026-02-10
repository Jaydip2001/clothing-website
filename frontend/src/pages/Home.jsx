import { useEffect, useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"

function Home() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const catRes = await axios.get("http://localhost:5000/api/categories")
      const prodRes = await axios.get("http://localhost:5000/api/products")

      setCategories(catRes.data)
      setProducts(prodRes.data)
    }

    fetchData()
  }, [])

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

            <button>Add to Cart</button>
            <br /><br />
            <button>Buy Now</button>
            <br /><br />
            <button>❤️ Wishlist</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
