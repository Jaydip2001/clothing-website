import { useEffect, useState } from "react"
import axios from "axios"

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [editId, setEditId] = useState(null)

  const [form, setForm] = useState({
    category_id: "",
    name: "",
    description: "",
    price: "",
    image: null,
    stock: ""
  })

  /* LOAD ON PAGE START */
  useEffect(() => {
    const fetchData = async () => {
      const c = await axios.get("http://localhost:5000/api/categories")
      const p = await axios.get("http://localhost:5000/api/products")

      setCategories(c.data)
      setProducts(p.data)
    }

    fetchData()
  }, [])

  /* REFRESH PRODUCTS ONLY */
  const refreshProducts = async () => {
    const p = await axios.get("http://localhost:5000/api/products")
    setProducts(p.data)
  }

  /* ADD OR UPDATE */
  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData()
    Object.keys(form).forEach(key => data.append(key, form[key]))

    if (editId) {
      await axios.put(`http://localhost:5000/api/products/${editId}`, data)
    } else {
      await axios.post("http://localhost:5000/api/products", data)
    }

    setEditId(null)

    setForm({
      category_id: "",
      name: "",
      description: "",
      price: "",
      image: null,
      stock: ""
    })

    refreshProducts()
  }

  /* DELETE */
  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/products/${id}`)
    refreshProducts()
  }

  /* EDIT */
  const handleEdit = (p) => {
    setEditId(p.id)

    setForm({
      category_id: p.category_id,
      name: p.name,
      description: p.description,
      price: p.price,
      image: null,
      stock: p.stock
    })
  }

  return (
    <div>
      <h2>Admin Products</h2>

      <form onSubmit={handleSubmit}>
        <select
          value={form.category_id}
          onChange={e => setForm({ ...form, category_id: e.target.value })}
          required
        >
          <option value="">Select Category</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select><br /><br />

        <input
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        /><br /><br />

        <input
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        /><br /><br />

        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
        /><br /><br />

        <input
          type="file"
          onChange={e =>
            setForm({ ...form, image: e.target.files[0] })
          }
        /><br /><br />

        <input
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={e => setForm({ ...form, stock: e.target.value })}
        /><br /><br />

        <button>{editId ? "Update Product" : "Add Product"}</button>
      </form>

      <hr />

      {products.map(p => (
        <div key={p.id}>
          <img
            src={`http://localhost:5000/uploads/${p.image}`}
            width="70"
            alt=""
          />
          <b> {p.name}</b> ({p.category}) ₹{p.price}

          <button onClick={() => handleEdit(p)}>Edit</button>
          <button onClick={() => handleDelete(p.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}

export default AdminProducts
