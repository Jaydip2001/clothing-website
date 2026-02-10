import { useEffect, useState } from "react"
import axios from "axios"

function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState(null)
  const [editId, setEditId] = useState(null)

  /* ================= LOAD CATEGORIES ================= */
  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:5000/api/categories")
    setCategories(res.data)
  }

  useEffect(() => {
    const loadCategories = async () => {
      const res = await axios.get("http://localhost:5000/api/categories")
      setCategories(res.data)
    }
    loadCategories()
  }, [])

  /* ================= ADD / UPDATE ================= */
  const addOrUpdateCategory = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append("name", name)
    formData.append("description", description)
    if (image) formData.append("image", image)

    if (editId) {
      await axios.put(
        `http://localhost:5000/api/categories/${editId}`,
        formData
      )
      setEditId(null)
    } else {
      await axios.post(
        "http://localhost:5000/api/categories",
        formData
      )
    }

    setName("")
    setDescription("")
    setImage(null)

    fetchCategories()
  }

  /* ================= DELETE ================= */
  const deleteCategory = async (id) => {
  try {
    await axios.delete(`http://localhost:5000/api/categories/${id}`)
    const res = await axios.get("http://localhost:5000/api/categories")
    setCategories(res.data)
  } catch (err) {
    alert(err.response.data.message)
  }
}



  /* ================= UI ================= */
  return (
    <div>
      <h2>Manage Categories</h2>

      <form onSubmit={addOrUpdateCategory}>
        <input
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br /><br />

        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <br /><br />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <br /><br />

        <button type="submit">
          {editId ? "Update Category" : "Add Category"}
        </button>
      </form>

      <hr />

      <ul>
        {categories.map((cat) => (
          <li key={cat.id} style={{ marginBottom: "20px" }}>
            <b>{cat.name}</b> – {cat.description}
            <br />

            {cat.image && (
              <img
                src={`http://localhost:5000/uploads/${cat.image}`}
                width="100"
                alt={cat.name}
              />
            )}

            <br /><br />

            <button
              type="button"
              onClick={() => {
                setEditId(cat.id)
                setName(cat.name)
                setDescription(cat.description)
                setImage(null)
              }}
            >
              Edit
            </button>

            {" "}

            <button
              type="button"
              onClick={() => deleteCategory(cat.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AdminCategories
