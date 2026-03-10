import { useEffect, useState } from "react"
import axios from "axios"
import AdminLayout from "./AdminLayout"
import "./admin-css/admin.css"

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")

  const [form, setForm] = useState({
    category_id: "", subcategory_id: "", name: "", description: "",
    price: "", images: [], stock: "", sizes: ""
  })

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    const [catRes, prodRes] = await Promise.all([
      axios.get("http://localhost:5000/api/categories/with-subs"),
      axios.get("http://localhost:5000/api/products")
    ])
    setCategories(catRes.data)
    setProducts(prodRes.data)
  }

  const handleCategoryChange = (category_id) => {
    setForm(prev => ({ ...prev, category_id, subcategory_id: "" }))
    const cat = categories.find(c => String(c.id) === String(category_id))
    setSubcategories(cat?.subcategories || [])
  }

  const handleEdit = (p) => {
    setEditId(p.id)
    setForm({
      category_id: p.category_id,
      subcategory_id: p.subcategory_id || "",
      name: p.name,
      description: p.description,
      price: p.price,
      images: [],
      stock: p.stock,
      sizes: p.sizes || ""
    })
    const cat = categories.find(c => String(c.id) === String(p.category_id))
    setSubcategories(cat?.subcategories || [])
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData()

    Object.keys(form).forEach(key => {
      if (key !== "images" && form[key] !== null && form[key] !== "") {
        data.append(key, form[key])
      }
    })

    // append multiple images
    if (form.images && form.images.length > 0) {
      form.images.forEach(img => data.append("images", img))
    }

    if (editId) {
      await axios.put(`http://localhost:5000/api/products/${editId}`, data)
    } else {
      await axios.post("http://localhost:5000/api/products", data)
    }

    resetForm()
    fetchAll()
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return
    await axios.delete(`http://localhost:5000/api/products/${id}`)
    fetchAll()
  }

  const resetForm = () => {
    setShowForm(false)
    setEditId(null)
    setForm({ category_id: "", subcategory_id: "", name: "", description: "", price: "", images: [], stock: "", sizes: "" })
    setSubcategories([])
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.subcategory || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="Products">
      <div className="page-header flex-between">
        <div>
          <h1>Manage Products</h1>
          <p>Add, edit and remove products</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            className="form-control"
            placeholder="🔍 Search by name, category or subcategory..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "300px" }}
          />
          <button className="btn btn-primary" onClick={() => showForm ? resetForm() : setShowForm(true)}>
            {showForm ? "✕ Cancel" : "+ Add Product"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: "24px" }}>
          <div className="admin-card-header">
            <h3>{editId ? "✏️ Edit Product" : "➕ Add New Product"}</h3>
          </div>
          <div className="admin-card-body">
            <form className="admin-form" onSubmit={handleSubmit}>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select className="form-control" value={form.category_id} onChange={e => handleCategoryChange(e.target.value)} required>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Subcategory <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "12px" }}>(optional)</span></label>
                  <select className="form-control" value={form.subcategory_id} onChange={e => setForm({ ...form, subcategory_id: e.target.value })} disabled={!form.category_id || subcategories.length === 0}>
                    <option value="">{!form.category_id ? "Select category first" : subcategories.length === 0 ? "No subcategories" : "Select Subcategory"}</option>
                    {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Product Name *</label>
                <input className="form-control" placeholder="e.g. Blue Floral Saree" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input className="form-control" placeholder="Short product description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input className="form-control" type="number" placeholder="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Stock *</label>
                  <input className="form-control" type="number" placeholder="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
                </div>
              </div>

              {/* SIZES */}
              <div className="form-group">
                <label>Available Sizes <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "12px" }}>(select all that apply)</span></label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "6px" }}>
                  {["XS", "S", "M", "L", "XL", "XXL", "Free Size"].map(size => {
                    const selected = (form.sizes || "").split(",").map(s => s.trim()).filter(Boolean)
                    const isChecked = selected.includes(size)
                    return (
                      <label key={size} style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "6px 14px",
                        border: `1.5px solid ${isChecked ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: "6px", cursor: "pointer",
                        background: isChecked ? "var(--accent-soft)" : "transparent",
                        fontSize: "13px", fontWeight: 600,
                        color: isChecked ? "var(--accent)" : "var(--text-secondary)",
                        transition: "all 0.2s"
                      }}>
                        <input type="checkbox" style={{ display: "none" }} checked={isChecked}
                          onChange={() => {
                            let arr = (form.sizes || "").split(",").map(s => s.trim()).filter(Boolean)
                            if (isChecked) arr = arr.filter(s => s !== size)
                            else arr.push(size)
                            setForm({ ...form, sizes: arr.join(",") })
                          }}
                        />
                        {size}
                      </label>
                    )
                  })}
                </div>
                {form.sizes && <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>Selected: <b style={{ color: "var(--accent)" }}>{form.sizes}</b></p>}
              </div>

              {/* MULTIPLE IMAGES */}
              <div className="form-group">
                <label>
                  Product Images
                  {editId && <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "12px", marginLeft: "6px" }}>(upload new ones to replace existing)</span>}
                </label>
                <input
                  className="form-control"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => setForm({ ...form, images: Array.from(e.target.files) })}
                />
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                  Hold <b>Ctrl</b> (or <b>Cmd</b> on Mac) to select multiple images. First image = cover photo.
                  {form.images?.length > 0 && <b style={{ color: "var(--accent)", marginLeft: "6px" }}>{form.images.length} image{form.images.length > 1 ? "s" : ""} selected ✓</b>}
                </p>

                {/* Image previews */}
                {form.images?.length > 0 && (
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                    {form.images.map((img, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`preview ${i}`}
                          style={{
                            width: "80px", height: "80px", objectFit: "cover",
                            borderRadius: "6px",
                            border: i === 0 ? "2px solid var(--accent)" : "2px solid var(--border)"
                          }}
                        />
                        {i === 0 && (
                          <span style={{
                            position: "absolute", bottom: "2px", left: "2px", right: "2px",
                            background: "var(--accent)", color: "#000",
                            fontSize: "9px", fontWeight: 700, textAlign: "center",
                            padding: "1px", borderRadius: "3px"
                          }}>COVER</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="btn btn-primary" type="submit">
                {editId ? "✓ Update Product" : "✓ Add Product"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>All Products ({filtered.length})</h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th><th>Name</th><th>Category</th><th>Subcategory</th><th>Price</th><th>Stock</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>No products found</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id}>
                <td><img src={`http://localhost:5000/uploads/${p.image}`} className="product-thumb" alt={p.name} /></td>
                <td><b>{p.name}</b></td>
                <td><span className="badge badge-shipped">{p.category}</span></td>
                <td>{p.subcategory ? <span className="badge badge-paid">{p.subcategory}</span> : <span className="text-muted" style={{ fontSize: "12px" }}>—</span>}</td>
                <td><span className="text-accent">₹{p.price}</span></td>
                <td>{p.stock}</td>
                <td style={{ display: "flex", gap: "8px" }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(p)}>✏️ Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>🗑 Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

export default AdminProducts