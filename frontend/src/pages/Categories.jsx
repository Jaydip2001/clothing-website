import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Categories() {
  const [categories, setCategories] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get("http://localhost:5000/api/categories")
      setCategories(res.data)
    }
    fetchCategories()
  }, [])

  return (
    <div>
      <h1>Categories</h1>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {categories.map((cat) => (
          <div
            key={cat.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              width: "200px",
              cursor: "pointer"
            }}
            onClick={() => navigate(`/products?category=${cat.id}`)}
          >
            {cat.image && (
              <img
                src={`http://localhost:5000/uploads/${cat.image}`}
                alt={cat.name}
                width="100%"
                height="150"
                style={{ objectFit: "cover" }}
              />
            )}

            <h3>{cat.name}</h3>
            <p>{cat.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Categories
