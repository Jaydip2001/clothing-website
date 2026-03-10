import { useEffect, useState } from "react"
import axios from "axios"
import AdminLayout from "./Adminlayout"
import "./admin-css/admin.css"

function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [search, setSearch] = useState("")

  // Category form
  const [catName, setCatName] = useState("")
  const [catDesc, setCatDesc] = useState("")
  const [catImage, setCatImage] = useState(null)
  const [editCatId, setEditCatId] = useState(null)
  const [showCatForm, setShowCatForm] = useState(false)

  // Subcategory form
  const [subName, setSubName] = useState("")
  const [subCategoryId, setSubCategoryId] = useState("")
  const [editSubId, setEditSubId] = useState(null)
  const [showSubForm, setShowSubForm] = useState(false)

  // Which category is expanded in subcategory view
  const [expandedCat, setExpandedCat] = useState(null)

  /* ── FETCH ── */
  const fetchAll = async () => {
    const [catRes, subRes] = await Promise.all([
      axios.get("http://localhost:5000/api/categories"),
      axios.get("http://localhost:5000/api/categories/subcategories")
    ])
    setCategories(catRes.data)
    setSubcategories(subRes.data)
  }
  useEffect(() => { fetchAll() }, [])

  /* ── CATEGORY CRUD ── */
  const saveCategory = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("name", catName)
    formData.append("description", catDesc)
    if (catImage) formData.append("image", catImage)

    if (editCatId) {
      await axios.put(`http://localhost:5000/api/categories/${editCatId}`, formData)
    } else {
      await axios.post("http://localhost:5000/api/categories", formData)
    }
    setCatName(""); setCatDesc(""); setCatImage(null); setEditCatId(null); setShowCatForm(false)
    fetchAll()
  }

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/categories/${id}`)
      fetchAll()
    } catch (err) { alert(err.response?.data?.message || "Error deleting") }
  }

  /* ── SUBCATEGORY CRUD ── */
  const saveSubcategory = async (e) => {
    e.preventDefault()
    if (editSubId) {
      await axios.put(`http://localhost:5000/api/categories/subcategories/${editSubId}`, { name: subName })
    } else {
      await axios.post("http://localhost:5000/api/categories/subcategories", {
        category_id: subCategoryId,
        name: subName
      })
    }
    setSubName(""); setSubCategoryId(""); setEditSubId(null); setShowSubForm(false)
    fetchAll()
  }

  const deleteSubcategory = async (id) => {
    if (!window.confirm("Delete this subcategory?")) return
    await axios.delete(`http://localhost:5000/api/categories/subcategories/${id}`)
    fetchAll()
  }

  const getSubsForCat = (catId) => subcategories.filter(s => s.category_id === catId)

  const filteredCats = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="Categories">

      <div className="page-header flex-between">
        <div>
          <h1>Categories & Subcategories</h1>
          <p>Manage main categories and their subcategories</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            className="form-control"
            placeholder="🔍 Search categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "220px" }}
          />
          <button className="btn btn-ghost" onClick={() => {
            setShowSubForm(!showSubForm); setShowCatForm(false)
            setEditSubId(null); setSubName(""); setSubCategoryId("")
          }}>
            {showSubForm ? "✕ Cancel" : "+ Add Subcategory"}
          </button>
          <button className="btn btn-primary" onClick={() => {
            setShowCatForm(!showCatForm); setShowSubForm(false)
            setEditCatId(null); setCatName(""); setCatDesc(""); setCatImage(null)
          }}>
            {showCatForm ? "✕ Cancel" : "+ Add Category"}
          </button>
        </div>
      </div>

      {/* ── ADD/EDIT CATEGORY FORM ── */}
      {showCatForm && (
        <div className="admin-card" style={{ marginBottom: "24px" }}>
          <div className="admin-card-header">
            <h3>{editCatId ? "✏️ Edit Category" : "➕ Add Category"}</h3>
          </div>
          <div className="admin-card-body">
            <form className="admin-form" onSubmit={saveCategory}>
              <div className="form-row">
                <div className="form-group">
                  <label>Category Name *</label>
                  <input className="form-control" placeholder="e.g. Woman" value={catName}
                    onChange={e => setCatName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input className="form-control" placeholder="Short description..." value={catDesc}
                    onChange={e => setCatDesc(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Category Image</label>
                <input className="form-control" type="file" accept="image/*"
                  onChange={e => setCatImage(e.target.files[0])} />
              </div>
              <button className="btn btn-primary" type="submit">
                {editCatId ? "✓ Update Category" : "✓ Add Category"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD/EDIT SUBCATEGORY FORM ── */}
      {showSubForm && (
        <div className="admin-card" style={{ marginBottom: "24px" }}>
          <div className="admin-card-header">
            <h3>{editSubId ? "✏️ Edit Subcategory" : "➕ Add Subcategory"}</h3>
          </div>
          <div className="admin-card-body">
            <form className="admin-form" onSubmit={saveSubcategory}>
              <div className="form-row">
                <div className="form-group">
                  <label>Parent Category *</label>
                  <select className="form-control" value={subCategoryId}
                    onChange={e => setSubCategoryId(e.target.value)} required disabled={!!editSubId}>
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Subcategory Name *</label>
                  <input className="form-control" placeholder="e.g. Western Wear" value={subName}
                    onChange={e => setSubName(e.target.value)} required />
                </div>
              </div>
              <button className="btn btn-primary" type="submit">
                {editSubId ? "✓ Update Subcategory" : "✓ Add Subcategory"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── CATEGORIES TABLE WITH EXPANDABLE SUBS ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>All Categories ({filteredCats.length})</h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Category</th>
              <th>Description</th>
              <th>Subcategories</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCats.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>No categories found</td></tr>
            ) : filteredCats.map(cat => {
              const subs = getSubsForCat(cat.id)
              const isExpanded = expandedCat === cat.id
              return (
                <>
                  {/* CATEGORY ROW */}
                  <tr key={cat.id}>
                    <td>
                      {cat.image
                        ? <img src={`http://localhost:5000/uploads/${cat.image}`} className="product-thumb" alt={cat.name} />
                        : <div style={{ width: 44, height: 44, background: "var(--bg-hover)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>🗂️</div>
                      }
                    </td>
                    <td><b style={{ fontSize: "15px" }}>{cat.name}</b></td>
                    <td className="text-secondary">{cat.description || "—"}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                      >
                        {isExpanded ? "▲ Hide" : `▼ ${subs.length} subcategor${subs.length === 1 ? "y" : "ies"}`}
                      </button>
                    </td>
                    <td style={{ display: "flex", gap: "8px" }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => {
                        setEditCatId(cat.id); setCatName(cat.name); setCatDesc(cat.description || "")
                        setCatImage(null); setShowCatForm(true); setShowSubForm(false)
                      }}>✏️ Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteCategory(cat.id)}>🗑 Delete</button>
                    </td>
                  </tr>

                  {/* SUBCATEGORY ROWS — expanded */}
                  {isExpanded && (
                    <tr key={`subs-${cat.id}`}>
                      <td colSpan="5" style={{ padding: "0 0 0 60px", background: "var(--bg-surface)" }}>
                        <div style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                            <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-secondary)" }}>
                              Subcategories of <b style={{ color: "var(--text-primary)" }}>{cat.name}</b>
                            </span>
                            <button className="btn btn-ghost btn-sm" onClick={() => {
                              setSubCategoryId(cat.id); setSubName(""); setEditSubId(null)
                              setShowSubForm(true); setShowCatForm(false)
                            }}>
                              + Add Subcategory
                            </button>
                          </div>

                          {subs.length === 0 ? (
                            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No subcategories yet. Click "+ Add Subcategory" to add one.</p>
                          ) : (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                              {subs.map(sub => (
                                <div key={sub.id} style={{
                                  display: "flex", alignItems: "center", gap: "8px",
                                  background: "var(--bg-card)", border: "1px solid var(--border)",
                                  borderRadius: "8px", padding: "8px 14px"
                                }}>
                                  <span style={{ fontSize: "13px", fontWeight: 500 }}>{sub.name}</span>
                                  <button
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: "12px" }}
                                    onClick={() => {
                                      setEditSubId(sub.id); setSubName(sub.name)
                                      setSubCategoryId(sub.category_id)
                                      setShowSubForm(true); setShowCatForm(false)
                                    }}
                                  >✏️</button>
                                  <button
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontSize: "12px" }}
                                    onClick={() => deleteSubcategory(sub.id)}
                                  >🗑</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

export default AdminCategories