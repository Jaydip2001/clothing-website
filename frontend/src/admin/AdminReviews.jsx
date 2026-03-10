import { useEffect, useState } from "react"
import axios from "axios"
import AdminLayout from "./AdminLayout"
import "./admin-css/admin.css"

function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [replies, setReplies] = useState({})
  const [search, setSearch] = useState("")  // ✅

  const fetchReviews = async () => {
    const res = await axios.get("http://localhost:5000/api/reviews")
    setReviews(res.data)
  }

  useEffect(() => { fetchReviews() }, [])

  const handleReplyChange = (id, value) => {
    setReplies(prev => ({ ...prev, [id]: value }))
  }

  const sendReply = async (id) => {
    const replyText = replies[id] || ""
    if (!replyText.trim()) { alert("Please write a reply first"); return }
    await axios.put(`http://localhost:5000/api/reviews/${id}`, { admin_reply: replyText })
    setReplies(prev => ({ ...prev, [id]: "" }))
    fetchReviews()
  }

  const deleteReview = async (id) => {
    await axios.delete(`http://localhost:5000/api/reviews/${id}`)
    fetchReviews()
  }

  // ✅ filtered — search by product, user or comment
  const filtered = reviews.filter(r =>
    r.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.comment?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="Reviews">
      <div className="page-header flex-between">
        <div>
          <h1>Manage Reviews</h1>
          <p>Reply to and moderate customer reviews</p>
        </div>
        <input
          className="form-control"
          placeholder="🔍 Search by product, user or comment..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: "300px" }}
        />
      </div>

      <div style={{ marginBottom: "8px" }} className="text-secondary">
        Showing {filtered.length} of {reviews.length} reviews
      </div>

      {filtered.length === 0 && (
        <div className="admin-card">
          <div className="admin-card-body">
            <p className="text-muted" style={{ textAlign: "center", padding: "20px" }}>No reviews found</p>
          </div>
        </div>
      )}

      {filtered.map(r => (
        <div key={r.id} className="review-card">
          <div className="review-meta">
            <span className="review-product-tag">🛍️ {r.product_name}</span>
            <span className="review-user-tag">👤 {r.user_name}</span>
            <span className="review-stars">{"⭐".repeat(r.rating)}</span>
            <span className="text-muted" style={{ fontSize: "12px" }}>{r.rating}/5</span>
          </div>
          <div className="review-comment">{r.comment}</div>
          {r.admin_reply && (
            <div className="review-admin-reply"><b>🏪 Admin Reply:</b> {r.admin_reply}</div>
          )}
          <div className="review-reply-row">
            <input
              className="form-control"
              placeholder="Write a reply..."
              value={replies[r.id] || ""}
              onChange={(e) => handleReplyChange(r.id, e.target.value)}
            />
            <button className="btn btn-primary btn-sm" onClick={() => sendReply(r.id)}>Reply</button>
            <button className="btn btn-danger btn-sm" onClick={() => deleteReview(r.id)}>Delete</button>
          </div>
        </div>
      ))}
    </AdminLayout>
  )
}

export default AdminReviews